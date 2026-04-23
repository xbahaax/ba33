import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../jobs/model/transport_job.dart';
import '../view_model/active_trip_view_model.dart';

class ScanDeliveryScreen extends ConsumerWidget {
  const ScanDeliveryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trip = ref.watch(activeTripProvider);
    if (trip == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final job = trip.job;
    final remaining = job.lots.where((l) => !l.isDelivered).toList();
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Livraison', style: textTheme.titleLarge),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Destination banner
          Container(
            padding: const EdgeInsets.all(Ba33Spacing.spacing4),
            color: colors.muted,
            child: Row(
              children: [
                const Text('🫧', style: TextStyle(fontSize: 20)),
                const SizedBox(width: Ba33Spacing.spacing3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(job.destinationName, style: textTheme.titleSmall),
                      Text(
                        '${job.lotsDelivered}/${job.lots.length} livrés',
                        style: textTheme.bodySmall
                            ?.copyWith(color: colors.mutedForeground),
                      ),
                    ],
                  ),
                ),
                _ProgressRing(
                  progress: job.lots.isEmpty
                      ? 0
                      : job.lotsDelivered / job.lots.length,
                  color: colors.primary,
                ),
              ],
            ),
          ),

          // Camera viewfinder (mock)
          Expanded(
            flex: 3,
            child: _DeliveryCamera(colors: colors),
          ),

          // Lots list
          Expanded(
            flex: 4,
            child: Container(
              decoration: BoxDecoration(
                color: colors.background,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(Ba33Radii.xl),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      Ba33Spacing.spacing4,
                      Ba33Spacing.spacing4,
                      Ba33Spacing.spacing4,
                      Ba33Spacing.spacing2,
                    ),
                    child: Text(
                      remaining.isEmpty
                          ? 'Tous les lots ont été livrés ✓'
                          : 'Lots à livrer — appuyez pour scanner',
                      style: textTheme.titleSmall?.copyWith(
                        color: remaining.isEmpty
                            ? colors.primary
                            : colors.foreground,
                      ),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: Ba33Spacing.spacing4),
                      itemCount: remaining.isEmpty
                          ? job.lots.length
                          : remaining.length,
                      itemBuilder: (context, i) {
                        final lot = remaining.isEmpty
                            ? job.lots[i]
                            : remaining[i];
                        return _DeliveryLotTile(
                          lot: lot,
                          alreadyDelivered: lot.isDelivered,
                          onTap: lot.isDelivered
                              ? null
                              : () => _showDeliveryConfirm(
                                    context,
                                    ref,
                                    lot,
                                  ),
                        );
                      },
                    ),
                  ),
                  if (job.allLotsDelivered)
                    Padding(
                      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => context.push('/signature'),
                          icon: const Icon(Icons.draw),
                          label: const Text('Signature du réceptionnaire'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              vertical: Ba33Spacing.spacing4,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showDeliveryConfirm(
    BuildContext context,
    WidgetRef ref,
    TransportLot lot,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _DeliveryWeightSheet(lot: lot, ref: ref),
    );
  }
}

class _DeliveryCamera extends StatelessWidget {
  const _DeliveryCamera({required this.colors});

  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0A0A0A),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('📦', style: TextStyle(fontSize: 40)),
            const SizedBox(height: Ba33Spacing.spacing3),
            Text(
              'Pointez vers le QR du lot',
              style: TextStyle(
                color: Colors.white.withOpacity(0.5),
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DeliveryLotTile extends StatelessWidget {
  const _DeliveryLotTile({
    required this.lot,
    required this.alreadyDelivered,
    this.onTap,
  });

  final TransportLot lot;
  final bool alreadyDelivered;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;
    final hasMismatch = lot.hasMismatch;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: Ba33Spacing.spacing2),
        padding: const EdgeInsets.all(Ba33Spacing.spacing3),
        decoration: BoxDecoration(
          color: alreadyDelivered
              ? colors.primary.withOpacity(0.08)
              : colors.card,
          borderRadius: Ba33Radii.borderRadiusMd,
          border: Border.all(
            color: hasMismatch
                ? colors.destructive.withOpacity(0.4)
                : alreadyDelivered
                    ? colors.primary.withOpacity(0.3)
                    : colors.border,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: alreadyDelivered ? colors.primary : colors.muted,
                borderRadius: Ba33Radii.borderRadiusSm,
              ),
              child: Icon(
                alreadyDelivered ? Icons.check : Icons.qr_code_scanner,
                size: 16,
                color: alreadyDelivered
                    ? colors.primaryForeground
                    : colors.mutedForeground,
              ),
            ),
            const SizedBox(width: Ba33Spacing.spacing3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lot.qrCode,
                    style: Ba33Typography.mono(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: colors.foreground,
                    ),
                  ),
                  Text(
                    alreadyDelivered
                        ? 'Livré · ${lot.deliveredWeight?.toStringAsFixed(1)} kg'
                        : 'Chargé · ${lot.loadedWeight?.toStringAsFixed(1) ?? lot.declaredWeight.toStringAsFixed(1)} kg',
                    style: textTheme.bodySmall
                        ?.copyWith(color: colors.mutedForeground),
                  ),
                ],
              ),
            ),
            if (hasMismatch)
              Padding(
                padding: const EdgeInsets.only(left: Ba33Spacing.spacing2),
                child: Icon(Icons.warning_amber,
                    color: colors.destructive, size: 16),
              ),
          ],
        ),
      ),
    );
  }
}

