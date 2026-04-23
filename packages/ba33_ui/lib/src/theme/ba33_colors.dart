import 'dart:math' as math;

import 'package:flutter/material.dart';

/// ba33 semantic color tokens.
/// All colors derived from OKLCH values per the design system.
/// Never use raw hex/RGB values in app code — always go through these tokens.
class Ba33Colors {
  const Ba33Colors({
    required this.background,
    required this.foreground,
    required this.card,
    required this.cardForeground,
    required this.popover,
    required this.popoverForeground,
    required this.muted,
    required this.mutedForeground,
    required this.accent,
    required this.accentForeground,
    required this.border,
    required this.input,
    required this.ring,
    required this.primary,
    required this.primaryForeground,
    required this.secondary,
    required this.secondaryForeground,
    required this.destructive,
    required this.destructiveForeground,
    required this.chart1,
    required this.chart2,
    required this.chart3,
    required this.chart4,
    required this.chart5,
    required this.sidebar,
    required this.sidebarForeground,
    required this.sidebarPrimary,
    required this.sidebarPrimaryForeground,
    required this.sidebarAccent,
    required this.sidebarAccentForeground,
    required this.sidebarBorder,
    required this.sidebarRing,
  });

  // Surface & text
  final Color background;
  final Color foreground;
  final Color card;
  final Color cardForeground;
  final Color popover;
  final Color popoverForeground;
  final Color muted;
  final Color mutedForeground;
  final Color accent;
  final Color accentForeground;
  final Color border;
  final Color input;
  final Color ring;

  // Intent
  final Color primary;
  final Color primaryForeground;
  final Color secondary;
  final Color secondaryForeground;
  final Color destructive;
  final Color destructiveForeground;

  // Chart
  final Color chart1;
  final Color chart2;
  final Color chart3;
  final Color chart4;
  final Color chart5;

  // Sidebar
  final Color sidebar;
  final Color sidebarForeground;
  final Color sidebarPrimary;
  final Color sidebarPrimaryForeground;
  final Color sidebarAccent;
  final Color sidebarAccentForeground;
  final Color sidebarBorder;
  final Color sidebarRing;

  /// Light theme colors.
  static final light = Ba33Colors(
    background: _oklch(0.99, 0.005, 160),
    foreground: _oklch(0.15, 0.02, 160),
    card: _oklch(0.99, 0.005, 160),
    cardForeground: _oklch(0.15, 0.02, 160),
    popover: _oklch(0.99, 0.005, 160),
    popoverForeground: _oklch(0.15, 0.02, 160),
    muted: _oklch(0.93, 0.01, 160),
    mutedForeground: _oklch(0.50, 0.02, 160),
    accent: _oklch(0.93, 0.01, 160),
    accentForeground: _oklch(0.15, 0.02, 160),
    border: _oklch(0.88, 0.01, 160),
    input: _oklch(0.88, 0.01, 160),
    ring: _oklch(0.55, 0.15, 160),
    primary: _oklch(0.55, 0.15, 160),
    primaryForeground: _oklch(0.98, 0.005, 160),
    secondary: _oklch(0.93, 0.01, 160),
    secondaryForeground: _oklch(0.15, 0.02, 160),
    destructive: _oklch(0.55, 0.20, 25),
    destructiveForeground: _oklch(0.98, 0.005, 25),
    chart1: _oklch(0.55, 0.15, 160),
    chart2: _oklch(0.65, 0.15, 200),
    chart3: _oklch(0.60, 0.12, 280),
    chart4: _oklch(0.70, 0.15, 80),
    chart5: _oklch(0.55, 0.20, 25),
    sidebar: _oklch(0.97, 0.008, 160),
    sidebarForeground: _oklch(0.15, 0.02, 160),
    sidebarPrimary: _oklch(0.55, 0.15, 160),
    sidebarPrimaryForeground: _oklch(0.98, 0.005, 160),
    sidebarAccent: _oklch(0.93, 0.01, 160),
    sidebarAccentForeground: _oklch(0.15, 0.02, 160),
    sidebarBorder: _oklch(0.88, 0.01, 160),
    sidebarRing: _oklch(0.55, 0.15, 160),
  );

  /// Dark theme colors.
  static final dark = Ba33Colors(
    background: _oklch(0.15, 0.02, 160),
    foreground: _oklch(0.93, 0.01, 160),
    card: _oklch(0.18, 0.02, 160),
    cardForeground: _oklch(0.93, 0.01, 160),
    popover: _oklch(0.18, 0.02, 160),
    popoverForeground: _oklch(0.93, 0.01, 160),
    muted: _oklch(0.25, 0.02, 160),
    mutedForeground: _oklch(0.60, 0.02, 160),
    accent: _oklch(0.25, 0.02, 160),
    accentForeground: _oklch(0.93, 0.01, 160),
    border: _oklch(0.30, 0.02, 160),
    input: _oklch(0.30, 0.02, 160),
    ring: _oklch(0.55, 0.15, 160),
    primary: _oklch(0.55, 0.15, 160),
    primaryForeground: _oklch(0.98, 0.005, 160),
    secondary: _oklch(0.25, 0.02, 160),
    secondaryForeground: _oklch(0.93, 0.01, 160),
    destructive: _oklch(0.55, 0.20, 25),
    destructiveForeground: _oklch(0.98, 0.005, 25),
    chart1: _oklch(0.55, 0.15, 160),
    chart2: _oklch(0.65, 0.15, 200),
    chart3: _oklch(0.60, 0.12, 280),
    chart4: _oklch(0.70, 0.15, 80),
    chart5: _oklch(0.55, 0.20, 25),
    sidebar: _oklch(0.18, 0.02, 160),
    sidebarForeground: _oklch(0.93, 0.01, 160),
    sidebarPrimary: _oklch(0.55, 0.15, 160),
    sidebarPrimaryForeground: _oklch(0.98, 0.005, 160),
    sidebarAccent: _oklch(0.25, 0.02, 160),
    sidebarAccentForeground: _oklch(0.93, 0.01, 160),
    sidebarBorder: _oklch(0.30, 0.02, 160),
    sidebarRing: _oklch(0.55, 0.15, 160),
  );

  /// Convert OKLCH (lightness, chroma, hue) to a Flutter [Color].
  static Color _oklch(double l, double c, double h) {
    final hRad = h * math.pi / 180.0;
    final a = c * math.cos(hRad);
    final b = c * math.sin(hRad);

    // OKLab to linear sRGB via LMS
    final l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    final m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    final s_ = l - 0.0894841775 * a - 1.2914855480 * b;

    final lCubed = l_ * l_ * l_;
    final mCubed = m_ * m_ * m_;
    final sCubed = s_ * s_ * s_;

    final rLinear =
        (4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed)
            .clamp(0.0, 1.0);
    final gLinear =
        (-1.2684380046 * lCubed +
                2.6097574011 * mCubed -
                0.3413193965 * sCubed)
            .clamp(0.0, 1.0);
    final bLinear =
        (-0.0041960863 * lCubed -
                0.7034186147 * mCubed +
                1.7076147010 * sCubed)
            .clamp(0.0, 1.0);

    return Color.from(
      alpha: 1.0,
      red: _linearToSrgb(rLinear),
      green: _linearToSrgb(gLinear),
      blue: _linearToSrgb(bLinear),
    );
  }

  static double _linearToSrgb(double linear) {
    if (linear <= 0.0031308) return linear * 12.92;
    return 1.055 * math.pow(linear, 1.0 / 2.4) - 0.055;
  }
}
