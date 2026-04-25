import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/providers/onboarding_provider.dart';

class _Slide {
  const _Slide({
    required this.icon,
    required this.title,
    required this.body,
  });

  final IconData icon;
  final String title;
  final String body;
}

const _slides = <_Slide>[
  _Slide(
    icon: Icons.grass_rounded,
    title: 'كل صوف يبدا منك',
    body:
        'كاش ما عندك صوف؟ فلاح، مذبح، جزار، تعاونية — كلش يقدر يصرّح بسرعة و يدخّل صوفه في الشبكة.',
  ),
  _Slide(
    icon: Icons.touch_app_rounded,
    title: 'تكتيكة وحدة، تصريح كامل',
    body:
        'اضغط على "عندي صوف جاهز"، عمّر الفورم (الوزن، السلالة، الكياس...) و سوبميتو. المنصة تكلّف الجامع.',
  ),
  _Slide(
    icon: Icons.verified_rounded,
    title: 'تتبع كامل من المزرعة للمنتج',
    body:
        'كل كيلو يتسجّل، كل مرحلة تتسجّل، الشهادة NFN تختم كل قطعة باسم بلدك.',
  ),
];

class IntroOnboardingScreen extends ConsumerStatefulWidget {
  const IntroOnboardingScreen({super.key});

  @override
  ConsumerState<IntroOnboardingScreen> createState() =>
      _IntroOnboardingScreenState();
}

class _IntroOnboardingScreenState
    extends ConsumerState<IntroOnboardingScreen> {
  final _pageCtrl = PageController();
  int _index = 0;

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    await ref.read(onboardingSeenProvider.notifier).markSeen();
    if (!mounted) return;
    context.go('/login');
  }

  void _next() {
    if (_index >= _slides.length - 1) {
      _finish();
      return;
    }
    _pageCtrl.nextPage(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final isLast = _index == _slides.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            children: [
              Align(
                alignment: AlignmentDirectional.centerStart,
                child: TextButton(
                  onPressed: _finish,
                  child: Text(
                    'تخطّى',
                    style: TextStyle(color: colors.mutedForeground),
                  ),
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: _pageCtrl,
                  itemCount: _slides.length,
                  onPageChanged: (i) => setState(() => _index = i),
                  itemBuilder: (_, i) => _SlideView(slide: _slides[i]),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              _Dots(count: _slides.length, active: _index),
              const SizedBox(height: Ba33Spacing.spacing6),
              Ba33Button(
                onPressed: _next,
                label: isLast ? 'يلا نبداو' : 'التالي',
                icon: isLast
                    ? Icons.check_rounded
                    : Icons.arrow_back_rounded,
                size: Ba33ButtonSize.lg,
                expand: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SlideView extends StatelessWidget {
  const _SlideView({required this.slide});
  final _Slide slide;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            color: colors.primary.withAlpha(28),
            borderRadius: Ba33Radii.borderRadiusXl,
          ),
          child: Icon(slide.icon, size: 72, color: colors.primary),
        ),
        const SizedBox(height: Ba33Spacing.spacing8),
        Text(
          slide.title,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: Ba33Spacing.spacing4),
        Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: Ba33Spacing.spacing4),
          child: Text(
            slide.body,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: colors.mutedForeground,
                  height: 1.6,
                ),
          ),
        ),
      ],
    );
  }
}

class _Dots extends StatelessWidget {
  const _Dots({required this.count, required this.active});
  final int count;
  final int active;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (i) {
        final isActive = i == active;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: isActive ? 26 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: isActive ? colors.primary : colors.muted,
            borderRadius: Ba33Radii.borderRadiusFull,
          ),
        );
      }),
    );
  }
}
