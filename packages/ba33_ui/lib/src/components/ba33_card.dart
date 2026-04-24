import 'package:flutter/material.dart';

import '../theme/ba33_radii.dart';
import '../theme/ba33_shadows.dart';
import '../theme/ba33_spacing.dart';
import '../theme/ba33_theme.dart';

/// ba33 design-system card.
class Ba33Card extends StatelessWidget {
  const Ba33Card({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.elevated = false,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets? padding;
  final bool elevated;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    final decoration = BoxDecoration(
      color: colors.card,
      borderRadius: Ba33Radii.borderRadiusLg,
      border: elevated ? null : Border.all(color: colors.border),
      boxShadow: elevated ? Ba33Shadows.shadowSm : null,
    );

    final content = Container(
      decoration: decoration,
      padding: padding ??
          const EdgeInsets.all(Ba33Spacing.spacing4),
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: Ba33Radii.borderRadiusLg,
          child: content,
        ),
      );
    }

    return content;
  }
}
