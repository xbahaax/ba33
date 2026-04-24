import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../jobs/model/transport_job.dart';
import '../view_model/active_trip_view_model.dart';

class ScanDeliveryScreen extends ConsumerStatefulWidget {
  const ScanDeliveryScreen({super.key});

  @override
  ConsumerState<ScanDeliveryScreen> createState() =>
      _ScanDeliveryScreenState();
}

class _ScanDeliveryScreenState extends ConsumerState<ScanDeliveryScreen> {
  final MobileScannerController _camera = MobileScannerController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _camera.dispose();
    super.dispose();
  }

  void _onQRDetected(BarcodeCapture capture) {
    if (_isProcessing) return;
    final rawValue = capture.barcodes.firstOrNull?.rawValue;
    if (rawValue == null) return;

    final trip = ref.read(activeTripProvider);
    if (trip == null) return;

    final lot = trip.job.lots
        .where((l) => l.qrCode == rawValue && !l.isDelivered)
        .firstOrNull;
    if (lot == null) return;

    setState(() => _isProcessing = true);
    _camera.stop();
    _showDeliveryConfirm(lot);
  }

  void _onManualTap(TransportLot lot) {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);
    _camera.stop();
    _showDeliveryConfirm(lot);
  }

  void _showDeliveryConfirm(TransportLot lot) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => _DeliveryWeightSheet(
        lot: lot,
        onConfirmed: (weight) {
          ref.read(activeTripProvider.notifier).deliverLot(lot.qrCode, weight);
          setState(() => _isProcessing = false);
          _camera.start();
        },
        onCancelled: () {
          setState(() => _isProcessing = false);
          _camera.start();
        },
      ),
    );
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
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text('Livraison',
            style: textTheme.titleLarge?.copyWith(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on, color: Colors.white),
            onPressed: () => _camera.toggleTorch(),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Destination + progress ───────────────
          Container(
            color: Colors.black,
            padding: const EdgeInsets.symmetric(
                horizontal: Ba33Spacing.spacing4,
                vertical: Ba33Spacing.spacing3),
            child: Row(
              children: [
                const Text('🫧', style: TextStyle(fontSize: 20)),
                const SizedBox(width: Ba33Spacing.spacing3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(job.destinationName,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600)),
                      Text('${job.lotsDelivered}/${job.lots.length} livrés',
                          style: const TextStyle(
                              color: Colors.white54, fontSize: 12)),
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

          // ── Camera viewfinder ────────────────────
          Expanded(
            flex: 5,
            child: Stack(
              children: [
                MobileScanner(
                    controller: _camera, onDetect: _onQRDetected),
                Center(
                  child: SizedBox(
                    width: 220,
                    height: 220,
                    child: CustomPaint(
                      painter: _ScannerFramePainter(colors.primary),
                    ),
                  ),
                ),
                if (_isProcessing)
                  Container(
                    color: Colors.black54,
                    child: Center(
                        child: CircularProgressIndicator(
                            color: colors.primary)),
                  ),
              ],
            ),
          ),

          // ── Lots list ────────────────────────────
          Expanded(
            flex: 4,
            child: Container(
              decoration: BoxDecoration(
                color: colors.background,
                borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(Ba33Radii.xl)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                        Ba33Spacing.spacing4, Ba33Spacing.spacing4,
                        Ba33Spacing.spacing4, Ba33Spacing.spacing2),
                    child: Text(
                      job.allLotsDelivered
                          ? 'Tous les lots livrés ✓'
                          : 'Lots à livrer — appuyez pour scan manuel',
                      style: textTheme.titleSmall?.copyWith(
                        color: job.allLotsDelivered
                            ? colors.primary
                            : colors.foreground,
                      ),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: Ba33Spacing.spacing4),
                      itemCount: job.lots.length,
                      itemBuilder: (ctx, i) {
                        final lot = job.lots[i];
                        return _DeliveryLotTile(
                          lot: lot,
                          onTap: lot.isDelivered
                              ? null
                              : () => _onManualTap(lot),
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
                                vertical: Ba33Spacing.spacing4),
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
}

// ── Lot tile ──────────────────────────────────────────────
class _DeliveryLotTile extends StatelessWidget {
  const _DeliveryLotTile({required this.lot, this.onTap});

  final TransportLot lot;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: Ba33Spacing.spacing2),
        padding: const EdgeInsets.all(Ba33Spacing.spacing3),
        decoration: BoxDecoration(
          color: lot.isDelivered ? colors.primary.withAlpha(20) : colors.card,
          borderRadius: Ba33Radii.borderRadiusMd,
          border: Border.all(
            color: lot.hasMismatch
                ? colors.destructive.withAlpha(100)
                : lot.isDelivered
                    ? colors.primary.withAlpha(80)
                    : colors.border,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: lot.isDelivered ? colors.primary : colors.muted,
                borderRadius: Ba33Radii.borderRadiusSm,
              ),
              child: Icon(
                lot.isDelivered ? Icons.check : Icons.qr_code_scanner,
                size: 16,
                color: lot.isDelivered
                    ? colors.primaryForeground
                    : colors.mutedForeground,
              ),
            ),
            const SizedBox(width: Ba33Spacing.spacing3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(lot.qrCode,
                      style: Ba33Typography.mono(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: colors.foreground)),
                  Text(
                    lot.isDelivered
                        ? 'Livré · ${lot.deliveredWeight?.toStringAsFixed(1)} kg'
                        : 'Chargé · ${(lot.loadedWeight ?? lot.declaredWeight).toStringAsFixed(1)} kg',
                    style: textTheme.bodySmall
                        ?.copyWith(color: colors.mutedForeground),
                  ),
                ],
              ),
            ),
            if (lot.hasMismatch)
              Icon(Icons.warning_amber,
                  color: colors.destructive, size: 16),
          ],
        ),
      ),
    );
  }
}

