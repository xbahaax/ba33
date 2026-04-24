import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../model/transport_job.dart' show TransportLane, TransportLot;
import '../../trip/view_model/active_trip_view_model.dart';
import '../../../shared/widgets/lane_badge.dart';
import '../../../shared/widgets/sla_countdown.dart';

class JobDetailScreen extends ConsumerWidget {
  const JobDetailScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trip = ref.watch(activeTripProvider);
    if (trip == null) {
      return const Scaffold(body: Center(child: Text('No job selected')));
    }
    final job = trip.job;
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text(
          'Mission',
          style: textTheme.titleLarge,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          Padding(
            padding:
                const EdgeInsets.only(right: Ba33Spacing.spacing4),
            child: LaneBadge(lane: job.lane),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Job ID
            Row(
              children: [
                Text(
                  job.id,
                  style: Ba33Typography.mono(
                    fontSize: 12,
                    color: colors.mutedForeground,
                  ),
                ),
                const Spacer(),
                if (job.slaDeadline != null)
                  SlaCountdown(deadline: job.slaDeadline!),
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // Route card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              decoration: BoxDecoration(
                color: colors.card,
                borderRadius: Ba33Radii.borderRadiusLg,
                border: Border.all(color: colors.border),
              ),
              child: Column(
                children: [
                  _LocationRow(
                    icon: '🏭',
                    label: 'DÉPART',
                    name: job.originName,
                    type: job.originType,
                    colors: colors,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        vertical: Ba33Spacing.spacing3),
                    child: Row(
                      children: [
                        const SizedBox(width: 40),
                        Expanded(
                          child: Column(
                            children: [
                              Container(
                                height: 24,
                                width: 2,
                                color: colors.border,
                              ),
                              Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: colors.muted,
                                  borderRadius: Ba33Radii.borderRadiusFull,
                                ),
                                child: Icon(
                                  Icons.arrow_downward,
                                  size: 16,
                                  color: colors.mutedForeground,
                                ),
                              ),
                              Container(
                                height: 24,
                                width: 2,
                                color: colors.border,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  _LocationRow(
                    icon: '🫧',
                    label: 'DESTINATION',
                    name: job.destinationName,
                    type: job.destinationType,
                    colors: colors,
                  ),
                ],
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // Summary stats
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    label: 'Lots',
                    value: '${job.lots.length}',
                    icon: Icons.inventory_2_outlined,
                    colors: colors,
                  ),
                ),
                const SizedBox(width: Ba33Spacing.spacing3),
                Expanded(
                  child: _StatCard(
                    label: 'Poids total',
                    value:
                        '${job.totalDeclaredWeight.toStringAsFixed(1)} kg',
                    icon: Icons.scale_outlined,
                    mono: true,
                    colors: colors,
                  ),
                ),
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // Lots list
            Text('Lots à transporter', style: textTheme.titleMedium),
            const SizedBox(height: Ba33Spacing.spacing3),
            ...job.lots.map((lot) => _LotItem(lot: lot, colors: colors)),
            const SizedBox(height: Ba33Spacing.spacing6),

            // Urgent warning
            if (job.isUrgent)
              Container(
                padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                decoration: BoxDecoration(
                  color: colors.destructive.withOpacity(0.08),
                  borderRadius: Ba33Radii.borderRadiusLg,
                  border:
                      Border.all(color: colors.destructive.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber_rounded,
                        color: colors.destructive, size: 20),
                    const SizedBox(width: Ba33Spacing.spacing3),
                    Expanded(
                      child: Text(
                        job.lane == TransportLane.urgentColdChain
                            ? 'Transport frigorifique requis. Vérifiez la température avant chargement.'
                            : 'Mission urgente. Respectez le délai SLA.',
                        style: textTheme.bodySmall
                            ?.copyWith(color: colors.destructive),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: Ba33Spacing.spacing6),

            // Action button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => context.push('/scan-load'),
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Commencer le chargement'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    vertical: Ba33Spacing.spacing4,
                  ),
                ),
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
          ],
        ),
      ),
    );
  }
}

class _LocationRow extends StatelessWidget {
  const _LocationRow({
    required this.icon,
    required this.label,
    required this.name,
    required this.type,
    required this.colors,
  });

  final String icon;
  final String label;
  final String name;
  final String type;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: colors.muted,
            borderRadius: Ba33Radii.borderRadiusMd,
          ),
          child: Center(child: Text(icon, style: const TextStyle(fontSize: 18))),
        ),
        const SizedBox(width: Ba33Spacing.spacing3),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1,
                  color: colors.mutedForeground,
                ),
              ),
              Text(name, style: textTheme.titleSmall),
              Text(
                type.toUpperCase(),
                style: textTheme.bodySmall
                    ?.copyWith(color: colors.mutedForeground),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.colors,
    this.mono = false,
  });

  final String label;
  final String value;
  final IconData icon;
  final Ba33Colors colors;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Container(
      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: Ba33Radii.borderRadiusLg,
        border: Border.all(color: colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: colors.mutedForeground),
          const SizedBox(height: Ba33Spacing.spacing2),
          mono
              ? Text(
                  value,
                  style: Ba33Typography.mono(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: colors.foreground,
                  ),
                )
              : Text(
                  value,
                  style: textTheme.titleMedium,
                ),
          Text(
            label,
            style: textTheme.bodySmall?.copyWith(color: colors.mutedForeground),
          ),
        ],
      ),
    );
  }
}

class _LotItem extends StatelessWidget {
  const _LotItem({required this.lot, required this.colors});

  final TransportLot lot;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: Ba33Spacing.spacing2),
      padding: const EdgeInsets.symmetric(
        horizontal: Ba33Spacing.spacing4,
        vertical: Ba33Spacing.spacing3,
      ),
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: Ba33Radii.borderRadiusMd,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: colors.secondary,
              borderRadius: Ba33Radii.borderRadiusSm,
            ),
            child: Text(
              lot.sourceType,
              style: Ba33Typography.mono(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: colors.secondaryForeground,
              ),
            ),
          ),
          const SizedBox(width: Ba33Spacing.spacing3),
          Expanded(
            child: Text(
              lot.qrCode,
              style: Ba33Typography.mono(
                fontSize: 12,
                color: colors.foreground,
              ),
            ),
          ),
          Text(
            '${lot.declaredWeight.toStringAsFixed(1)} kg',
            style: Ba33Typography.mono(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: colors.foreground,
            ),
          ),
        ],
      ),
    );
  }
}
