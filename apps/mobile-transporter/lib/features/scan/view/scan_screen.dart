import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ScanScreen extends ConsumerWidget {
  const ScanScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Scan Lot',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.qr_code_scanner,
              size: 96,
              color: colors.mutedForeground,
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
            Text(
              'Point camera at QR code',
              style: TextStyle(color: colors.mutedForeground),
            ),
          ],
        ),
      ),
    );
  }
}
