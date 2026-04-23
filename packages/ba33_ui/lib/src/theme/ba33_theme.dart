import 'package:flutter/material.dart';

import 'ba33_colors.dart';
import 'ba33_radii.dart';
import 'ba33_typography.dart';

/// Extension to access ba33 semantic tokens from any [BuildContext].
///
/// Usage:
/// ```dart
/// final colors = Theme.of(context).ba33;
/// Container(color: colors.primary);
/// ```
extension Ba33ThemeExtension on ThemeData {
  Ba33Colors get ba33 =>
      brightness == Brightness.dark ? Ba33Colors.dark : Ba33Colors.light;
}

/// Builds the full Material 3 [ThemeData] from ba33 design tokens.
abstract final class Ba33Theme {
  static ThemeData light() => _build(Brightness.light, Ba33Colors.light);
  static ThemeData dark() => _build(Brightness.dark, Ba33Colors.dark);

  static ThemeData _build(Brightness brightness, Ba33Colors colors) {
    final textTheme = Ba33Typography.textTheme(colors.foreground);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: colors.background,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: colors.primary,
        onPrimary: colors.primaryForeground,
        secondary: colors.secondary,
        onSecondary: colors.secondaryForeground,
        error: colors.destructive,
        onError: colors.destructiveForeground,
        surface: colors.card,
        onSurface: colors.cardForeground,
        surfaceContainerHighest: colors.muted,
        onSurfaceVariant: colors.mutedForeground,
        outline: colors.border,
        outlineVariant: colors.input,
      ),
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: colors.background,
        foregroundColor: colors.foreground,
        elevation: 0,
        scrolledUnderElevation: 1,
        surfaceTintColor: colors.primary,
      ),
      cardTheme: CardThemeData(
        color: colors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: Ba33Radii.borderRadiusLg,
          side: BorderSide(color: colors.border, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colors.primary,
          foregroundColor: colors.primaryForeground,
          shape: RoundedRectangleBorder(
            borderRadius: Ba33Radii.borderRadiusLg,
          ),
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: colors.foreground,
          side: BorderSide(color: colors.border),
          shape: RoundedRectangleBorder(
            borderRadius: Ba33Radii.borderRadiusLg,
          ),
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: colors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: Ba33Radii.borderRadiusLg,
          ),
          textStyle: textTheme.labelLarge,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: colors.secondary,
          foregroundColor: colors.secondaryForeground,
          shape: RoundedRectangleBorder(
            borderRadius: Ba33Radii.borderRadiusLg,
          ),
          textStyle: textTheme.labelLarge,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colors.background,
        border: OutlineInputBorder(
          borderRadius: Ba33Radii.borderRadiusLg,
          borderSide: BorderSide(color: colors.input),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: Ba33Radii.borderRadiusLg,
          borderSide: BorderSide(color: colors.input),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: Ba33Radii.borderRadiusLg,
          borderSide: BorderSide(color: colors.ring, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: Ba33Radii.borderRadiusLg,
          borderSide: BorderSide(color: colors.destructive),
        ),
        hintStyle: TextStyle(color: colors.mutedForeground),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: colors.secondary,
        labelStyle: TextStyle(color: colors.secondaryForeground),
        shape: RoundedRectangleBorder(
          borderRadius: Ba33Radii.borderRadiusSm,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: colors.popover,
        shape: RoundedRectangleBorder(
          borderRadius: Ba33Radii.borderRadiusXl,
        ),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: colors.card,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: colors.border,
        thickness: 1,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: colors.card,
        indicatorColor: colors.primary,
        iconTheme: WidgetStatePropertyAll(
          IconThemeData(color: colors.mutedForeground),
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: colors.primary,
        foregroundColor: colors.primaryForeground,
        shape: RoundedRectangleBorder(
          borderRadius: Ba33Radii.borderRadiusLg,
        ),
      ),
    );
  }
}
