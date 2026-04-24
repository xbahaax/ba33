// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'id_generator_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$idGeneratorHash() => r'8d5d413aeae700d992e8089b4c27a957f6948598';

/// Provides a namespaced [IdGenerator] for the current collector.
/// Namespace is hardcoded for now — will come from auth in a future phase.
///
/// Copied from [idGenerator].
@ProviderFor(idGenerator)
final idGeneratorProvider = Provider<IdGenerator>.internal(
  idGenerator,
  name: r'idGeneratorProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$idGeneratorHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef IdGeneratorRef = ProviderRef<IdGenerator>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
