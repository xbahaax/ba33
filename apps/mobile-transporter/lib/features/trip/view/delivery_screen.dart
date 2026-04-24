import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../jobs/model/transport_job.dart';
import '../view_model/active_trip_view_model.dart';
import '../../../shared/providers/gps_provider.dart';

class DeliveryScreen extends ConsumerStatefulWidget {
  const DeliveryScreen({super.key});

  @override
  ConsumerState<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends ConsumerState<DeliveryScreen> {
  late final Map<String, TextEditingController> _ctrls;

  @override
  void initState() {
    super.initState();
    final lots = ref.read(activeTripProvider)?.job.lots ?? [];
    _ctrls = {
      for (final lot in lots)
        lot.id: TextEditingController(
          text: (lot.loadedWeight ?? lot.declaredWeight).toStringAsFixed(1),
        ),
    };
  }

  @override
  void dispose() {
    for (final c in _ctrls.values) c.dispose();
    super.dispose();
  }

  bool get _allValid => _ctrls.values.every(
        (c) => double.tryParse(c.text) != null,
      );

  bool get _hasWeightMismatch {
    final trip = ref.read(activeTripProvider);
    if (trip == null) return false;
    for (final lot in trip.job.lots) {
      final entered = double.tryParse(_ctrls[lot.id]?.text ?? '');
      if (entered == null) continue;
      final ref_ = lot.loadedWeight ?? lot.declaredWeight;
      if ((entered - ref_).abs() > ref_ * 0.02) return true;
    }
    return false;
  }

  Future<void> _confirmDelivery() async {
    final gps = ref.read(gpsTrackerProvider);
    final hasArrived = gps.isLikelyArrived;
    final hasMismatch = _hasWeightMismatch;

    // Show confirmation dialog if any check fails
    if (!hasArrived || hasMismatch) {
      final proceed = await _showValidationDialog(
        context,
        gpsOk: hasArrived,
        weightOk: !hasMismatch,
      );
      if (!proceed) return;
    }

    _applyDelivery();
  }

  void _applyDelivery() {
    final trip = ref.read(activeTripProvider);
    if (trip == null) return;

    for (final lot in trip.job.lots) {
      final w = double.tryParse(_ctrls[lot.id]?.text ?? '');
      if (w != null) {
        ref.read(activeTripProvider.notifier).deliverLot(lot.qrCode, w);
      }
    }
    context.push('/signature');
  }

  @override
  Widget build(BuildContext context) {
    final trip = ref.watch(activeTripProvider);
    final gps = ref.watch(gpsTrackerProvider);

    if (trip == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final job = trip.job;
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('التسليم', style: textTheme.titleLarge),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // ── Arrival GPS status ─────────────────────
          _ArrivalBanner(gps: gps, colors: colors),

          // ── Lots list ──────────────────────────────
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              itemCount: job.lots.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: Ba33Spacing.spacing3),
              itemBuilder: (context, i) {
                final lot = job.lots[i];
                return _DeliveryLotRow(
                  lot: lot,
                  controller: _ctrls[lot.id]!,
                  colors: colors,
                  onChanged: (_) => setState(() {}),
                );
              },
            ),
          ),

          // ── Delivery summary + confirm ─────────────
          _DeliveryFooter(
            job: job,
            controllers: _ctrls,
            colors: colors,
            canConfirm: _allValid,
            onConfirm: _confirmDelivery,
          ),
        ],
      ),
    );
  }
}

// ── Arrival GPS banner ────────────────────────────────────

class _ArrivalBanner extends StatelessWidget {
  const _ArrivalBanner({required this.gps, required this.colors});

  final GpsTrackerState gps;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    final arrived = gps.isLikelyArrived;
    final tracking = gps.isTracking;

    Color bg;
    Color border;
    Color iconColor;
    IconData icon;
    String label;

