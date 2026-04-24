import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../jobs/model/transport_job.dart';
import '../view_model/active_trip_view_model.dart';
import '../../../shared/providers/gps_provider.dart';
import '../../../shared/providers/sync_provider.dart';
import '../../../shared/widgets/lane_badge.dart';
import '../../../shared/widgets/sla_countdown.dart';

class ActiveTripScreen extends ConsumerWidget {
  const ActiveTripScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trip = ref.watch(activeTripProvider);
    if (trip == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final job = trip.job;
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;
    final isColdChain = job.lane == TransportLane.urgentColdChain;
    final gps = ref.watch(gpsTrackerProvider);
    final sync = ref.watch(syncQueueProvider);

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('En route', style: textTheme.titleLarge),
        automaticallyImplyLeading: false,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: Ba33Spacing.spacing4),
            child: LaneBadge(lane: job.lane),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── GPS tracking banner ──────────────────
            Container(
              padding: const EdgeInsets.all(Ba33Spacing.spacing3),
              decoration: BoxDecoration(
                color: gps.isTracking
                    ? colors.primary.withAlpha(20)
                    : colors.muted,
                borderRadius: Ba33Radii.borderRadiusLg,
                border: Border.all(
                  color: gps.isTracking
                      ? colors.primary.withAlpha(50)
                      : colors.border,
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      _PulsingDot(
                          color: gps.isTracking
                              ? colors.primary
                              : colors.mutedForeground),
                      const SizedBox(width: Ba33Spacing.spacing3),
                      Expanded(
                        child: Text(
                          gps.isTracking
                              ? 'GPS actif — ${gps.pointsRecorded} points enregistrés'
                              : gps.hasPermission
                                  ? 'GPS en attente…'
                                  : 'Permission GPS refusée',
                          style: textTheme.bodySmall?.copyWith(
                            color: gps.isTracking
                                ? colors.primary
                                : colors.mutedForeground,
                          ),
                        ),
                      ),
                      if (job.slaDeadline != null)
                        SlaCountdown(deadline: job.slaDeadline!),
                    ],
                  ),
                  if (gps.lastPoint != null) ...[
                    const SizedBox(height: Ba33Spacing.spacing2),
                    Row(
                      children: [
                        const SizedBox(width: 18),
                        Text(
                          '${gps.lastPoint!.lat.toStringAsFixed(5)}, '
                          '${gps.lastPoint!.lng.toStringAsFixed(5)}',
                          style: Ba33Typography.mono(
                              fontSize: 11,
                              color: colors.mutedForeground),
                        ),
                        const SizedBox(width: Ba33Spacing.spacing3),
                        Text(
                          gps.lastPoint!.speedLabel,
                          style: Ba33Typography.mono(
                              fontSize: 11, color: colors.primary),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            // ── Sync status ──────────────────────────
            if (sync.hasPending) ...[
              const SizedBox(height: Ba33Spacing.spacing2),
              GestureDetector(
                onTap: () =>
                    ref.read(syncQueueProvider.notifier).sync(),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: Ba33Spacing.spacing3,
                    vertical: Ba33Spacing.spacing2,
                  ),
                  decoration: BoxDecoration(
                    color: colors.muted,
                    borderRadius: Ba33Radii.borderRadiusMd,
                  ),
                  child: Row(
                    children: [
                      sync.isSyncing
                          ? SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: colors.primary,
                              ),
                            )
                          : Icon(Icons.cloud_upload_outlined,
                              size: 14,
                              color: colors.mutedForeground),
                      const SizedBox(width: Ba33Spacing.spacing2),
                      Text(
                        sync.isSyncing
                            ? 'Synchronisation…'
                            : '${sync.pendingCount} événements en attente — Appuyer pour sync',
                        style: textTheme.bodySmall
                            ?.copyWith(color: colors.mutedForeground),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: Ba33Spacing.spacing4),

            // ── Temperature logging (cold chain) ─────
            if (isColdChain)
              _TemperatureCard(trip: trip, ref: ref, colors: colors),

            if (isColdChain) const SizedBox(height: Ba33Spacing.spacing4),

            // ── Map placeholder ──────────────────────
            Container(
              height: 160,
              decoration: BoxDecoration(
                color: colors.muted,
                borderRadius: Ba33Radii.borderRadiusLg,
                border: Border.all(color: colors.border),
              ),
              child: Stack(
                children: [
                  CustomPaint(
                    size: const Size(double.infinity, 160),
                    painter: _FakeMapPainter(colors),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: colors.primary,
                            borderRadius: Ba33Radii.borderRadiusSm,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.navigation,
                                  size: 12,
                                  color: colors.primaryForeground),
                              const SizedBox(width: 4),
                              Text('Navigation active',
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: colors.primaryForeground,
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                        const Spacer(),
                        Text('→  ${job.destinationName}',
                            style: textTheme.titleMedium),
                        Text(job.destinationType.toUpperCase(),
                            style: textTheme.bodySmall
                                ?.copyWith(color: colors.mutedForeground)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // ── Loaded lots ──────────────────────────
            Text('Lots chargés', style: textTheme.titleMedium),
            const SizedBox(height: Ba33Spacing.spacing3),
            ...job.lots.map((lot) => _LoadedLotTile(lot: lot, colors: colors)),
            const SizedBox(height: Ba33Spacing.spacing3),

            // Weight summary
            Container(
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              decoration: BoxDecoration(
                color: colors.card,
                borderRadius: Ba33Radii.borderRadiusLg,
                border: Border.all(color: colors.border),
              ),
              child: Row(
                children: [
                  Icon(Icons.scale_outlined,
                      size: 18, color: colors.mutedForeground),
                  const SizedBox(width: Ba33Spacing.spacing2),
                  Text('Poids total chargé',
                      style: textTheme.bodyMedium),
                  const Spacer(),
                  Text(
                    '${job.totalLoadedWeight.toStringAsFixed(1)} kg',
                    style: Ba33Typography.mono(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: colors.foreground),
                  ),
                ],
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),

            // ── Deliver button ───────────────────────
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ref.read(activeTripProvider.notifier).startDelivering();
                  context.push('/scan-delivery');
                },
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Arrivé — Commencer la livraison'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                      vertical: Ba33Spacing.spacing4),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Temperature card ──────────────────────────────────────
class _TemperatureCard extends StatefulWidget {
  const _TemperatureCard(
      {required this.trip, required this.ref, required this.colors});

  final ActiveTripState trip;
  final WidgetRef ref;
  final Ba33Colors colors;

  @override
  State<_TemperatureCard> createState() => _TemperatureCardState();
}

class _TemperatureCardState extends State<_TemperatureCard> {
  final _ctrl = TextEditingController();
  bool _showInput = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _logTemp() {
    final temp = double.tryParse(_ctrl.text);
    if (temp == null) return;
    widget.ref.read(activeTripProvider.notifier).logTemperature(temp);
    _ctrl.clear();
    setState(() => _showInput = false);
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final readings = widget.trip.temperatureReadings;
    final latest = widget.trip.latestTemperature;
    final hasAlert = widget.trip.hasTempAlert;
    final colors = widget.colors;

    return Container(
      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
      decoration: BoxDecoration(
        color: hasAlert
            ? colors.destructive.withAlpha(10)
            : colors.card,
        borderRadius: Ba33Radii.borderRadiusLg,
        border: Border.all(
          color: hasAlert
              ? colors.destructive.withAlpha(80)
              : colors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.ac_unit,
                size: 18,
                color: hasAlert ? colors.destructive : colors.primary,
              ),
              const SizedBox(width: Ba33Spacing.spacing2),
              Text('Chaîne du froid', style: textTheme.titleSmall),
              const Spacer(),
              if (latest != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: hasAlert
                        ? colors.destructive
                        : colors.primary,
                    borderRadius: Ba33Radii.borderRadiusFull,
                  ),
                  child: Text(
                    '${latest.toStringAsFixed(1)} °C',
                    style: Ba33Typography.mono(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: hasAlert
                          ? colors.destructiveForeground
                          : colors.primaryForeground,
                    ),
                  ),
                ),
            ],
          ),
          if (hasAlert) ...[
            const SizedBox(height: Ba33Spacing.spacing2),
            Row(
              children: [
                Icon(Icons.warning_amber,
                    color: colors.destructive, size: 14),
                const SizedBox(width: 4),
                Text(
                  'Température hors chaîne du froid (max ${TemperatureReading.coldChainMax} °C)',
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.destructive),
                ),
              ],
            ),
          ],
          const SizedBox(height: Ba33Spacing.spacing3),

          // Recent readings
          if (readings.isNotEmpty) ...[
            ...readings.reversed.take(3).map((r) {
              final t = r.recordedAt;
              final label =
                  '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
              return Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Text(label,
                        style: Ba33Typography.mono(
                            fontSize: 11, color: colors.mutedForeground)),
                    const SizedBox(width: Ba33Spacing.spacing3),
                    Text('${r.temperature.toStringAsFixed(1)} °C',
                        style: Ba33Typography.mono(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: r.isAlert
                                ? colors.destructive
                                : colors.foreground)),
                    const SizedBox(width: Ba33Spacing.spacing2),
                    Icon(
                      r.isAlert
                          ? Icons.warning_amber
                          : Icons.check_circle_outline,
                      size: 12,
                      color: r.isAlert
                          ? colors.destructive
                          : colors.primary,
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: Ba33Spacing.spacing2),
          ],

          // Input row
          if (_showInput) ...[
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    autofocus: true,
                    keyboardType: const TextInputType.numberWithOptions(
                        decimal: true, signed: true),
                    decoration: const InputDecoration(
                      hintText: 'ex: 2.5',
                      suffixText: '°C',
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: Ba33Spacing.spacing2),
                ElevatedButton(
                  onPressed: _logTemp,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: Ba33Spacing.spacing3,
                        vertical: Ba33Spacing.spacing2),
                  ),
                  child: const Text('OK'),
                ),
                const SizedBox(width: 4),
                TextButton(
                  onPressed: () => setState(() => _showInput = false),
                  child: const Text('Annuler'),
                ),
              ],
            ),
          ] else ...[
            OutlinedButton.icon(
              onPressed: () => setState(() => _showInput = true),
              icon: const Icon(Icons.thermostat, size: 16),
              label: Text(readings.isEmpty
                  ? 'Enregistrer la température'
                  : 'Nouveau relevé'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                    horizontal: Ba33Spacing.spacing3,
                    vertical: Ba33Spacing.spacing2),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Loaded lot tile ───────────────────────────────────────
class _LoadedLotTile extends StatelessWidget {
  const _LoadedLotTile({required this.lot, required this.colors});

  final TransportLot lot;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Container(
      margin: const EdgeInsets.only(bottom: Ba33Spacing.spacing2),
      padding: const EdgeInsets.symmetric(
          horizontal: Ba33Spacing.spacing4, vertical: Ba33Spacing.spacing3),
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: Ba33Radii.borderRadiusMd,
      ),
      child: Row(
        children: [
          Icon(Icons.check_circle, color: colors.primary, size: 16),
          const SizedBox(width: Ba33Spacing.spacing3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(lot.qrCode,
                    style: Ba33Typography.mono(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: colors.foreground)),
                Text(lot.sourceType,
                    style: textTheme.bodySmall
                        ?.copyWith(color: colors.mutedForeground)),
              ],
            ),
          ),
          Text(
            '${(lot.loadedWeight ?? lot.declaredWeight).toStringAsFixed(1)} kg',
            style: Ba33Typography.mono(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: colors.foreground),
          ),
        ],
      ),
    );
  }
}

// ── Pulsing dot ───────────────────────────────────────────
class _PulsingDot extends StatefulWidget {
  const _PulsingDot({required this.color});

  final Color color;

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(seconds: 1))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(
          color: widget.color.withAlpha((100 + _ctrl.value * 155).round()),
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

// ── Fake map painter ──────────────────────────────────────
class _FakeMapPainter extends CustomPainter {
  const _FakeMapPainter(this.colors);

  final Ba33Colors colors;

  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = colors.border.withAlpha(120)
      ..strokeWidth = 0.8;

    for (double y = 20; y < size.height; y += 35) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
    for (double x = 40; x < size.width; x += 55) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }

    final routePaint = Paint()
      ..color = colors.primary.withAlpha(160)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path()
      ..moveTo(30, size.height * 0.8)
      ..lineTo(size.width * 0.3, size.height * 0.8)
      ..lineTo(size.width * 0.3, size.height * 0.3)
      ..lineTo(size.width - 30, size.height * 0.3);

    canvas.drawPath(path, routePaint);

    final dotPaint = Paint()..color = colors.primary;
    canvas.drawCircle(const Offset(30, 0) + Offset(0, size.height * 0.8), 5, dotPaint);
    canvas.drawCircle(Offset(size.width - 30, size.height * 0.3), 5, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}
