import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../model/transport_job.dart';
import '../view_model/job_list_view_model.dart';
import '../../trip/view_model/active_trip_view_model.dart';
import '../../a1_alert/view_model/a1_alert_view_model.dart';
import '../../a1_alert/view/a1_alert_screen.dart';
import '../../../shared/providers/connectivity_provider.dart';
import '../../../shared/widgets/lane_badge.dart';
import '../../../shared/widgets/sla_countdown.dart';

class JobListScreen extends ConsumerWidget {
  const JobListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;
    final jobsAsync = ref.watch(jobListProvider);
    final a1Alert = ref.watch(a1AlertNotifierProvider);
    final isOnline = ref.watch(connectivityNotifierProvider);
    final activeTrip = ref.watch(activeTripProvider);

    final hasActiveUrgentJob = activeTrip != null &&
        activeTrip.job.isUrgent &&
        activeTrip.phase != TripPhase.completed;

    return Scaffold(
      backgroundColor: colors.background,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/farmer-declare'),
        icon: const Icon(Icons.add_circle_outline),
        label: const Text('صرح على فلاح'),
        backgroundColor: colors.primary,
        foregroundColor: colors.primaryForeground,
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Offline banner ───────────────────────
            if (!isOnline)
              Container(
                width: double.infinity,
                color: colors.destructive,
                padding: const EdgeInsets.symmetric(
                  horizontal: Ba33Spacing.spacing4,
                  vertical: Ba33Spacing.spacing2,
                ),
                child: Row(
                  children: [
                    Icon(Icons.wifi_off,
                        size: 14, color: colors.destructiveForeground),
                    const SizedBox(width: Ba33Spacing.spacing2),
                    Text(
                      'بلا انترنت — السكانات محفوظين محلي',
                      style: TextStyle(
                        fontSize: 12,
                        color: colors.destructiveForeground,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

            // ── A1 alert banner ──────────────────────
            if (a1Alert != null)
              GestureDetector(
                onTap: () => showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => A1AlertScreen(alert: a1Alert),
                ),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(Ba33Spacing.spacing3),
                  decoration: BoxDecoration(
                    color: colors.destructive,
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.warning_rounded,
                          color: colors.destructiveForeground, size: 18),
                      const SizedBox(width: Ba33Spacing.spacing2),
                      Expanded(
                        child: Text(
                          '● تنبيه A1 — ${a1Alert.depotName} — اضغط باش تقبل',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: colors.destructiveForeground,
                          ),
                        ),
                      ),
                      Icon(Icons.chevron_right,
                          color: colors.destructiveForeground, size: 18),
                    ],
                  ),
                ),
              ),

            // ── Header ───────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(
                Ba33Spacing.spacing6,
                Ba33Spacing.spacing4,
                Ba33Spacing.spacing4,
                Ba33Spacing.spacing3,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text('صباح الخير، محمد',
                                style: textTheme.headlineSmall),
                            const SizedBox(width: Ba33Spacing.spacing2),
                            Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: isOnline
                                    ? colors.primary
                                    : colors.destructive,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          'مهام اليوم',
                          style: textTheme.bodySmall
                              ?.copyWith(color: colors.mutedForeground),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () =>
                        ref.read(jobListProvider.notifier).refresh(),
                    icon: Icon(Icons.refresh, color: colors.mutedForeground),
                  ),
                ],
              ),
            ),

            // ── Urgent-lane block banner ─────────────
            if (hasActiveUrgentJob)
              Container(
                margin: const EdgeInsets.symmetric(
                  horizontal: Ba33Spacing.spacing4,
                  vertical: Ba33Spacing.spacing2,
                ),
                padding: const EdgeInsets.all(Ba33Spacing.spacing3),
                decoration: BoxDecoration(
                  color: colors.destructive.withAlpha(15),
                  borderRadius: Ba33Radii.borderRadiusMd,
                  border: Border.all(
                      color: colors.destructive.withAlpha(80)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.lock_outline,
                        color: colors.destructive, size: 16),
                    const SizedBox(width: Ba33Spacing.spacing2),
                    Expanded(
                      child: Text(
                        'مهمة مستعجلة جارية — المهام العادية محبوسين',
                        style: textTheme.bodySmall
                            ?.copyWith(color: colors.destructive),
                      ),
                    ),
                    TextButton(
                      onPressed: () =>
                          _showSupervisorOverride(context, ref),
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        foregroundColor: colors.destructive,
                        textStyle: const TextStyle(fontSize: 11),
                      ),
                      child: const Text('المشرف'),
                    ),
                  ],
                ),
              ),

            // ── Job list ─────────────────────────────
            Expanded(
              child: jobsAsync.when(
                loading: () => Center(
                  child: CircularProgressIndicator(color: colors.primary),
                ),
                error: (e, _) => Center(
                  child: Text('خطأ في التحميل',
                      style: textTheme.bodyMedium
                          ?.copyWith(color: colors.destructive)),
                ),
                data: (jobs) {
                  final urgent =
                      jobs.where((j) => j.isUrgent).toList();
                  final normal =
                      jobs.where((j) => !j.isUrgent).toList();

                  return RefreshIndicator(
                    color: colors.primary,
                    onRefresh: () =>
                        ref.read(jobListProvider.notifier).refresh(),
                    child: ListView(
                      padding: const EdgeInsets.symmetric(
                          horizontal: Ba33Spacing.spacing4),
                      children: [
                        if (urgent.isNotEmpty) ...[
                          _SectionHeader(
                              label: 'مستعجل',
                              color: colors.destructive,
                              count: urgent.length),
                          ...urgent.map((job) => _JobCard(
                                job: job,
                                locked: false,
                                onTap: () => _openJob(context, ref, job),
                              )),
                          const SizedBox(height: Ba33Spacing.spacing4),
                        ],
                        if (normal.isNotEmpty) ...[
                          _SectionHeader(
                              label: 'موكلين',
                              color: colors.mutedForeground,
                              count: normal.length),
                          ...normal.map((job) => _JobCard(
                                job: job,
                                locked: hasActiveUrgentJob,
                                onTap: hasActiveUrgentJob
                                    ? () => _showSupervisorOverride(
                                        context, ref,
                                        pendingJob: job)
                                    : () => _openJob(context, ref, job),
                              )),
                        ],
                        const SizedBox(height: Ba33Spacing.spacing8),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openJob(BuildContext context, WidgetRef ref, TransportJob job) {
    ref.read(activeTripProvider.notifier).startJob(job);
    context.push('/job-detail');
  }

  void _showSupervisorOverride(BuildContext context, WidgetRef ref,
      {TransportJob? pendingJob}) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        final colors = Theme.of(ctx).ba33;
        return AlertDialog(
          title: const Text('تصريح المشرف'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'دخل كود المشرف باش تفتح.',
                style: Theme.of(ctx).textTheme.bodySmall?.copyWith(
                      color: colors.mutedForeground,
                    ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              TextField(
                controller: controller,
                obscureText: true,
                keyboardType: TextInputType.number,
                maxLength: 4,
                decoration: const InputDecoration(
                  hintText: 'كود PIN',
                  counterText: '',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                if (pendingJob != null) {
                  _openJob(context, ref, pendingJob);
                }
              },
              child: const Text('أكد'),
            ),
          ],
        );
      },
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(
      {required this.label, required this.color, required this.count});

  final String label;
  final Color color;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
          Ba33Spacing.spacing2, Ba33Spacing.spacing2,
          Ba33Spacing.spacing2, Ba33Spacing.spacing3),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 14,
            decoration: BoxDecoration(
              color: color,
              borderRadius: Ba33Radii.borderRadiusFull,
            ),
          ),
          const SizedBox(width: Ba33Spacing.spacing2),
          Text(label,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                  color: color)),
          const SizedBox(width: Ba33Spacing.spacing2),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: color.withAlpha(30),
              borderRadius: Ba33Radii.borderRadiusFull,
            ),
            child: Text('$count',
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: color)),
          ),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard(
      {required this.job, required this.locked, required this.onTap});

  final TransportJob job;
  final bool locked;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return GestureDetector(
      onTap: onTap,
      child: Opacity(
        opacity: locked ? 0.5 : 1.0,
        child: Container(
          margin: const EdgeInsets.only(bottom: Ba33Spacing.spacing3),
          decoration: BoxDecoration(
            color: colors.card,
            borderRadius: Ba33Radii.borderRadiusLg,
            border: Border.all(
              color: job.isUrgent
                  ? colors.destructive.withAlpha(100)
                  : colors.border,
            ),
            boxShadow: job.isUrgent ? Ba33Shadows.shadowSm : null,
          ),
          child: Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        LaneBadge(lane: job.lane),
                        const Spacer(),
                        if (job.slaDeadline != null)
                          SlaCountdown(deadline: job.slaDeadline!),
                      ],
                    ),
                    const SizedBox(height: Ba33Spacing.spacing3),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_locationIcon(job.originType),
                                  style: const TextStyle(fontSize: 18)),
                              const SizedBox(height: 2),
                              Text(job.originName,
                                  style: textTheme.titleSmall,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis),
                              Text(job.originType.toUpperCase(),
                                  style: textTheme.labelSmall?.copyWith(
                                      color: colors.mutedForeground)),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: Ba33Spacing.spacing3),
                          child: Icon(Icons.arrow_forward,
                              color: colors.mutedForeground, size: 20),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(_locationIcon(job.destinationType),
                                  style: const TextStyle(fontSize: 18)),
                              const SizedBox(height: 2),
                              Text(job.destinationName,
                                  style: textTheme.titleSmall,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.end),
                              Text(job.destinationType.toUpperCase(),
                                  style: textTheme.labelSmall?.copyWith(
                                      color: colors.mutedForeground),
                                  textAlign: TextAlign.end),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: Ba33Spacing.spacing3),
                    Divider(color: colors.border, height: 1),
                    const SizedBox(height: Ba33Spacing.spacing3),
                    Row(
                      children: [
                        _Stat(
                            icon: Icons.inventory_2_outlined,
                            label: '${job.lots.length} لوت',
                            colors: colors),
                        const SizedBox(width: Ba33Spacing.spacing4),
                        _Stat(
                          icon: Icons.scale_outlined,
                          label:
                              '${job.totalDeclaredWeight.toStringAsFixed(1)} كغ',
                          mono: true,
                          colors: colors,
                        ),
                        const Spacer(),
                        Icon(locked ? Icons.lock_outline : Icons.chevron_right,
                            color: colors.mutedForeground, size: 20),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _locationIcon(String type) => switch (type) {
        'depot' => '🏭',
        'laverie' => '🫧',
        'source' => '🐑',
        'transformer' => '🏗️',
        _ => '📍',
      };
}

class _Stat extends StatelessWidget {
  const _Stat(
      {required this.icon,
      required this.label,
      required this.colors,
      this.mono = false});

  final IconData icon;
  final String label;
  final Ba33Colors colors;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: colors.mutedForeground),
        const SizedBox(width: 4),
        mono
            ? Text(label,
                style: Ba33Typography.mono(
                    fontSize: 12, color: colors.foreground))
            : Text(label,
                style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
