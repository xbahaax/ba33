import 'package:go_router/go_router.dart';

import '../features/declaration/view/declaration_screen.dart';
import '../features/receipts/view/receipts_screen.dart';

final routerProvider = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      name: 'home',
      builder: (context, state) => const DeclarationScreen(),
    ),
    GoRoute(
      path: '/receipts',
      name: 'receipts',
      builder: (context, state) => const ReceiptsScreen(),
    ),
  ],
);
