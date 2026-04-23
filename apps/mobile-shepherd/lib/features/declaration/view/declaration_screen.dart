import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The main screen: one giant button to declare wool availability.
class DeclarationScreen extends ConsumerWidget {
  const DeclarationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'ba33',
                style: Ba33Typography.serif(
                  fontSize: 40,
                  fontWeight: FontWeight.w700,
                  color: colors.primary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Ba33Spacing.spacing12),
              SizedBox(
                height: 160,
                child: ElevatedButton(
                  onPressed: () {
                    // TODO(BA33-010): open declaration flow
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.primary,
                    foregroundColor: colors.primaryForeground,
                    shape: RoundedRectangleBorder(
                      borderRadius: Ba33Radii.borderRadiusXl,
                    ),
                  ),
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.grass, size: 48),
                      SizedBox(height: Ba33Spacing.spacing2),
                      Text(
                        "J'ai de la laine",
                        style: TextStyle(fontSize: 22),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
