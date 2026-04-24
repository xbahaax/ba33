import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'id_generator_provider.g.dart';

/// Provides a namespaced [IdGenerator] for the current collector.
/// Namespace is hardcoded for now — will come from auth in a future phase.
@Riverpod(keepAlive: true)
IdGenerator idGenerator(IdGeneratorRef ref) {
  return IdGenerator(namespace: 'COL-001');
}