// ── Delivery weight sheet ─────────────────────────────────
class _DeliveryWeightSheet extends StatefulWidget {
  const _DeliveryWeightSheet({
    required this.lot,
    required this.onConfirmed,
    required this.onCancelled,
  });

  final TransportLot lot;
  final ValueChanged<double> onConfirmed;
  final VoidCallback onCancelled;

  @override
  State<_DeliveryWeightSheet> createState() => _DeliveryWeightSheetState();
}

class _DeliveryWeightSheetState extends State<_DeliveryWeightSheet> {
  late final TextEditingController _ctrl;
  bool _hasMismatch = false;

  @override
  void initState() {
    super.initState();
    final ref = widget.lot.loadedWeight ?? widget.lot.declaredWeight;
    _ctrl = TextEditingController(text: ref.toStringAsFixed(1));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _check(String v) {
    final entered = double.tryParse(v) ?? 0;
    final ref = widget.lot.loadedWeight ?? widget.lot.declaredWeight;
    setState(() => _hasMismatch = (entered - ref).abs() > ref * 0.02);
  }

  void _confirm() {
    final w = double.tryParse(_ctrl.text);
    if (w == null) return;
    Navigator.of(context).pop();
    widget.onConfirmed(w);
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;
    final loadedWeight = widget.lot.loadedWeight ?? widget.lot.declaredWeight;

    return Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.all(Ba33Spacing.spacing6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                    child: Text('Poids à la livraison',
                        style: textTheme.titleLarge)),
                IconButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    widget.onCancelled();
                  },
                  icon: Icon(Icons.close, color: colors.mutedForeground),
                ),
              ],
            ),
            Text(widget.lot.qrCode,
                style: Ba33Typography.mono(
                    fontSize: 13, color: colors.mutedForeground)),
            const SizedBox(height: Ba33Spacing.spacing4),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Poids chargé', style: textTheme.labelSmall),
                      Text('${loadedWeight.toStringAsFixed(1)} kg',
                          style: Ba33Typography.mono(
                              fontSize: 18, color: colors.mutedForeground)),
                    ],
                  ),
                ),
                Icon(Icons.arrow_forward, color: colors.border),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Poids livré',
                          style: textTheme.labelSmall,
                          textAlign: TextAlign.end),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _ctrl,
                        autofocus: true,
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
                        onChanged: _check,
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
                  color: colors.destructive.withAlpha(20),
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

// ── Scanner frame painter ─────────────────────────────────
class _ScannerFramePainter extends CustomPainter {
  const _ScannerFramePainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    const c = 28.0;
    final w = size.width;
    final h = size.height;
    canvas.drawLine(Offset.zero, Offset(c, 0), p);
    canvas.drawLine(Offset.zero, Offset(0, c), p);
    canvas.drawLine(Offset(w, 0), Offset(w - c, 0), p);
    canvas.drawLine(Offset(w, 0), Offset(w, c), p);
    canvas.drawLine(Offset(0, h), Offset(c, h), p);
    canvas.drawLine(Offset(0, h), Offset(0, h - c), p);
    canvas.drawLine(Offset(w, h), Offset(w - c, h), p);
    canvas.drawLine(Offset(w, h), Offset(w, h - c), p);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

// ── Progress ring ─────────────────────────────────────────
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
            backgroundColor: color.withAlpha(50),
          ),
          Text('${(progress * 100).round()}%',
              style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  color: color)),
        ],
      ),
    );
  }
}
