import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/providers/profession_provider.dart';

/// Shown after the first login. The shepherd app is the unified "wool source"
/// app — slaughterhouses, butchers, aggregators all use it too. The user picks
/// their profession once; the value is sent with every declaration.
class ProfessionPickerScreen extends ConsumerStatefulWidget {
  const ProfessionPickerScreen({super.key, this.allowSkip = false});

  /// When true (used from profile edit), the user can dismiss without picking.
  final bool allowSkip;

  @override
  ConsumerState<ProfessionPickerScreen> createState() =>
      _ProfessionPickerScreenState();
}

class _ProfessionPickerScreenState
    extends ConsumerState<ProfessionPickerScreen> {
  SourceProfession? _selected;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final current = ref.read(professionProvider).value;
    _selected = current;
  }

  Future<void> _confirm() async {
    final value = _selected;
    if (value == null || _saving) return;
    setState(() => _saving = true);
    await ref.read(professionProvider.notifier).set(value);
    if (!mounted) return;
    if (widget.allowSkip) {
      context.pop();
    } else {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Scaffold(
      appBar: widget.allowSkip
          ? AppBar(title: const Text('المهنة'))
          : null,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (!widget.allowSkip) const SizedBox(height: Ba33Spacing.spacing6),
              Text(
                'مرحبا بك',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                'اختر مهنتك حتى نخدم معاك على حساب نوع الصوف لي عندك',
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(color: colors.mutedForeground),
              ),
              const SizedBox(height: Ba33Spacing.spacing6),
              ...SourceProfession.values.map(
                (p) => Padding(
                  padding:
                      const EdgeInsets.only(bottom: Ba33Spacing.spacing3),
                  child: _ProfessionTile(
                    profession: p,
                    selected: _selected == p,
                    onTap: () => setState(() => _selected = p),
                  ),
                ),
              ),
              const Spacer(),
              Ba33Button(
                onPressed: _selected != null && !_saving ? _confirm : null,
                label: 'متابعة',
                icon: Icons.check_rounded,
                expand: true,
                size: Ba33ButtonSize.lg,
                isLoading: _saving,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfessionTile extends StatelessWidget {
  const _ProfessionTile({
    required this.profession,
    required this.selected,
    required this.onTap,
  });

  final SourceProfession profession;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        decoration: BoxDecoration(
          color: selected ? colors.primary.withAlpha(20) : colors.card,
          borderRadius: Ba33Radii.borderRadiusLg,
          border: Border.all(
            color: selected ? colors.primary : colors.border,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(_iconFor(profession),
                color: selected ? colors.primary : colors.foreground),
            const SizedBox(width: Ba33Spacing.spacing3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profession.labelArabic(),
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  Text(
                    profession.labelFrench(),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: colors.mutedForeground,
                        ),
                  ),
                ],
              ),
            ),
            if (selected)
              Icon(Icons.check_circle, color: colors.primary),
          ],
        ),
      ),
    );
  }

  IconData _iconFor(SourceProfession p) => switch (p) {
        SourceProfession.shepherd => Icons.agriculture_rounded,
        SourceProfession.slaughterhouse => Icons.warehouse_outlined,
        SourceProfession.butcher => Icons.cut,
        SourceProfession.aggregator => Icons.groups_rounded,
        SourceProfession.other => Icons.more_horiz_rounded,
      };
}
