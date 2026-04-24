import 'package:flutter/material.dart';

import '../theme/ba33_radii.dart';
import '../theme/ba33_spacing.dart';
import '../theme/ba33_theme.dart';

/// A single-select chip group following ba33 design tokens.
class Ba33ChoiceChips<T> extends StatelessWidget {
  const Ba33ChoiceChips({
    super.key,
    required this.values,
    required this.selected,
    required this.labelBuilder,
    required this.onSelected,
    this.iconBuilder,
  });

  final List<T> values;
  final T? selected;
  final String Function(T) labelBuilder;
  final ValueChanged<T> onSelected;
  final IconData? Function(T)? iconBuilder;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Wrap(
      spacing: Ba33Spacing.spacing2,
      runSpacing: Ba33Spacing.spacing2,
      children: values.map((value) {
        final isSelected = value == selected;
        final icon = iconBuilder?.call(value);

        return GestureDetector(
          onTap: () => onSelected(value),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(
              horizontal: Ba33Spacing.spacing3,
              vertical: Ba33Spacing.spacing2,
            ),
            decoration: BoxDecoration(
              color: isSelected ? colors.primary : colors.secondary,
              borderRadius: Ba33Radii.borderRadiusFull,
              border: Border.all(
                color: isSelected ? colors.primary : colors.border,
                width: 1.5,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(
                    icon,
                    size: 16,
                    color: isSelected
                        ? colors.primaryForeground
                        : colors.foreground,
                  ),
                  const SizedBox(width: 6),
                ],
                Text(
                  labelBuilder(value),
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: isSelected
                            ? colors.primaryForeground
                            : colors.foreground,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.w400,
                      ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
