import 'package:riverpod_annotation/riverpod_annotation.dart';

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

  /// Attempts to sync pending events to the backend.
  /// With a real backend, this would make HTTP calls.
  /// For now it simulates a successful sync after a short delay.
  Future<void> sync() async {
    if (state.isSyncing || !state.hasPending) return;
    state = state.copyWith(isSyncing: true);

    // Simulate network call
    await Future.delayed(const Duration(seconds: 2));

    final db = ref.read(appDatabaseProvider);
    final pending = await db.getPendingEvents();
    for (final event in pending) {
      await db.markEventSynced(event.id);
    }

    state = state.copyWith(
      isSyncing: false,
      pendingCount: 0,
      lastSyncAt: DateTime.now(),
    );
  }

  Future<void> refreshCount() => _refreshCount();
}
