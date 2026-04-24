import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ba33_ui/ba33_ui.dart';

import '../../../shared/providers/onboarding_provider.dart';
import '../../auth/view_model/auth_view_model.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _opacity;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();

    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    _opacity = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _scale = Tween<double>(begin: 0.82, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack),
    );

    _ctrl.forward().whenComplete(_navigate);
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;

    final hasSeen = await ref.read(onboardingStateProvider.future);
    if (!mounted) return;

    if (!hasSeen) {
      context.go('/onboarding');
      return;
    }

    final isAuth = ref.read(authStateProvider).isAuthenticated;
    context.go(isAuth ? '/' : '/login');
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Scaffold(
      backgroundColor: colors.primary,
      body: Center(
        child: FadeTransition(
          opacity: _opacity,
          child: ScaleTransition(
            scale: _scale,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    color: colors.primaryForeground.withValues(alpha: 0.15),
                    borderRadius: Ba33Radii.borderRadiusXl,
                  ),
                  child: Center(
                    child: Text(
                      'ba33',
                      style: Ba33Typography.mono().copyWith(
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
                        color: colors.primaryForeground,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: Ba33Spacing.spacing6),
                Text(
                  'ناقل',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: colors.primaryForeground.withValues(alpha: 0.85),
                        fontWeight: FontWeight.w500,
                        letterSpacing: 2,
                      ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
