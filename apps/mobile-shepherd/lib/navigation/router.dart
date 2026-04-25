import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/view/login_screen.dart';
import '../features/declaration/view/declaration_form_screen.dart';
import '../features/declaration/view/declaration_screen.dart';
import '../features/declaration/view/declaration_success_screen.dart';
import '../features/home/view/home_shell.dart';
import '../features/onboarding/view/profession_picker_screen.dart';
import '../features/profile/view/profile_screen.dart';
import '../features/receipts/view/receipts_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// Main application router.
/// Auth-gated: unauthenticated users see the login screen.
/// Onboarding-gated: authenticated users without a profession set are sent
/// to the profession picker before they can declare wool.
GoRouter createRouter({
  required bool isAuthenticated,
  required bool hasProfession,
}) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final loggingIn = state.matchedLocation == '/login';
      final picking = state.matchedLocation == '/onboarding/profession';

      if (!isAuthenticated && !loggingIn) return '/login';
      if (isAuthenticated && loggingIn) {
        return hasProfession ? '/' : '/onboarding/profession';
      }
      if (isAuthenticated && !hasProfession && !picking) {
        return '/onboarding/profession';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/onboarding/profession',
        name: 'profession',
        builder: (context, state) => const ProfessionPickerScreen(),
      ),
      GoRoute(
        path: '/profile/profession',
        name: 'profile-profession',
        builder: (context, state) =>
            const ProfessionPickerScreen(allowSkip: true),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            HomeShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                name: 'home',
                builder: (context, state) => const DeclarationScreen(),
                routes: [
                  GoRoute(
                    path: 'declaration/form',
                    name: 'declarationForm',
                    builder: (context, state) =>
                        const DeclarationFormScreen(),
                  ),
                  GoRoute(
                    path: 'declaration/success',
                    name: 'declarationSuccess',
                    builder: (context, state) =>
                        const DeclarationSuccessScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/receipts',
                name: 'receipts',
                builder: (context, state) => const ReceiptsScreen(),
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
    ],
  );
}
