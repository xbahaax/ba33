import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/view/login_screen.dart';
import '../features/declaration/view/declaration_form_screen.dart';
import '../features/declaration/view/declaration_screen.dart';
import '../features/declaration/view/declaration_success_screen.dart';
import '../features/home/view/home_shell.dart';
import '../features/profile/view/profile_screen.dart';
import '../features/receipts/view/receipts_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// Main application router.
/// Auth-gated: unauthenticated users see the login screen.
GoRouter createRouter({required bool isAuthenticated}) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      final loggingIn = state.matchedLocation == '/login';
      if (!isAuthenticated && !loggingIn) return '/login';
      if (isAuthenticated && loggingIn) return '/';
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
