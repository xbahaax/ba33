import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

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
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        backgroundColor: colors.card,
        indicatorColor: colors.primary.withAlpha(30),
        destinations: [
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined,
                color: colors.mutedForeground),
            selectedIcon: Icon(Icons.inventory_2, color: colors.primary),
            label: 'Lots',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined,
                color: colors.mutedForeground),
            selectedIcon: Icon(Icons.assignment, color: colors.primary),
            label: 'Pickups',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded,
                color: colors.mutedForeground),
            selectedIcon:
                Icon(Icons.person_rounded, color: colors.primary),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
