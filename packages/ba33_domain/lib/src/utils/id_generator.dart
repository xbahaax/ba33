/// Generates namespaced IDs for offline-safe lot creation.
/// Format: `{collectorId}-{sequence}-{checksum}`
///
/// IDs are pre-partitioned per device/collector namespace so
/// offline operations cannot collide.
class IdGenerator {
  IdGenerator({required this.namespace});

  final String namespace;
  int _sequence = 0;

  /// Generate the next lot ID for this namespace.
  String nextLotId() {
    _sequence++;
    final raw = '$namespace-${_sequence.toString().padLeft(5, '0')}';
    final checksum = _computeChecksum(raw);
    return '$raw-$checksum';
  }

  /// Simple checksum: sum of char codes mod 36, encoded as base36.
  static String _computeChecksum(String input) {
    var sum = 0;
    for (var i = 0; i < input.length; i++) {
      sum += input.codeUnitAt(i);
    }
    return (sum % 36).toRadixString(36).toUpperCase();
  }

  /// Reset sequence (e.g., at start of day).
  void resetSequence() => _sequence = 0;
}
