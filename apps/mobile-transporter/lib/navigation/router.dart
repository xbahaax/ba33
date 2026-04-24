import 'package:go_router/go_router.dart';

import '../features/auth/view/login_screen.dart';
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
