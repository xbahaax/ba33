// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lot_repository_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$lotRepositoryHash() => r'1d28e3cb0799ab931e04163797600c0b1544c63f';

/// In-memory lot repository.
/// Will be replaced with Drift-backed persistence in a future phase.
///
/// Copied from [LotRepository].
@ProviderFor(LotRepository)
final lotRepositoryProvider =
    NotifierProvider<LotRepository, List<Lot>>.internal(
      LotRepository.new,
      name: r'lotRepositoryProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$lotRepositoryHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$LotRepository = Notifier<List<Lot>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
