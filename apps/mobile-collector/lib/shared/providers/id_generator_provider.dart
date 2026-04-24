import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'auth_provider.dart';

part 'id_generator_provider.g.dart';

/// Provides a namespaced [IdGenerator] for the current collector.
@Riverpod(keepAlive: true)
IdGenerator idGenerator(IdGeneratorRef ref) {
  final user = ref.watch(authProvider);
  return IdGenerator(namespace: user?.id ?? 'COL-000');
}
