import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../features/auth/view/login_screen.dart';
import '../features/auth/view_model/auth_view_model.dart';
import '../features/jobs/view/job_detail_screen.dart';
import '../features/jobs/view/job_list_screen.dart';
import '../features/scan/view/scan_screen.dart';
import '../features/trip/view/active_trip_screen.dart';
import '../features/trip/view/pod_screen.dart';
import '../features/trip/view/scan_delivery_screen.dart';
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
    initialLocation: '/login',
    refreshListenable: isAuth,
    redirect: (context, state) {
      final loggedIn = ref.read(authStateProvider).isAuthenticated;
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
      path: '/scan-load',
      name: 'scan-load',
      builder: (context, state) => const ScanScreen(),
    ),
    GoRoute(
      path: '/trip',
      name: 'trip',
      builder: (context, state) => const ActiveTripScreen(),
    ),
    GoRoute(
      path: '/scan-delivery',
      name: 'scan-delivery',
      builder: (context, state) => const ScanDeliveryScreen(),
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
