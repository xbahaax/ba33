import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// ba33 typography system.
/// - Sans (Roboto Flex): 99% of UI text
/// - Serif (Asul): certificates, marketing, formal documents
/// - Mono (JetBrains Mono): IDs, weights, numbers, technical content
abstract final class Ba33Typography {
  static TextTheme textTheme(Color foreground) {
    final sans = GoogleFonts.robotoFlexTextTheme();
    final mono = GoogleFonts.jetBrainsMonoTextTheme();

    return TextTheme(
      displayLarge: sans.displayLarge?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w700,
      ),
      displayMedium: sans.displayMedium?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w700,
      ),
      displaySmall: sans.displaySmall?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w600,
      ),
      headlineLarge: sans.headlineLarge?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w600,
      ),
      headlineMedium: sans.headlineMedium?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w600,
      ),
      headlineSmall: sans.headlineSmall?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w500,
      ),
      titleLarge: sans.titleLarge?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w600,
      ),
      titleMedium: sans.titleMedium?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w500,
      ),
      titleSmall: sans.titleSmall?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w500,
      ),
      bodyLarge: sans.bodyLarge?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w400,
      ),
      bodyMedium: sans.bodyMedium?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w400,
      ),
      bodySmall: sans.bodySmall?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w400,
      ),
      labelLarge: sans.labelLarge?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w500,
      ),
      labelMedium: sans.labelMedium?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w500,
      ),
      labelSmall: mono.labelSmall?.copyWith(
        color: foreground,
        fontWeight: FontWeight.w400,
      ),
    );
  }

  /// Serif style for certificates and formal documents.
  static TextStyle serif({
    double fontSize = 16,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
  }) {
    return GoogleFonts.asul(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
    );
  }

  /// Mono style for IDs, weights, numbers, technical content.
  static TextStyle mono({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
  }) {
    return GoogleFonts.jetBrainsMono(
      fontSize: fontSize,
      fontWeight: fontWeight,
      color: color,
    );
  }
}
