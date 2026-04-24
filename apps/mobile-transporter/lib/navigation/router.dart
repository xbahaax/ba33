import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../features/auth/view/login_screen.dart';
import '../features/auth/view_model/auth_view_model.dart';
import '../features/jobs/view/job_detail_screen.dart';
import '../features/jobs/view/job_list_screen.dart';
import '../features/onboarding/view/onboarding_screen.dart';
import '../features/splash/view/splash_screen.dart';
import '../features/trip/view/active_trip_screen.dart';
import '../features/trip/view/delivery_screen.dart';
import '../features/trip/view/loading_screen.dart';
import '../features/trip/view/pod_screen.dart';
import '../features/trip/view/signature_screen.dart';
import '../features/farmer_declaration/view/farmer_declaration_form_screen.dart';
import '../features/farmer_declaration/view/farmer_declaration_success_screen.dart';

part 'router.g.dart';

@riverpod
GoRouter router(RouterRef ref) {
  final isAuth = ValueNotifier(false);

  ref.listen(authStateProvider, (_, next) {
    isAuth.value = next.isAuthenticated;
  });

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: isAuth,
    redirect: (context, state) {
      final loggedIn = ref.read(authStateProvider).isAuthenticated;
      final loc = state.matchedLocation;

      // Public routes — no auth required
      if (loc == '/splash' || loc == '/onboarding') return null;

      if (!loggedIn && loc != '/login') return '/login';
      if (loggedIn && loc == '/login') return '/';
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
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/',
        name: 'jobs',
        builder: (context, state) => const JobListScreen(),
      ),
      GoRoute(
        path: '/job-detail',
        name: 'job-detail',
        builder: (context, state) => const JobDetailScreen(),
      ),
      GoRoute(
        path: '/load',
        name: 'load',
        builder: (context, state) => const LoadingScreen(),
      ),
      GoRoute(
        path: '/trip',
        name: 'trip',
        builder: (context, state) => const ActiveTripScreen(),
      ),
      GoRoute(
        path: '/deliver',
        name: 'deliver',
        builder: (context, state) => const DeliveryScreen(),
      ),
      GoRoute(
        path: '/signature',
        name: 'signature',
        builder: (context, state) => const SignatureScreen(),
      ),
      GoRoute(
        path: '/pod',
        name: 'pod',
        builder: (context, state) => const PodScreen(),
      ),
      GoRoute(
        path: '/farmer-declare',
        name: 'farmer-declare',
        builder: (context, state) => const FarmerDeclarationFormScreen(),
      ),
      GoRoute(
        path: '/farmer-declare/success',
        name: 'farmer-declare-success',
        builder: (context, state) => const FarmerDeclarationSuccessScreen(),
      ),
    ],
  );
}
