import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class LotCreateScreen extends ConsumerWidget {
  const LotCreateScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'New Lot',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Create a new lot',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
            TextFormField(
              decoration: const InputDecoration(
                labelText: 'Weight (kg)',
                hintText: 'Enter weight or use Bluetooth scale',
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
            ElevatedButton(
              onPressed: () {
                // TODO(BA33-002): implement lot creation
              },
              child: const Text('Create Lot'),
            ),
          ],
        ),
      ),
    );
  }
}
