import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/view/login_screen.dart';
import '../features/declaration/view/declaration_form_screen.dart';
import '../features/declaration/view/declaration_screen.dart';
import '../features/declaration/view/declaration_success_screen.dart';
import '../features/home/view/home_shell.dart';
import '../features/onboarding/view/intro_screen.dart';
import '../features/onboarding/view/profession_picker_screen.dart';
import '../features/profile/view/profile_screen.dart';
import '../features/receipts/view/receipts_screen.dart';
import '../features/splash/view/splash_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// Main application router.
/// Splash → Onboarding (first time) → Login (if not authed) → Profession picker
/// (if no profession) → Home tabs.
GoRouter createRouter({
  required bool isAuthenticated,
  required bool hasProfession,
  required bool onboardingSeen,
}) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final loc = state.matchedLocation;
      // Splash + onboarding routes are always reachable from anywhere — they
      // self-redirect once the underlying state is known.
      if (loc == '/splash' || loc == '/onboarding') return null;

      final picking = loc == '/onboarding/profession';
      final loggingIn = loc == '/login';

      if (!onboardingSeen) return '/onboarding';
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
