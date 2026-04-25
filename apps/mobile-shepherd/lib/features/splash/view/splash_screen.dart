import 'dart:async';

import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/onboarding_provider.dart';
import '../../../shared/providers/profession_provider.dart';

/// Brand splash. Waits ~1s for SharedPreferences-backed providers to resolve,
/// then routes to onboarding / login / profession picker / home in that order.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(milliseconds: 1100), _decideNext);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _decideNext() {
    if (!mounted) return;
    final seen = ref.read(onboardingSeenProvider).value ?? false;
    if (!seen) {
      context.go('/onboarding');
      return;
    }
    final isLoggedIn = ref.read(isAuthenticatedProvider);
    if (!isLoggedIn) {
      context.go('/login');
      return;
    }
    final hasProfession = ref.read(professionProvider).value != null;
    context.go(hasProfession ? '/' : '/onboarding/profession');
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Scaffold(
      backgroundColor: colors.primary,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: colors.primaryForeground.withAlpha(40),
                  borderRadius: Ba33Radii.borderRadiusXl,
                ),
                child: Icon(Icons.grass,
                    size: 56, color: colors.primaryForeground),
              ),
              const SizedBox(height: Ba33Spacing.spacing6),
              Text(
                'ba33',
                style: Ba33Typography.serif(
                  fontSize: 48,
                  fontWeight: FontWeight.w700,
                  color: colors.primaryForeground,
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                'تتبع الصوف الجزائري',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: colors.primaryForeground.withAlpha(220),
                    ),
              ),
              const SizedBox(height: Ba33Spacing.spacing12),
              SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: colors.primaryForeground,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
