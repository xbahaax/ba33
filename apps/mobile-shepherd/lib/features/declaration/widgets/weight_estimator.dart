import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Visual weight estimation selector with icons and labels.
/// Designed for users who cannot estimate weight numerically.
/// Includes a "custom" option for entering exact weight manually.
class WeightEstimator extends StatelessWidget {
  const WeightEstimator({
    super.key,
    required this.selected,
    required this.onSelected,
    required this.customWeight,
    required this.onCustomWeightChanged,
  });

  final WeightCategory? selected;
  final ValueChanged<WeightCategory> onSelected;
  final double? customWeight;
  final ValueChanged<double?> onCustomWeightChanged;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final presetCategories = WeightCategory.values
        .where((c) => c != WeightCategory.custom)
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'قداش عندك صوف؟',
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
          children: presetCategories.map((category) {
            final isSelected =
                selected == category && selected != WeightCategory.custom;
            return _WeightOption(
              category: category,
              isSelected: isSelected,
              colors: colors,
              onTap: () => onSelected(category),
            );
          }).toList(),
        ),
        const SizedBox(height: Ba33Spacing.spacing3),
        _CustomWeightOption(
          isSelected: selected == WeightCategory.custom,
          colors: colors,
          customWeight: customWeight,
          onTap: () => onSelected(WeightCategory.custom),
          onWeightChanged: onCustomWeightChanged,
        ),
      ],
    );
  }
}

class _CustomWeightOption extends StatefulWidget {
  const _CustomWeightOption({
    required this.isSelected,
    required this.colors,
    required this.customWeight,
    required this.onTap,
    required this.onWeightChanged,
  });

  final bool isSelected;
  final Ba33Colors colors;
  final double? customWeight;
  final VoidCallback onTap;
  final ValueChanged<double?> onWeightChanged;

  @override
  State<_CustomWeightOption> createState() => _CustomWeightOptionState();
}

class _CustomWeightOptionState extends State<_CustomWeightOption> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
      text: widget.customWeight != null
          ? widget.customWeight.toString()
          : '',
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(
          horizontal: Ba33Spacing.spacing4,
          vertical: Ba33Spacing.spacing3,
        ),
        decoration: BoxDecoration(
          color: widget.isSelected
              ? widget.colors.primary
              : widget.colors.card,
          borderRadius: Ba33Radii.borderRadiusLg,
          border: Border.all(
            color: widget.isSelected
                ? widget.colors.primary
                : widget.colors.border,
            width: widget.isSelected ? 2 : 1,
          ),
          boxShadow: widget.isSelected
              ? Ba33Shadows.shadowSm
              : Ba33Shadows.shadowXs,
        ),
        child: Row(
          children: [
            Icon(
              Icons.edit_outlined,
              size: 28,
              color: widget.isSelected
                  ? widget.colors.primaryForeground
                  : widget.colors.foreground,
            ),
            const SizedBox(width: Ba33Spacing.spacing3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'كمية أخرى',
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(
                          color: widget.isSelected
                              ? widget.colors.primaryForeground
                              : widget.colors.foreground,
                          fontWeight: widget.isSelected
                              ? FontWeight.w600
                              : FontWeight.w400,
                        ),
                  ),
                  Text(
                    'دخل الوزن بالكيلو',
                    style: Ba33Typography.mono(
                      fontSize: 12,
                      color: widget.isSelected
                          ? widget.colors.primaryForeground
                              .withValues(alpha: 0.8)
                          : widget.colors.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),
            if (widget.isSelected) ...[
              const SizedBox(width: Ba33Spacing.spacing3),
              SizedBox(
                width: 100,
                child: TextField(
                  controller: _controller,
                  autofocus: true,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(
                      RegExp(r'^\d*\.?\d*$'),
                    ),
                  ],
                  style: Ba33Typography.mono(
                    fontSize: 18,
                    color: widget.colors.primaryForeground,
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: InputDecoration(
                    hintText: '0.0',
                    hintStyle: Ba33Typography.mono(
                      fontSize: 18,
                      color: widget.colors.primaryForeground
                          .withValues(alpha: 0.4),
                    ),
                    suffixText: 'كغ',
                    suffixStyle: Ba33Typography.mono(
                      fontSize: 14,
                      color: widget.colors.primaryForeground
                          .withValues(alpha: 0.8),
                    ),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: Ba33Spacing.spacing2,
                      vertical: Ba33Spacing.spacing2,
                    ),
                    border: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(Ba33Spacing.spacing2),
                      borderSide: BorderSide(
                        color: widget.colors.primaryForeground
                            .withValues(alpha: 0.3),
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(Ba33Spacing.spacing2),
                      borderSide: BorderSide(
                        color: widget.colors.primaryForeground
                            .withValues(alpha: 0.3),
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(Ba33Spacing.spacing2),
                      borderSide: BorderSide(
                        color: widget.colors.primaryForeground,
                      ),
                    ),
                    filled: true,
                    fillColor:
                        widget.colors.primaryForeground.withValues(alpha: 0.15),
                  ),
                  onChanged: (value) {
                    final parsed = double.tryParse(value);
                    widget.onWeightChanged(parsed);
                  },
                ),
              ),
            ],
          ],
        ),
      ),
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
      WeightCategory.custom => 'كمية أخرى',
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
