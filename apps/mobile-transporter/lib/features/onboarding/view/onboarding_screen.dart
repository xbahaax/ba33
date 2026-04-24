import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ba33_ui/ba33_ui.dart';

import '../../../shared/providers/onboarding_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _controller = PageController();
  int _current = 0;

  static const _pages = [
    _PageData(
      icon: Icons.local_shipping_outlined,
      title: 'مرحباً في ba33 ناقل',
      body:
          'منصة رقمية لتتبع ونقل الصوف الجزائري\nبدقة وأمان من أول بالة لآخر تسليم.',
    ),
    _PageData(
      icon: Icons.qr_code_scanner_outlined,
      title: 'امسح ووثّق',
      body:
          'امسح QR كل بالة، سجّل التوزين\nوالتوقيع الرقمي في الوقت الحقيقي.',
    ),
    _PageData(
      icon: Icons.verified_outlined,
      title: 'سلسلة تتبع موثوقة',
      body:
          'كل تسليم يُسجَّل ويُوقَّع —\nشفافية كاملة من المزرعة للمستودع.',
    ),
  ];

  bool get _isLast => _current == _pages.length - 1;

  void _next() {
    if (_isLast) {
      _finish();
    } else {
      _controller.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _finish() async {
    await ref.read(onboardingStateProvider.notifier).markDone();
    if (mounted) context.go('/login');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Align(
              alignment: AlignmentDirectional.topEnd,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: Ba33Spacing.spacing4,
                  vertical: Ba33Spacing.spacing2,
                ),
                child: TextButton(
                  onPressed: _finish,
                  child: Text(
                    'تخطّي',
                    style: textTheme.bodyMedium
                        ?.copyWith(color: colors.mutedForeground),
                  ),
                ),
              ),
            ),

            // Pages
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _current = i),
                itemBuilder: (context, i) =>
                    _OnboardingPage(data: _pages[i], colors: colors),
              ),
            ),

            // Dots + button
            Padding(
              padding: const EdgeInsets.fromLTRB(
                Ba33Spacing.spacing6,
                Ba33Spacing.spacing4,
                Ba33Spacing.spacing6,
                Ba33Spacing.spacing8,
              ),
              child: Column(
                children: [
                  _Dots(count: _pages.length, current: _current, colors: colors),
                  const SizedBox(height: Ba33Spacing.spacing6),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _next,
                      child: Text(_isLast ? 'ابدأ الآن' : 'التالي'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Page content ─────────────────────────────────────────────────────────────

class _PageData {
  const _PageData({
    required this.icon,
    required this.title,
    required this.body,
  });
  final IconData icon;
  final String title;
  final String body;
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.data, required this.colors});

  final _PageData data;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: Ba33Spacing.spacing8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: colors.primary.withValues(alpha: 0.1),
              borderRadius: Ba33Radii.borderRadiusXl,
            ),
            child: Icon(data.icon, size: 56, color: colors.primary),
          ),
          const SizedBox(height: Ba33Spacing.spacing8),
          Text(
            data.title,
            textAlign: TextAlign.center,
            style: textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: colors.foreground,
            ),
          ),
          const SizedBox(height: Ba33Spacing.spacing4),
          Text(
            data.body,
            textAlign: TextAlign.center,
            style: textTheme.bodyLarge?.copyWith(
              color: colors.mutedForeground,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Dots indicator ────────────────────────────────────────────────────────────

class _Dots extends StatelessWidget {
  const _Dots({
    required this.count,
    required this.current,
    required this.colors,
  });

  final int count;
  final int current;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (i) {
        final active = i == current;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.symmetric(horizontal: Ba33Spacing.spacing1),
          width: active ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: active ? colors.primary : colors.border,
            borderRadius: Ba33Radii.borderRadiusFull,
          ),
        );
      }),
    );
  }
}