class _DeliveryWeightSheet extends ConsumerStatefulWidget {
  const _DeliveryWeightSheet({
    required this.lot,
    required this.ref,
  });

  final TransportLot lot;
  final WidgetRef ref;

  @override
  ConsumerState<_DeliveryWeightSheet> createState() =>
      _DeliveryWeightSheetState();
}

class _DeliveryWeightSheetState extends ConsumerState<_DeliveryWeightSheet> {
  late final TextEditingController _controller;
  bool _hasMismatch = false;

  @override
  void initState() {
    super.initState();
    final loaded = widget.lot.loadedWeight ?? widget.lot.declaredWeight;
    _controller = TextEditingController(text: loaded.toStringAsFixed(1));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _checkMismatch(String val) {
    final entered = double.tryParse(val) ?? 0;
    final ref = widget.lot.loadedWeight ?? widget.lot.declaredWeight;
    setState(() => _hasMismatch = (entered - ref).abs() > ref * 0.02);
  }

  void _confirm() {
    final weight = double.tryParse(_controller.text);
    if (weight == null) return;
    widget.ref
        .read(activeTripProvider.notifier)
        .deliverLot(widget.lot.qrCode, weight);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;
    final loadedWeight =
        widget.lot.loadedWeight ?? widget.lot.declaredWeight;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(Ba33Spacing.spacing6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text('Poids à la livraison', style: textTheme.titleLarge),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: Icon(Icons.close, color: colors.mutedForeground),
                ),
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing2),
            Text(
              widget.lot.qrCode,
              style: Ba33Typography.mono(
                  fontSize: 13, color: colors.mutedForeground),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Poids chargé', style: textTheme.labelSmall),
                      Text(
                        '${loadedWeight.toStringAsFixed(1)} kg',
                        style: Ba33Typography.mono(
                            fontSize: 18, color: colors.mutedForeground),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.arrow_forward, color: colors.border),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Poids livré', style: textTheme.labelSmall,
                          textAlign: TextAlign.end),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _controller,
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        textAlign: TextAlign.end,
                        style: Ba33Typography.mono(fontSize: 18),
                        decoration: const InputDecoration(
                          suffixText: 'kg',
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                        ),
                        onChanged: _checkMismatch,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (_hasMismatch) ...[
              const SizedBox(height: Ba33Spacing.spacing3),
              Container(
                padding: const EdgeInsets.all(Ba33Spacing.spacing3),
                decoration: BoxDecoration(
                  color: colors.destructive.withOpacity(0.08),
                  borderRadius: Ba33Radii.borderRadiusMd,
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning_amber,
                        color: colors.destructive, size: 16),
                    const SizedBox(width: Ba33Spacing.spacing2),
                    Expanded(
                      child: Text(
                        'Écart > 2% — anomalie Point Noir signalée.',
                        style: textTheme.bodySmall
                            ?.copyWith(color: colors.destructive),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: Ba33Spacing.spacing4),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _confirm,
                child: const Text('Confirmer la livraison'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressRing extends StatelessWidget {
  const _ProgressRing({required this.progress, required this.color});

  final double progress;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 40,
      height: 40,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            value: progress,
            strokeWidth: 3,
            color: color,
            backgroundColor: color.withOpacity(0.2),
          ),
          Text(
            '${(progress * 100).round()}%',
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
