// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'declarations_view_model.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$declarationsViewModelHash() =>
    r'fd67042045247d6c9581a89e78f37b00c9fd4841';

/// Manages the list of shepherd declarations (pickup requests).
///
/// Copied from [DeclarationsViewModel].
@ProviderFor(DeclarationsViewModel)
final declarationsViewModelProvider =
    NotifierProvider<
      DeclarationsViewModel,
      AsyncValue<List<Declaration>>
    >.internal(
      DeclarationsViewModel.new,
      name: r'declarationsViewModelProvider',
      debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
          ? null
          : _$declarationsViewModelHash,
      dependencies: null,
      allTransitiveDependencies: null,
    );

typedef _$DeclarationsViewModel = Notifier<AsyncValue<List<Declaration>>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
