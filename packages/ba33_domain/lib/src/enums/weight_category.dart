/// Visual weight estimation categories for shepherds
/// who cannot estimate weight numerically.
enum WeightCategory {
  /// ~2-3 kg — wool from a single sheep
  oneSheep,

  /// ~5 kg — one small bag
  oneBag,

  /// ~10-20 kg — a small pile
  smallPile,

  /// ~50+ kg — a large pile
  largePile,

  /// Custom weight — shepherd enters exact kg manually
  custom,
}

extension WeightCategoryEstimate on WeightCategory {
  /// Midpoint estimate in kg as a string (for API submission).
  String get estimatedKg => switch (this) {
        WeightCategory.oneSheep => '2.5',
        WeightCategory.oneBag => '5',
        WeightCategory.smallPile => '15',
        WeightCategory.largePile => '50',
        WeightCategory.custom => '0',
      };

  /// Human-readable range string.
  String get estimatedRange => switch (this) {
        WeightCategory.oneSheep => '2-3',
        WeightCategory.oneBag => '4-6',
        WeightCategory.smallPile => '10-20',
        WeightCategory.largePile => '50+',
        WeightCategory.custom => 'custom',
      };
}
