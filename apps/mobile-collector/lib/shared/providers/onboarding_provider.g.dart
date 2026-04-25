// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'onboarding_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$onboardingSeenHash() => r'1396737278dc92ec6102195d938fe2f4ec6ade2c';

/// Tracks whether the collector has dismissed the intro carousel. Used by the
/// router to gate /onboarding before /login on first launch.
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
