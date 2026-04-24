import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../view_model/receipts_view_model.dart';
import '../widgets/receipt_card.dart';

/// List of past declarations / pickup receipts.
class ReceiptsScreen extends ConsumerWidget {
  const ReceiptsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;
    final receiptsAsync = ref.watch(receiptsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الوصولات تاعي'),
      ),
      body: receiptsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: colors.destructive),
              const SizedBox(height: Ba33Spacing.spacing4),
              Text(
                'ما قدرناش نحملو الوصولات',
                style: TextStyle(color: colors.mutedForeground),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              OutlinedButton(
                onPressed: () => ref.invalidate(receiptsProvider),
                child: const Text('عاود حاول'),
              ),
            ],
          ),
        ),
        data: (declarations) {
          if (declarations.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: 64,
                    color: colors.mutedForeground,
                  ),
                  const SizedBox(height: Ba33Spacing.spacing4),
                  Text(
                    'ما كاين حتى وصل',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: colors.mutedForeground,
                        ),
                  ),
                  const SizedBox(height: Ba33Spacing.spacing2),
                  Text(
                    'صرح بالصوف باش تشوف الوصولات هنا.',
                    style: TextStyle(color: colors.mutedForeground),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(receiptsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(Ba33Spacing.spacing4),
              itemCount: declarations.length,
              separatorBuilder: (_, _) =>
                  const SizedBox(height: Ba33Spacing.spacing3),
              itemBuilder: (context, index) =>
                  ReceiptCard(declaration: declarations[index]),
            ),
          );
        },
      ),
    );
  }
}
