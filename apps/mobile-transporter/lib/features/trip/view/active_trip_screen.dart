import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../jobs/model/transport_job.dart';
import '../view_model/active_trip_view_model.dart';
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
            // GPS tracking banner
            Container(
              padding: const EdgeInsets.all(Ba33Spacing.spacing3),
              decoration: BoxDecoration(
                color: colors.primary.withOpacity(0.08),
                borderRadius: Ba33Radii.borderRadiusLg,
                border: Border.all(color: colors.primary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  _PulsingDot(color: colors.primary),
                  const SizedBox(width: Ba33Spacing.spacing3),
                  Expanded(
                    child: Text(
                      'GPS actif — traçage en cours',
                      style: textTheme.bodySmall
                          ?.copyWith(color: colors.primary),
                    ),
                  ),
                  if (job.slaDeadline != null)
                    SlaCountdown(deadline: job.slaDeadline!),
                ],
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // Route card (map placeholder)
            Container(
              height: 160,
              decoration: BoxDecoration(
                color: colors.muted,
                borderRadius: Ba33Radii.borderRadiusLg,
                border: Border.all(color: colors.border),
              ),
              child: Stack(
                children: [
                  // Fake map lines
                  CustomPaint(
                    size: const Size(double.infinity, 160),
                    painter: _FakeMapPainter(colors),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
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
                                  Text(
                                    'Navigation active',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: colors.primaryForeground,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Text(
                          '→  ${job.destinationName}',
                          style: textTheme.titleMedium,
                        ),
                        Text(
                          job.destinationType.toUpperCase(),
                          style: textTheme.bodySmall
                              ?.copyWith(color: colors.mutedForeground),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // Loaded lots summary
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
                  Text(
                    'Poids total chargé',
                    style: textTheme.bodyMedium,
                  ),
                  const Spacer(),
                  Text(
                    '${job.totalLoadedWeight.toStringAsFixed(1)} kg',
                    style: Ba33Typography.mono(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: colors.foreground,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),

            // Deliver button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  ref.read(activeTripProvider.notifier).startDelivering();
                  context.push('/scan-delivery');
                },
                icon: const Icon(Icons.qr_code_scanner),
                label: const Text('Arrivé à destination — Livrer'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    vertical: Ba33Spacing.spacing4,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

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
        horizontal: Ba33Spacing.spacing4,
        vertical: Ba33Spacing.spacing3,
      ),
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
                Text(
                  lot.qrCode,
                  style: Ba33Typography.mono(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: colors.foreground,
                  ),
                ),
                Text(
                  lot.sourceType,
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.mutedForeground),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${lot.loadedWeight?.toStringAsFixed(1) ?? lot.declaredWeight.toStringAsFixed(1)} kg',
                style: Ba33Typography.mono(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: colors.foreground,
                ),
              ),
              if (lot.loadedWeight != null &&
                  (lot.loadedWeight! - lot.declaredWeight).abs() >
                      lot.declaredWeight * 0.02)
                Text(
                  '⚠ écart',
                  style: TextStyle(
                    fontSize: 10,
                    color: colors.destructive,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  const _PulsingDot({required this.color});

  final Color color;

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        return Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: widget.color
                .withOpacity(0.4 + _controller.value * 0.6),
            shape: BoxShape.circle,
          ),
        );
      },
    );
  }
}

class _FakeMapPainter extends CustomPainter {
  const _FakeMapPainter(this.colors);

  final Ba33Colors colors;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = colors.border.withOpacity(0.5)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    // Horizontal road lines
    for (double y = 20; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
    // Vertical road lines
    for (double x = 40; x < size.width; x += 60) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Route path
    final routePaint = Paint()
      ..color = colors.primary.withOpacity(0.5)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    final path = Path()
      ..moveTo(30, size.height * 0.8)
      ..lineTo(size.width * 0.3, size.height * 0.8)
      ..lineTo(size.width * 0.3, size.height * 0.3)
      ..lineTo(size.width - 30, size.height * 0.3);
    canvas.drawPath(path, routePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
