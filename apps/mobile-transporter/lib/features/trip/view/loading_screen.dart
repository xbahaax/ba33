import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../jobs/model/transport_job.dart';
import '../view_model/active_trip_view_model.dart';

class LoadingScreen extends ConsumerStatefulWidget {
  const LoadingScreen({super.key});

  @override
  ConsumerState<LoadingScreen> createState() => _LoadingScreenState();
}

class _LoadingScreenState extends ConsumerState<LoadingScreen> {
  late final Map<String, TextEditingController> _ctrls;

  @override
  void initState() {
    super.initState();
    final lots = ref.read(activeTripProvider)?.job.lots ?? [];
    _ctrls = {
      for (final lot in lots)
        lot.id: TextEditingController(
          text: lot.declaredWeight.toStringAsFixed(1),
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

  double _enteredTotal() => _ctrls.values.fold(
        0.0,
        (sum, c) => sum + (double.tryParse(c.text) ?? 0),
      );

  void _startTrip() {
    final trip = ref.read(activeTripProvider);
    if (trip == null) return;
    for (final lot in trip.job.lots) {
      final w = double.tryParse(_ctrls[lot.id]?.text ?? '');
      if (w != null) {
        ref.read(activeTripProvider.notifier).loadLot(lot.qrCode, w);
      }
    }
    ref.read(activeTripProvider.notifier).startTrip();
    context.go('/trip');
  }

  @override
  Widget build(BuildContext context) {
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
        title: Text('التحميل', style: textTheme.titleLarge),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // ── Weight summary header ──────────────────
          _SummaryBar(
            declaredTotal: job.totalDeclaredWeight,
            enteredTotal: _enteredTotal(),
            colors: colors,
          ),

          // ── Lots list ──────────────────────────────
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              itemCount: job.lots.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: Ba33Spacing.spacing3),
              itemBuilder: (context, i) {
                final lot = job.lots[i];
                return _LotWeightRow(
                  lot: lot,
                  controller: _ctrls[lot.id]!,
                  colors: colors,
                  onChanged: (_) => setState(() {}),
                );
              },
            ),
          ),

          // ── Start trip button ──────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                Ba33Spacing.spacing4,
                0,
                Ba33Spacing.spacing4,
                Ba33Spacing.spacing4,
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _allValid ? _startTrip : null,
                  icon: const Icon(Icons.local_shipping_outlined),
                  label: const Text('ابدا الطريق'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        vertical: Ba33Spacing.spacing4),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Weight summary bar ────────────────────────────────────

class _SummaryBar extends StatelessWidget {
  const _SummaryBar({
    required this.declaredTotal,
    required this.enteredTotal,
    required this.colors,
  });

  final double declaredTotal;
  final double enteredTotal;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    final delta = (enteredTotal - declaredTotal).abs();
    final mismatch = delta > declaredTotal * 0.02;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Ba33Spacing.spacing4,
        vertical: Ba33Spacing.spacing3,
      ),
      decoration: BoxDecoration(
        color: colors.card,
        border: Border(bottom: BorderSide(color: colors.border)),
      ),
      child: Row(
        children: [
          Icon(Icons.scale_outlined, size: 16, color: colors.mutedForeground),
          const SizedBox(width: Ba33Spacing.spacing2),
          Text('الوزن المصرح:',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: colors.mutedForeground)),
          const SizedBox(width: Ba33Spacing.spacing1),
          Text(
            '${declaredTotal.toStringAsFixed(1)} كغ',
            style: Ba33Typography.mono(
                fontSize: 13, color: colors.mutedForeground),
          ),
          const Spacer(),
          Text('المُدخَل:',
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: colors.mutedForeground)),
          const SizedBox(width: Ba33Spacing.spacing1),
          Text(
            '${enteredTotal.toStringAsFixed(1)} كغ',
            style: Ba33Typography.mono(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: mismatch ? colors.destructive : colors.foreground,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Single lot weight row ─────────────────────────────────

class _LotWeightRow extends StatelessWidget {
  const _LotWeightRow({
    required this.lot,
    required this.controller,
    required this.colors,
    required this.onChanged,
  });

  final TransportLot lot;
  final TextEditingController controller;
  final Ba33Colors colors;
  final ValueChanged<String> onChanged;

  bool get _hasMismatch {
    final entered = double.tryParse(controller.text);
    if (entered == null) return false;
    return (entered - lot.declaredWeight).abs() > lot.declaredWeight * 0.02;
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
          // Header row
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
                    fontSize: 12,
                    color: colors.mutedForeground,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: Ba33Spacing.spacing3),

          // Weight input row
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Declared weight
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('مصرّح',
                      style: textTheme.labelSmall
                          ?.copyWith(color: colors.mutedForeground)),
                  const SizedBox(height: 2),
                  Text(
                    '${lot.declaredWeight.toStringAsFixed(1)} كغ',
                    style: Ba33Typography.mono(
                      fontSize: 16,
                      color: colors.mutedForeground,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: Ba33Spacing.spacing4),
              Icon(Icons.arrow_forward,
                  size: 16, color: colors.mutedForeground),
              const SizedBox(width: Ba33Spacing.spacing4),

              // Actual weight input
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('الوزن الفعلي',
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
                  'فرق > 2% على الوزن المصرّح',
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
