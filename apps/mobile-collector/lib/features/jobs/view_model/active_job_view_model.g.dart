// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'active_job_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$activeJobViewModelHash() =>
    r'a1b2c3d4e5f60718293a4b5c6d7e8f9000000002';

/// State for a collector executing one collection job — keeps GPS samples,
/// pushes them to the backend, and detects arrival when the collector is
/// within [arrivalRadiusMeters] of the source.
///
/// Copied from [ActiveJobViewModel].
@ProviderFor(ActiveJobViewModel)
final activeJobViewModelProvider =
    AsyncNotifierProvider<ActiveJobViewModel, ActiveJobState?>.internal(
  ActiveJobViewModel.new,
  name: r'activeJobViewModelProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$activeJobViewModelHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$ActiveJobViewModel = AsyncNotifier<ActiveJobState?>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
