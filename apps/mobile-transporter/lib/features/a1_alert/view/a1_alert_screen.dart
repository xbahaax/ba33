import 'dart:async';

import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../jobs/model/transport_job.dart';
import '../../jobs/view_model/job_list_view_model.dart';
import '../../trip/view_model/active_trip_view_model.dart';
import '../view_model/a1_alert_view_model.dart';

class A1AlertScreen extends ConsumerStatefulWidget {
  const A1AlertScreen({super.key, required this.alert});

  final A1Alert alert;

  @override
  ConsumerState<A1AlertScreen> createState() => _A1AlertScreenState();
}

class _A1AlertScreenState extends ConsumerState<A1AlertScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late Timer _clockTimer;
  late Duration _remaining;

  @override
  void initState() {
    super.initState();

    _remaining = widget.alert.slaRemaining;

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _remaining = widget.alert.slaRemaining);
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _clockTimer.cancel();
    super.dispose();
  }

  void _accept() {
    // Build a new transport job from the alert and start it
    final now = DateTime.now();
    final job = TransportJob(
      id: 'TJ-${widget.alert.id}',
      originName: widget.alert.depotName,
      originType: 'depot',
      destinationName: 'Laverie Blida',
      destinationType: 'laverie',
      lane: TransportLane.urgentColdChain,
      status: JobStatus.accepted,
      requestedAt: now,
      slaDeadline: widget.alert.slaDeadline,
      lots: List.generate(
        widget.alert.lotsCount,
        (i) => TransportLot(
          id: 'L-A1-${widget.alert.id}-${i.toString().padLeft(3, '0')}',
          qrCode:
              'A1-${widget.alert.id.substring(widget.alert.id.length - 4)}-${String.fromCharCode(65 + i % 26)}${i % 10}',
          sourceType: 'C2',
          declaredWeight: 38.0 + (i % 5) * 4.5,
        ),
      ),
    );

    ref.read(activeTripProvider.notifier).startJob(job);
    ref.read(a1AlertNotifierProvider.notifier).accept();
    context.go('/job-detail');
  }

  void _dismiss() {
    ref.read(a1AlertNotifierProvider.notifier).dismiss();
    context.pop();
  }

  String _formatDuration(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes % 60;
    final s = d.inSeconds % 60;
    if (h > 0) return '${h}h ${m.toString().padLeft(2, '0')}m';
    return '${m.toString().padLeft(2, '0')}m ${s.toString().padLeft(2, '0')}s';
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;
    final isUrgent = _remaining.inMinutes < 30;

    return Scaffold(
      backgroundColor: colors.destructive,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            children: [
              // Dismiss
              Align(
                alignment: Alignment.topRight,
                child: TextButton(
                  onPressed: _dismiss,
                  child: Text(
                    'ارفض',
                    style: TextStyle(
                      color: colors.destructiveForeground.withAlpha(180),
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const Spacer(),

              // Pulsing alert icon
              AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (_, child) => Transform.scale(
                  scale: _pulseAnimation.value,
                  child: child,
                ),
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: colors.destructiveForeground.withAlpha(30),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: colors.destructiveForeground.withAlpha(50),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.warning_rounded,
                        size: 40,
                        color: colors.destructiveForeground,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),

              // ALERTE A1 label
              Text(
                '● تنبيه A1',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2,
                  color: colors.destructiveForeground.withAlpha(200),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                'نقل مستعجل',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: colors.destructiveForeground,
                  height: 1,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Ba33Spacing.spacing4),

              // SLA countdown
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: Ba33Spacing.spacing4,
                  vertical: Ba33Spacing.spacing2,
                ),
                decoration: BoxDecoration(
                  color: colors.destructiveForeground.withAlpha(25),
                  borderRadius: Ba33Radii.borderRadiusFull,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.timer,
                        size: 16, color: colors.destructiveForeground),
                    const SizedBox(width: Ba33Spacing.spacing2),
                    Text(
                      'SLA : ${_formatDuration(_remaining)}',
                      style: Ba33Typography.mono(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: colors.destructiveForeground,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing6),

              // Alert details card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                decoration: BoxDecoration(
                  color: colors.destructiveForeground.withAlpha(20),
                  borderRadius: Ba33Radii.borderRadiusLg,
                  border: Border.all(
                    color: colors.destructiveForeground.withAlpha(40),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _AlertDetail(
                      icon: Icons.warehouse_outlined,
                      label: 'المستودع',
                      value:
                          '${widget.alert.depotName} · ${widget.alert.depotRegion}',
                      foreground: colors.destructiveForeground,
                    ),
                    const SizedBox(height: Ba33Spacing.spacing3),
                    _AlertDetail(
                      icon: Icons.inventory_2_outlined,
                      label: 'اللوتات',
                      value: '${widget.alert.lotsCount} لوت C2',
                      foreground: colors.destructiveForeground,
                    ),
                    const SizedBox(height: Ba33Spacing.spacing3),
                    _AlertDetail(
                      icon: Icons.scale_outlined,
                      label: 'الوزن الكلي',
                      value:
                          '${widget.alert.totalWeight.toStringAsFixed(1)} كغ',
                      foreground: colors.destructiveForeground,
                      mono: true,
                    ),
                    const SizedBox(height: Ba33Spacing.spacing3),
                    _AlertDetail(
                      icon: Icons.info_outline,
                      label: 'السبب',
                      value: widget.alert.triggerReason,
                      foreground: colors.destructiveForeground,
                    ),
                  ],
                ),
              ),
              const Spacer(),

              // Accept button
              GestureDetector(
                onTap: _accept,
                child: AnimatedBuilder(
                  animation: _pulseAnimation,
                  builder: (_, child) => Transform.scale(
                    scale: 0.97 + _pulseAnimation.value * 0.03,
                    child: child,
                  ),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      vertical: Ba33Spacing.spacing4 + 4,
                    ),
                    decoration: BoxDecoration(
                      color: colors.destructiveForeground,
                      borderRadius: Ba33Radii.borderRadiusLg,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(60),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.bolt,
                            size: 22, color: colors.destructive),
                        const SizedBox(width: Ba33Spacing.spacing2),
                        Text(
                          'اقبل ب 1 ضغطة',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: colors.destructive,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                'ممر مبرد · شهادة مستعجلة لازمة',
                style: TextStyle(
                  fontSize: 11,
                  color: colors.destructiveForeground.withAlpha(150),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
            ],
          ),
        ),
      ),
    );
  }
}

class _AlertDetail extends StatelessWidget {
  const _AlertDetail({
    required this.icon,
    required this.label,
    required this.value,
    required this.foreground,
    this.mono = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color foreground;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: foreground.withAlpha(180)),
        const SizedBox(width: Ba33Spacing.spacing2),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  fontSize: 9,
                  letterSpacing: 1,
                  color: foreground.withAlpha(150),
                  fontWeight: FontWeight.w600,
                ),
              ),
              mono
                  ? Text(
                      value,
                      style: Ba33Typography.mono(
                          fontSize: 13, color: foreground),
                    )
                  : Text(
                      value,
                      style: TextStyle(
                          fontSize: 13,
                          color: foreground,
                          fontWeight: FontWeight.w500),
                    ),
            ],
          ),
        ),
      ],
    );
  }
}
