import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class LotListScreen extends ConsumerWidget {
  const LotListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Lots',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: Center(
        child: Text(
          'No lots yet. Tap + to create one.',
          style: TextStyle(color: colors.mutedForeground),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/lots/create'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
