import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

/// The main screen: one giant button to declare wool availability.
/// Per the cahier: "a single large button — everything else is secondary."
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
              const Spacer(),
              Text(
                'ba33',
                style: Ba33Typography.serif(
                  fontSize: 40,
                  fontWeight: FontWeight.w700,
                  color: colors.primary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                'تتبع الصوف',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colors.mutedForeground,
                    ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              SizedBox(
                height: 180,
                child: ElevatedButton(
                  onPressed: () => context.go('/declaration/form'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.primary,
                    foregroundColor: colors.primaryForeground,
                    shape: RoundedRectangleBorder(
                      borderRadius: Ba33Radii.borderRadiusXl,
                    ),
                    elevation: 2,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.grass, size: 56, color: colors.primaryForeground),
                      const SizedBox(height: Ba33Spacing.spacing3),
                      Text(
                        'عندي صوف جاهز',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w600,
                          color: colors.primaryForeground,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}
