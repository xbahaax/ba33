import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../features/auth/view/login_screen.dart';
import '../features/home/view/home_shell.dart';
import '../features/jobs/view/active_job_screen.dart';
import '../features/jobs/view/arrival_form_screen.dart';
import '../features/jobs/view/job_detail_screen.dart';
import '../features/jobs/view/job_list_screen.dart';
import '../features/onboarding/view/intro_screen.dart';
import '../features/profile/view/profile_screen.dart';
import '../features/splash/view/splash_screen.dart';
import '../shared/providers/auth_provider.dart';
import '../shared/providers/onboarding_provider.dart';

part 'router.g.dart';

@riverpod
GoRouter router(RouterRef ref) {
  // Bridge Riverpod state into GoRouter via a single ValueNotifier so the
  // router rebuilds redirects when auth or onboarding state changes.
  final notifier = ValueNotifier(0);

  ref.listen(isAuthenticatedProvider, (_, _) => notifier.value++);
  ref.listen(onboardingSeenProvider, (_, _) => notifier.value++);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: notifier,
    redirect: (context, state) {
      final loc = state.matchedLocation;
      // Splash + onboarding are always reachable from anywhere.
      if (loc == '/splash' || loc == '/onboarding') return null;

      final loggedIn = ref.read(isAuthenticatedProvider);
      final onboardingSeen =
          ref.read(onboardingSeenProvider).value ?? false;
      final isLoginRoute = loc == '/login';

      if (!onboardingSeen) return '/onboarding';
      if (!loggedIn && !isLoginRoute) return '/login';
      if (loggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const IntroOnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            HomeShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                name: 'jobs',
                builder: (context, state) => const JobListScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                name: 'profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/jobs/:id',
        name: 'job-detail',
        builder: (context, state) => JobDetailScreen(
          jobId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/jobs/:id/active',
        name: 'job-active',
        builder: (context, state) => ActiveJobScreen(
          jobId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/jobs/:id/arrival',
        name: 'job-arrival',
        builder: (context, state) => ArrivalFormScreen(
          jobId: state.pathParameters['id']!,
        ),
      ),
    ],
  );
}
