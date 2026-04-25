// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'jobs_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$jobsViewModelHash() => r'c4b0a715a1677b205ae5c4419598c77d70d3a4a6';

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
