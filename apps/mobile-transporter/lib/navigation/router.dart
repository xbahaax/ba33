import 'package:go_router/go_router.dart';

import '../features/auth/view/login_screen.dart';
import '../features/jobs/view/job_detail_screen.dart';
import '../features/jobs/view/job_list_screen.dart';
import '../features/onboarding/view/onboarding_screen.dart';
import '../features/scan/view/scan_screen.dart';
import '../features/splash/view/splash_screen.dart';
import '../features/trip/view/active_trip_screen.dart';
import '../features/trip/view/pod_screen.dart';
import '../features/trip/view/scan_delivery_screen.dart';
import '../features/trip/view/signature_screen.dart';
import '../features/farmer_declaration/view/farmer_declaration_form_screen.dart';
import '../features/farmer_declaration/view/farmer_declaration_success_screen.dart';

final routerProvider = GoRouter(
  initialLocation: '/splash',
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
