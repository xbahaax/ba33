import 'package:flutter/material.dart';

/// ba33 border radius scale.
/// Base: 12px. No hard corners (radius-0) allowed in ba33.
abstract final class Ba33Radii {
  static const double sm = 8;
  static const double md = 10;
  static const double lg = 12; // default — ba33 signature
  static const double xl = 16;
  static const double full = 9999;

  static final borderRadiusSm = BorderRadius.circular(sm);
  static final borderRadiusMd = BorderRadius.circular(md);
  static final borderRadiusLg = BorderRadius.circular(lg);
  static final borderRadiusXl = BorderRadius.circular(xl);
  static final borderRadiusFull = BorderRadius.circular(full);
}