    if (!tracking) {
      bg = colors.muted;
      border = colors.border;
      iconColor = colors.mutedForeground;
      icon = Icons.gps_off_outlined;
      label = 'GPS غير نشط — لا يمكن التحقق من الوصول';
    } else if (arrived) {
      bg = colors.primary.withValues(alpha: 0.1);
      border = colors.primary.withValues(alpha: 0.4);
      iconColor = colors.primary;
      icon = Icons.where_to_vote_outlined;
      label = 'GPS يؤكد الوصول إلى الوجهة ✓';
    } else {
      bg = colors.destructive.withValues(alpha: 0.08);
      border = colors.destructive.withValues(alpha: 0.4);
      iconColor = colors.destructive;
      icon = Icons.directions_car_outlined;
      final speed = gps.lastPoint?.speedMps;
      final kmh = speed != null ? (speed * 3.6).toStringAsFixed(0) : '--';
      label = 'المركبة لا تزال تسير — $kmh كم/س';
    }

    return Container(
      margin: const EdgeInsets.fromLTRB(
        Ba33Spacing.spacing4,
        Ba33Spacing.spacing4,
        Ba33Spacing.spacing4,
        0,
      ),
      padding: const EdgeInsets.all(Ba33Spacing.spacing3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: Ba33Radii.borderRadiusLg,
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: iconColor),
          const SizedBox(width: Ba33Spacing.spacing3),
          Expanded(
            child: Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: iconColor, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Delivery lot row ──────────────────────────────────────

class _DeliveryLotRow extends StatelessWidget {
  const _DeliveryLotRow({
    required this.lot,
    required this.controller,
    required this.colors,
    required this.onChanged,
  });

  final TransportLot lot;
  final TextEditingController controller;
  final Ba33Colors colors;
  final ValueChanged<String> onChanged;

  double get _reference => lot.loadedWeight ?? lot.declaredWeight;

  bool get _hasMismatch {
    final entered = double.tryParse(controller.text);
    if (entered == null) return false;
    return (entered - _reference).abs() > _reference * 0.02;
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: Ba33Radii.borderRadiusLg,
        border: Border.all(
          color: _hasMismatch
              ? colors.destructive.withValues(alpha: 0.5)
              : colors.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // QR + source badge
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
              const SizedBox(width: Ba33Spacing.spacing2),
              Expanded(
                child: Text(
                  lot.qrCode,
                  style: Ba33Typography.mono(
                      fontSize: 12, color: colors.mutedForeground),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: Ba33Spacing.spacing3),

          // Weight comparison row
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Loaded weight (reference)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('عند التحميل',
                      style: textTheme.labelSmall
                          ?.copyWith(color: colors.mutedForeground)),
                  const SizedBox(height: 2),
                  Text(
                    '${_reference.toStringAsFixed(1)} كغ',
                    style: Ba33Typography.mono(
                        fontSize: 16, color: colors.mutedForeground),
                  ),
                ],
              ),
              const SizedBox(width: Ba33Spacing.spacing4),
              Icon(Icons.arrow_forward,
                  size: 16, color: colors.mutedForeground),
              const SizedBox(width: Ba33Spacing.spacing4),

              // Delivered weight input
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('عند التسليم',
                        style: textTheme.labelSmall
                            ?.copyWith(color: colors.foreground)),
                    const SizedBox(height: 2),
                    TextField(
                      controller: controller,
                      keyboardType: const TextInputType.numberWithOptions(
                          decimal: true),
                      onChanged: onChanged,
                      style: Ba33Typography.mono(fontSize: 16),
                      decoration: InputDecoration(
                        suffixText: 'كغ',
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: Ba33Radii.borderRadiusLg,
                          borderSide: BorderSide(
                            color: _hasMismatch
                                ? colors.destructive
                                : colors.input,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: Ba33Radii.borderRadiusLg,
                          borderSide: BorderSide(
                            color: _hasMismatch
                                ? colors.destructive
                                : colors.ring,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Mismatch warning
          if (_hasMismatch) ...[
            const SizedBox(height: Ba33Spacing.spacing2),
            Row(
              children: [
                Icon(Icons.warning_amber_rounded,
                    size: 14, color: colors.destructive),
                const SizedBox(width: Ba33Spacing.spacing1),
                Text(
                  'فرق > 2% — مشكلة نقل محتملة',
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.destructive),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

// ── Footer with totals + confirm button ──────────────────

class _DeliveryFooter extends StatelessWidget {
  const _DeliveryFooter({
    required this.job,
    required this.controllers,
    required this.colors,
    required this.canConfirm,
    required this.onConfirm,
  });

  final TransportJob job;
  final Map<String, TextEditingController> controllers;
  final Ba33Colors colors;
  final bool canConfirm;
  final VoidCallback onConfirm;

  double get _deliveredTotal => controllers.values.fold(
        0.0,
        (s, c) => s + (double.tryParse(c.text) ?? 0),
      );

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final loaded = job.totalLoadedWeight;
    final delivered = _deliveredTotal;
    final delta = delivered - loaded;
    final hasDelta = delta.abs() > loaded * 0.02;

    return Container(
      padding: const EdgeInsets.fromLTRB(
        Ba33Spacing.spacing4,
        Ba33Spacing.spacing3,
        Ba33Spacing.spacing4,
        Ba33Spacing.spacing4,
      ),
      decoration: BoxDecoration(
        color: colors.card,
        border: Border(top: BorderSide(color: colors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            // Totals row
            Row(
              children: [
                Icon(Icons.scale_outlined,
                    size: 16, color: colors.mutedForeground),
                const SizedBox(width: Ba33Spacing.spacing2),
                Text('محمّل: ',
                    style: textTheme.bodySmall
                        ?.copyWith(color: colors.mutedForeground)),
                Text('${loaded.toStringAsFixed(1)} كغ',
                    style: Ba33Typography.mono(
                        fontSize: 13, color: colors.mutedForeground)),
                const Spacer(),
                Text('مسلّم: ',
                    style: textTheme.bodySmall
                        ?.copyWith(color: colors.mutedForeground)),
                Text(
                  '${delivered.toStringAsFixed(1)} كغ',
                  style: Ba33Typography.mono(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: hasDelta ? colors.destructive : colors.foreground,
                  ),
                ),
                if (hasDelta) ...[
                  const SizedBox(width: Ba33Spacing.spacing2),
                  Text(
                    '(${delta > 0 ? '+' : ''}${delta.toStringAsFixed(1)})',
                    style: Ba33Typography.mono(
                        fontSize: 11, color: colors.destructive),
                  ),
                ],
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing3),

            // Confirm button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: canConfirm ? onConfirm : null,
                icon: const Icon(Icons.check_circle_outlined),
                label: const Text('تأكيد التسليم'),
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

// ── Validation dialog ─────────────────────────────────────

Future<bool> _showValidationDialog(
  BuildContext context, {
  required bool gpsOk,
  required bool weightOk,
}) async {
  final colors = Theme.of(context).ba33;
  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: Ba33Radii.borderRadiusXl),
      title: const Text('تحقق من التسليم'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ValidationRow(
            ok: gpsOk,
            label: gpsOk
                ? 'الموقع: تم التأكيد'
                : 'الموقع: لم يُؤكَّد الوصول بعد',
            colors: colors,
          ),
          const SizedBox(height: Ba33Spacing.spacing3),
          _ValidationRow(
            ok: weightOk,
            label: weightOk
                ? 'الوزن: ضمن الحدود المقبولة'
                : 'الوزن: فرق > 2% — يُرجى التحقق',
            colors: colors,
          ),
          const SizedBox(height: Ba33Spacing.spacing4),
          Text(
            'هل تريد المتابعة رغم التحذيرات؟',
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: colors.mutedForeground),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('إلغاء'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('متابعة رغم ذلك'),
        ),
      ],
    ),
  );
  return result ?? false;
}

class _ValidationRow extends StatelessWidget {
  const _ValidationRow({
    required this.ok,
    required this.label,
    required this.colors,
  });

  final bool ok;
  final String label;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          ok ? Icons.check_circle_outlined : Icons.warning_amber_rounded,
          size: 18,
          color: ok ? colors.primary : colors.destructive,
        ),
        const SizedBox(width: Ba33Spacing.spacing3),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: ok ? colors.foreground : colors.destructive,
                ),
          ),
        ),
      ],
    );
  }
}
