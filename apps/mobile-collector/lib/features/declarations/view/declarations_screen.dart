import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../view_model/declarations_view_model.dart';
import '../widgets/declaration_card.dart';

class DeclarationsScreen extends ConsumerWidget {
  const DeclarationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(declarationsViewModelProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Pickup Requests',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Ba33EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'Failed to load',
          subtitle: e.toString(),
          action: Ba33Button(
            onPressed: () =>
                ref.read(declarationsViewModelProvider.notifier).refresh(),
            label: 'Retry',
            icon: Icons.refresh_rounded,
          ),
        ),
        data: (declarations) {
          if (declarations.isEmpty) {
            return const Ba33EmptyState(
              icon: Icons.assignment_outlined,
              title: 'No pickup requests',
              subtitle: 'Shepherd declarations will appear here',
            );
          }

          final announced = declarations
              .where((d) => d.status == DeclarationStatus.announced)
              .toList();
          final scheduled = declarations
              .where((d) => d.status == DeclarationStatus.scheduledPickup)
              .toList();

          return RefreshIndicator(
            onRefresh: () =>
                ref.read(declarationsViewModelProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              children: [
                if (announced.isNotEmpty) ...[
                  _SectionHeader(
                    title: 'New Requests',
                    count: announced.length,
                  ),
                  const SizedBox(height: Ba33Spacing.spacing2),
                  ...announced.map((d) => Padding(
                        padding: const EdgeInsets.only(
                            bottom: Ba33Spacing.spacing3),
                        child: DeclarationCard(
                          declaration: d,
                          onSchedule: () => ref
                              .read(declarationsViewModelProvider.notifier)
                              .schedulePickup(d.id)
                              .catchError((e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Failed to schedule: $e')),
                            );
                          }),
                        ),
                      )),
                ],
                if (scheduled.isNotEmpty) ...[
                  const SizedBox(height: Ba33Spacing.spacing4),
                  _SectionHeader(
                    title: 'Scheduled',
                    count: scheduled.length,
                  ),
                  const SizedBox(height: Ba33Spacing.spacing2),
                  ...scheduled.map((d) => Padding(
                        padding: const EdgeInsets.only(
                            bottom: Ba33Spacing.spacing3),
                        child: DeclarationCard(declaration: d),
                      )),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.count});

  final String title;
  final int count;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Row(
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: colors.mutedForeground,
              ),
        ),
        const SizedBox(width: Ba33Spacing.spacing2),
        Ba33Badge(
          label: '$count',
          variant: Ba33BadgeVariant.primary,
        ),
      ],
    );
  }
}
