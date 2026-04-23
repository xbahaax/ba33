import 'package:go_router/go_router.dart';

import '../features/lots/view/lot_list_screen.dart';
import '../features/lots/view/lot_create_screen.dart';

final routerProvider = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      name: 'lots',
      builder: (context, state) => const LotListScreen(),
    ),
    GoRoute(
      path: '/lots/create',
      name: 'create-lot',
      builder: (context, state) => const LotCreateScreen(),
    ),
  ],
);
