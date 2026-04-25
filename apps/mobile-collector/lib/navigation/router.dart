import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../features/auth/view/login_screen.dart';
import '../features/home/view/home_shell.dart';
import '../features/jobs/view/active_job_screen.dart';
import '../features/jobs/view/arrival_form_screen.dart';
import '../features/jobs/view/job_detail_screen.dart';
import '../features/jobs/view/job_list_screen.dart';
import '../features/profile/view/profile_screen.dart';
import '../shared/providers/auth_provider.dart';

part 'router.g.dart';

@riverpod
GoRouter router(RouterRef ref) {
  final isAuth = ValueNotifier(false);

  ref.listen(isAuthenticatedProvider, (_, next) {
    isAuth.value = next;
  });

  return GoRouter(
    initialLocation: '/login',
    refreshListenable: isAuth,
    redirect: (context, state) {
      final loggedIn = ref.read(isAuthenticatedProvider);
      final isLoginRoute = state.matchedLocation == '/login';

      if (!loggedIn && !isLoginRoute) return '/login';
      if (loggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
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
