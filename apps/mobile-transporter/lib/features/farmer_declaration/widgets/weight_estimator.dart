import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';

/// Visual weight estimation selector with icons and labels.
/// Designed for users who cannot estimate weight numerically.
class WeightEstimator extends StatelessWidget {
  const WeightEstimator({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  final WeightCategory? selected;
  final ValueChanged<WeightCategory> onSelected;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'قداش عندو صوف؟',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: Ba33Spacing.spacing3),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: Ba33Spacing.spacing3,
          mainAxisSpacing: Ba33Spacing.spacing3,
          childAspectRatio: 1.3,
          children: WeightCategory.values.map((category) {
            final isSelected = selected == category;
            return _WeightOption(
              category: category,
              isSelected: isSelected,
              colors: colors,
              onTap: () => onSelected(category),
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _WeightOption extends StatelessWidget {
  const _WeightOption({
    required this.category,
    required this.isSelected,
    required this.colors,
    required this.onTap,
  });

  final WeightCategory category;
  final bool isSelected;
  final Ba33Colors colors;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected ? colors.primary : colors.card,
          borderRadius: Ba33Radii.borderRadiusLg,
          border: Border.all(
            color: isSelected ? colors.primary : colors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected ? Ba33Shadows.shadowSm : Ba33Shadows.shadowXs,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _iconFor(category),
              size: 36,
              color: isSelected ? colors.primaryForeground : colors.foreground,
            ),
            const SizedBox(height: Ba33Spacing.spacing2),
            Text(
              _labelFor(category),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isSelected
                        ? colors.primaryForeground
                        : colors.foreground,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  ),
              textAlign: TextAlign.center,
            ),
            Text(
              _rangeFor(category),
              style: Ba33Typography.mono(
                fontSize: 12,
                color: isSelected
                    ? colors.primaryForeground.withValues(alpha: 0.8)
                    : colors.mutedForeground,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static IconData _iconFor(WeightCategory category) {
    return switch (category) {
      WeightCategory.oneSheep => Icons.cruelty_free,
      WeightCategory.oneBag => Icons.shopping_bag_outlined,
      WeightCategory.smallPile => Icons.inventory_2_outlined,
      WeightCategory.largePile => Icons.warehouse_outlined,
      WeightCategory.custom => Icons.edit_outlined,
    };
  }

  static String _labelFor(WeightCategory category) {
    return switch (category) {
      WeightCategory.oneSheep => 'نعجة وحدة',
      WeightCategory.oneBag => 'شكارة وحدة',
      WeightCategory.smallPile => 'كومة صغيرة',
      WeightCategory.largePile => 'كومة كبيرة',
      WeightCategory.custom => 'وزن يدوي',
    };
  }

  static String _rangeFor(WeightCategory category) {
    return switch (category) {
      WeightCategory.oneSheep => '~2-3 كغ',
      WeightCategory.oneBag => '~5 كغ',
      WeightCategory.smallPile => '~10-20 كغ',
      WeightCategory.largePile => '~50+ كغ',
      WeightCategory.custom => 'دخل الوزن',
    };
  }
}
