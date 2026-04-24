import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../jobs/model/transport_job.dart';
import '../../trip/view_model/active_trip_view_model.dart';

class ScanScreen extends ConsumerStatefulWidget {
  const ScanScreen({super.key});

  @override
  ConsumerState<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends ConsumerState<ScanScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  bool _isProcessing = false;

  @override
  void dispose() {
    _cameraController.dispose();
    super.dispose();
  }

  void _onQRDetected(BarcodeCapture capture) {
    if (_isProcessing) return;
    final rawValue = capture.barcodes.firstOrNull?.rawValue;
    if (rawValue == null) return;

    final trip = ref.read(activeTripProvider);
    if (trip == null) return;

    final lot = trip.job.lots
        .where((l) => l.qrCode == rawValue && !l.isLoaded)
        .firstOrNull;

    if (lot == null) return; // unknown QR or already loaded

    setState(() => _isProcessing = true);
    _cameraController.stop();
    _showWeightConfirm(lot);
  }

  void _onManualTap(TransportLot lot) {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);
    _cameraController.stop();
    _showWeightConfirm(lot);
  }

  void _showWeightConfirm(TransportLot lot) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => WeightConfirmSheet(
        lot: lot,
        onConfirmed: (weight) {
          ref.read(activeTripProvider.notifier).loadLot(lot.qrCode, weight);
          setState(() => _isProcessing = false);
          _cameraController.start();
        },
        onCancelled: () {
          setState(() => _isProcessing = false);
          _cameraController.start();
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
    final pending = job.lots.where((l) => !l.isLoaded).toList();
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text('Scanner les lots',
            style: textTheme.titleLarge?.copyWith(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on, color: Colors.white),
            onPressed: () => _cameraController.toggleTorch(),
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Progress bar ─────────────────────────
          Container(
            color: Colors.black,
            padding: const EdgeInsets.symmetric(
                horizontal: Ba33Spacing.spacing4, vertical: Ba33Spacing.spacing2),
            child: Row(
              children: [
                Text('${job.lotsLoaded}/${job.lots.length} chargés',
                    style: const TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(width: Ba33Spacing.spacing3),
                Expanded(
                  child: ClipRRect(
                    borderRadius: Ba33Radii.borderRadiusFull,
                    child: LinearProgressIndicator(
                      value: job.lots.isEmpty
                          ? 0
                          : job.lotsLoaded / job.lots.length,
                      backgroundColor: Colors.white12,
                      color: colors.primary,
                      minHeight: 6,
                    ),
                  ),
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
                  controller: _cameraController,
                  onDetect: _onQRDetected,
                ),
                // Scanner overlay frame
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
                      child: CircularProgressIndicator(color: colors.primary),
                    ),
                  ),
              ],
            ),
          ),

          // ── Lots list (manual fallback) ──────────
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
                    child: pending.isEmpty
                        ? Text('Tous les lots scannés ✓',
                            style: textTheme.titleSmall
                                ?.copyWith(color: colors.primary))
                        : Text(
                            'Lots restants — appuyez pour scan manuel',
                            style: textTheme.titleSmall,
                          ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(
                          horizontal: Ba33Spacing.spacing4),
                      itemCount: job.lots.length,
                      itemBuilder: (ctx, i) {
                        final lot = job.lots[i];
                        return _ScanLotTile(
                          lot: lot,
                          onTap: lot.isLoaded
                              ? null
                              : () => _onManualTap(lot),
                        );
                      },
                    ),
                  ),
                  if (job.allLotsLoaded)
                    Padding(
                      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ref
                                .read(activeTripProvider.notifier)
                                .startTrip();
                            context.go('/trip');
                          },
                          icon: const Icon(Icons.local_shipping),
                          label: const Text('Démarrer le trajet'),
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

// ── Scanner frame painter ─────────────────────────────────
class _ScannerFramePainter extends CustomPainter {
  const _ScannerFramePainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    const c = 28.0;
    final w = size.width;
    final h = size.height;

    canvas.drawLine(Offset.zero, Offset(c, 0), paint);
    canvas.drawLine(Offset.zero, Offset(0, c), paint);
    canvas.drawLine(Offset(w, 0), Offset(w - c, 0), paint);
    canvas.drawLine(Offset(w, 0), Offset(w, c), paint);
    canvas.drawLine(Offset(0, h), Offset(c, h), paint);
    canvas.drawLine(Offset(0, h), Offset(0, h - c), paint);
    canvas.drawLine(Offset(w, h), Offset(w - c, h), paint);
    canvas.drawLine(Offset(w, h), Offset(w, h - c), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}

// ── Lot tile ─────────────────────────────────────────────
class _ScanLotTile extends StatelessWidget {
  const _ScanLotTile({required this.lot, this.onTap});

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
          color: lot.isLoaded
              ? colors.primary.withAlpha(20)
              : colors.card,
          borderRadius: Ba33Radii.borderRadiusMd,
          border: Border.all(
            color: lot.isLoaded
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
                color: lot.isLoaded ? colors.primary : colors.muted,
                borderRadius: Ba33Radii.borderRadiusSm,
              ),
              child: Icon(
                lot.isLoaded ? Icons.check : Icons.qr_code_scanner,
                size: 16,
                color: lot.isLoaded
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
                    lot.isLoaded
                        ? 'Chargé · ${lot.loadedWeight?.toStringAsFixed(1)} kg'
                        : 'Déclaré · ${lot.declaredWeight.toStringAsFixed(1)} kg',
                    style: textTheme.bodySmall
                        ?.copyWith(color: colors.mutedForeground),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: colors.secondary,
                borderRadius: Ba33Radii.borderRadiusSm,
              ),
              child: Text(lot.sourceType,
                  style: Ba33Typography.mono(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: colors.secondaryForeground)),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Weight confirm bottom sheet ───────────────────────────
class WeightConfirmSheet extends StatefulWidget {
  const WeightConfirmSheet({
    super.key,
    required this.lot,
    required this.onConfirmed,
    required this.onCancelled,
  });

  final TransportLot lot;
  final ValueChanged<double> onConfirmed;
  final VoidCallback onCancelled;

  @override
  State<WeightConfirmSheet> createState() => _WeightConfirmSheetState();
}

class _WeightConfirmSheetState extends State<WeightConfirmSheet> {
  late final TextEditingController _ctrl;
  bool _hasMismatch = false;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(
        text: widget.lot.declaredWeight.toStringAsFixed(1));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _check(String v) {
    final entered = double.tryParse(v) ?? 0;
    final delta = (entered - widget.lot.declaredWeight).abs();
    setState(
        () => _hasMismatch = delta > widget.lot.declaredWeight * 0.02);
  }

  void _confirm() {
    final w = double.tryParse(_ctrl.text);
    if (w == null) return;
    Navigator.of(context).pop();
    widget.onConfirmed(w);
  }

  void _cancel() {
    Navigator.of(context).pop();
    widget.onCancelled();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

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
                    child: Text('Confirmer le poids',
                        style: textTheme.titleLarge)),
                IconButton(
                  onPressed: _cancel,
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
                      Text('Poids déclaré', style: textTheme.labelSmall),
                      Text(
                        '${widget.lot.declaredWeight.toStringAsFixed(1)} kg',
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
                      Text('Poids mesuré',
                          style: textTheme.labelSmall,
                          textAlign: TextAlign.end),
                      const SizedBox(height: 4),
                      TextField(
                        controller: _ctrl,
                        keyboardType: const TextInputType.numberWithOptions(
                            decimal: true),
                        textAlign: TextAlign.end,
                        autofocus: true,
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
                        'Écart > 2% détecté — anomalie Point Noir signalée.',
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
                child: const Text('Confirmer le chargement'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
