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
