// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'jobs_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$jobsViewModelHash() => r'a1b2c3d4e5f60718293a4b5c6d7e8f9000000001';

/// Lists collection jobs assigned to or open for the current collector. The
/// list is the collector's instruction queue — the depot/admin issues jobs,
/// the collector picks one and executes it.
///
/// Copied from [JobsViewModel].
@ProviderFor(JobsViewModel)
final jobsViewModelProvider =
    AsyncNotifierProvider<JobsViewModel, List<CollectionJob>>.internal(
  JobsViewModel.new,
  name: r'jobsViewModelProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$jobsViewModelHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$JobsViewModel = AsyncNotifier<List<CollectionJob>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
