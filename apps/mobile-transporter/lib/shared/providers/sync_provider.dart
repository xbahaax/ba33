import 'dart:convert';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'api_provider.dart';
import 'database_provider.dart';

part 'sync_provider.g.dart';

class SyncState {
  const SyncState({
    this.pendingCount = 0,
    this.isSyncing = false,
    this.lastSyncAt,
  });

  final int pendingCount;
  final bool isSyncing;
  final DateTime? lastSyncAt;

  bool get hasPending => pendingCount > 0;

  SyncState copyWith({
    int? pendingCount,
    bool? isSyncing,
    DateTime? lastSyncAt,
  }) =>
      SyncState(
        pendingCount: pendingCount ?? this.pendingCount,
        isSyncing: isSyncing ?? this.isSyncing,
        lastSyncAt: lastSyncAt ?? this.lastSyncAt,
      );
}

@Riverpod(keepAlive: true)
class SyncQueue extends _$SyncQueue {
  @override
  SyncState build() => const SyncState();

  Future<void> queueEvent({
    required String eventType,
    required String jobId,
    required Map<String, dynamic> payload,
  }) async {
    await ref.read(appDatabaseProvider).queueEvent(
          eventType: eventType,
          jobId: jobId,
          payload: payload,
        );
    await _refreshCount();
  }

  Future<void> _refreshCount() async {
    final count =
        await ref.read(appDatabaseProvider).getPendingEventCount();
    state = state.copyWith(pendingCount: count);
  }

  /// Syncs pending events to the backend via POST /events.
  Future<void> sync() async {
    if (state.isSyncing || !state.hasPending) return;
    state = state.copyWith(isSyncing: true);

    try {
      final db = ref.read(appDatabaseProvider);
      final eventsSvc = ref.read(eventsSyncServiceProvider);

      final pending = await db.getPendingEvents();
      if (pending.isEmpty) {
        state = state.copyWith(isSyncing: false, pendingCount: 0);
        return;
      }

      // Build the batch payload
      final events = pending.map((e) {
        final payload = jsonDecode(e.payload) as Map<String, dynamic>;
        return <String, dynamic>{
          'eventType': e.eventType,
          'jobId': e.jobId,
          'payload': payload,
          'recordedAt': e.createdAt.toIso8601String(),
        };
      }).toList();

      await eventsSvc.postEvents(events);

      // Mark all as synced on success
      for (final e in pending) {
        await db.markEventSynced(e.id);
      }

      state = state.copyWith(
        isSyncing: false,
        pendingCount: 0,
        lastSyncAt: DateTime.now(),
      );
    } catch (_) {
      // On failure, keep events pending for retry
      await _refreshCount();
      state = state.copyWith(isSyncing: false);
    }
  }

  Future<void> refreshCount() => _refreshCount();
}
