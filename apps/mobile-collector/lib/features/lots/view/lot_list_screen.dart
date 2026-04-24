import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/providers/lot_repository_provider.dart';
import '../widgets/lot_card.dart';

class LotListScreen extends ConsumerWidget {
  const LotListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lots = ref.watch(lotRepositoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Lots',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        actions: [
          if (lots.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: Ba33Spacing.spacing3),
              child: Ba33Badge(
                label: '${lots.length}',
                variant: Ba33BadgeVariant.primary,
              ),
            ),
        ],
      ),
      body: lots.isEmpty
          ? Ba33EmptyState(
              icon: Icons.inventory_2_outlined,
              title: 'No lots yet',
              subtitle: 'Tap + to create your first wool lot',
              action: Ba33Button(
                onPressed: () => context.push('/lots/create'),
                label: 'Create Lot',
                icon: Icons.add_rounded,
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              itemCount: lots.length,
              separatorBuilder: (_, _) =>
                  const SizedBox(height: Ba33Spacing.spacing3),
              itemBuilder: (context, index) => LotCard(lot: lots[index]),
            ),
      floatingActionButton: lots.isNotEmpty
          ? FloatingActionButton(
              onPressed: () => context.push('/lots/create'),
              child: const Icon(Icons.add),
            )
          : null,
    );
  }
}
