import 'dart:ui' as ui;

import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../view_model/active_trip_view_model.dart';

class SignatureScreen extends ConsumerStatefulWidget {
  const SignatureScreen({super.key});

  @override
  ConsumerState<SignatureScreen> createState() => _SignatureScreenState();
}

class _SignatureScreenState extends ConsumerState<SignatureScreen> {
  final List<Offset?> _points = [];
  final _nameController = TextEditingController();
  final _repaintKey = GlobalKey();
  bool _hasSignature = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _addPoint(Offset? point) {
    setState(() {
      _points.add(point);
      if (point != null) _hasSignature = true;
    });
  }

  void _clearSignature() {
    setState(() {
      _points.clear();
      _hasSignature = false;
    });
  }

  Future<void> _confirm() async {
    if (!_hasSignature) return;

    // Capture signature as image bytes
    final boundary = _repaintKey.currentContext!.findRenderObject()
        as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 2.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final bytes = byteData!.buffer.asUint8List();

    ref.read(activeTripProvider.notifier).saveSignature(
          bytes,
          _nameController.text.trim().isEmpty
              ? 'Réceptionnaire'
              : _nameController.text.trim(),
        );
    ref.read(activeTripProvider.notifier).completeDelivery();

    if (mounted) context.go('/pod');
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        title: Text('Signature', style: textTheme.titleLarge),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Receiver name
            Text('Nom du réceptionnaire', style: textTheme.labelLarge),
            const SizedBox(height: Ba33Spacing.spacing2),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                hintText: 'ex: Ahmed Benali',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // Signature label + clear button
            Row(
              children: [
                Text('Signature', style: textTheme.labelLarge),
                const Spacer(),
                TextButton.icon(
                  onPressed: _clearSignature,
                  icon: const Icon(Icons.refresh, size: 16),
                  label: const Text('Effacer'),
                  style: TextButton.styleFrom(
                    foregroundColor: colors.mutedForeground,
                  ),
                ),
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing2),

            // Signature canvas
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: colors.card,
                  borderRadius: Ba33Radii.borderRadiusLg,
                  border: Border.all(
                    color: _hasSignature
                        ? colors.primary.withOpacity(0.4)
                        : colors.border,
                    width: 1.5,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: Ba33Radii.borderRadiusLg,
                  child: RepaintBoundary(
                    key: _repaintKey,
                    child: GestureDetector(
                      onPanUpdate: (details) =>
                          _addPoint(details.localPosition),
                      onPanEnd: (_) => _addPoint(null),
                      child: CustomPaint(
                        painter: _SignaturePainter(
                          points: _points,
                          color: colors.foreground,
                        ),
                        child: _hasSignature
                            ? null
                            : Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.draw_outlined,
                                      size: 40,
                                      color: colors.mutedForeground
                                          .withOpacity(0.4),
                                    ),
                                    const SizedBox(height: Ba33Spacing.spacing2),
                                    Text(
                                      'Signez ici',
                                      style: textTheme.bodyMedium?.copyWith(
                                        color: colors.mutedForeground
                                            .withOpacity(0.5),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),

            // Confirm
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _hasSignature ? _confirm : null,
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('Valider et générer le bon de livraison'),
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

class _SignaturePainter extends CustomPainter {
  const _SignaturePainter({required this.points, required this.color});

  final List<Offset?> points;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      Paint()..color = Colors.white,
    );

    final paint = Paint()
      ..color = color
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i]!, points[i + 1]!, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SignaturePainter old) =>
      old.points != points;
}
