import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Bottom navigation shell wrapping the main screens.
class HomeShell extends StatelessWidget {
  const HomeShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => navigationShell.goBranch(
          index,
          initialLocation: index == navigationShell.currentIndex,
        ),
        backgroundColor: colors.card,
        indicatorColor: colors.primary,
        destinations: [
          NavigationDestination(
            icon: Icon(Icons.grass_outlined, color: colors.mutedForeground),
            selectedIcon: Icon(Icons.grass, color: colors.primaryForeground),
            label: 'تصريح',
          ),
          NavigationDestination(
            icon: Icon(
              Icons.receipt_long_outlined,
              color: colors.mutedForeground,
            ),
            selectedIcon:
                Icon(Icons.receipt_long, color: colors.primaryForeground),
            label: 'وصولات',
          ),
          NavigationDestination(
            icon:
                Icon(Icons.person_outline, color: colors.mutedForeground),
            selectedIcon:
                Icon(Icons.person, color: colors.primaryForeground),
            label: 'حسابي',
          ),
        ],
      ),
    );
  }
}
