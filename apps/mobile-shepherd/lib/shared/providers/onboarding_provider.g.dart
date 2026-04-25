// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'onboarding_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$onboardingSeenHash() =>
    r'a1b2c3d4e5f60718293a4b5c6d7e8f9000000020';

/// Tracks whether the user has dismissed the intro carousel. Used by the
/// router to decide whether to show /onboarding before /login on first launch.
///
/// Copied from [OnboardingSeen].
@ProviderFor(OnboardingSeen)
final onboardingSeenProvider =
    AsyncNotifierProvider<OnboardingSeen, bool>.internal(
  OnboardingSeen.new,
  name: r'onboardingSeenProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$onboardingSeenHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$OnboardingSeen = AsyncNotifier<bool>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
