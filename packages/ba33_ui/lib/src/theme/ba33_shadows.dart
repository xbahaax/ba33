import 'package:flutter/material.dart';

/// ba33 elevation / shadow scale — 8 levels.
/// Hierarchy must be respected: modals > popovers > cards.
abstract final class Ba33Shadows {
  static const shadow2xs = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.03),
      blurRadius: 1,
      offset: Offset(0, 1),
    ),
  ];

  static const shadowXs = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.05),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  static const shadowSm = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.05),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.03),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  static const shadow = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.07),
      blurRadius: 6,
      offset: Offset(0, 3),
    ),
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.04),
      blurRadius: 3,
      offset: Offset(0, 2),
    ),
  ];

  static const shadowMd = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.08),
      blurRadius: 10,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.04),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];

  static const shadowLg = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.10),
      blurRadius: 16,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.05),
      blurRadius: 6,
      offset: Offset(0, 3),
    ),
  ];

  static const shadowXl = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.12),
      blurRadius: 24,
      offset: Offset(0, 12),
    ),
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.06),
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
  ];

  static const shadow2xl = [
    BoxShadow(
      color: Color.fromRGBO(0, 0, 0, 0.18),
      blurRadius: 32,
      offset: Offset(0, 16),
    ),
  ];
}
