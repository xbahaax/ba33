/// Status of a shepherd's wool declaration (pre-lot).
enum DeclarationStatus {
  /// Shepherd announced wool availability.
  announced,

  /// A collector pickup has been scheduled.
  scheduledPickup,

  /// Collector arrived and collected the wool — becomes a real lot.
  collected,

  /// Shepherd cancelled the declaration.
  cancelled,
}
