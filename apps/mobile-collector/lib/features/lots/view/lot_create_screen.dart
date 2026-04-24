import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../view_model/lot_create_view_model.dart';

class LotCreateScreen extends ConsumerWidget {
  const LotCreateScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formState = ref.watch(lotCreateViewModelProvider);
    final vm = ref.read(lotCreateViewModelProvider.notifier);
    final colors = Theme.of(context).ba33;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'New Lot',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- Weight ---
            Ba33Input(
              label: 'Weight (kg)',
              hint: 'Enter weight',
              prefixIcon: Icons.scale,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
              ],
              autofocus: true,
              onChanged: (value) {
                final parsed = double.tryParse(value);
                if (parsed != null) vm.setWeight(parsed);
              },
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            // --- Source Type ---
            Text('Source Type',
                style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: Ba33Spacing.spacing2),
            Ba33ChoiceChips<SourceType>(
              values: SourceType.values,
              selected: formState.sourceType,
              labelBuilder: _sourceLabel,
              iconBuilder: _sourceIcon,
              onSelected: vm.setSourceType,
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            // --- Wool State ---
            Text('Wool State',
                style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: Ba33Spacing.spacing2),
            Ba33ChoiceChips<WoolState>(
              values: WoolState.values,
              selected: formState.woolState,
              labelBuilder: _woolLabel,
              onSelected: vm.setWoolState,
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            // --- Urgency toggle ---
            Ba33Card(
              onTap: vm.toggleUrgent,
              padding: const EdgeInsets.symmetric(
                horizontal: Ba33Spacing.spacing4,
                vertical: Ba33Spacing.spacing3,
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.priority_high_rounded,
                    color: formState.isUrgent
                        ? colors.destructive
                        : colors.mutedForeground,
                  ),
                  const SizedBox(width: Ba33Spacing.spacing3),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Urgent',
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                        Text(
                          formState.sourceType == SourceType.c2
                              ? 'Auto-enabled for slaughterhouse wool'
                              : 'Mark as cold-chain priority',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: colors.mutedForeground,
                                  ),
                        ),
                      ],
                    ),
                  ),
                  Switch.adaptive(
                    value: formState.isUrgent,
                    onChanged: formState.sourceType == SourceType.c2
                        ? null
                        : (_) => vm.toggleUrgent(),
                    activeTrackColor: colors.destructive,
                  ),
                ],
              ),
            ),

            const SizedBox(height: Ba33Spacing.spacing4),

            // --- Notes ---
            Ba33Input(
              label: 'Notes (optional)',
              hint: 'Any additional observations...',
              prefixIcon: Icons.notes_rounded,
              maxLines: 3,
              onChanged: vm.setNotes,
            ),

            // --- Error ---
            if (formState.error != null) ...[
              const SizedBox(height: Ba33Spacing.spacing4),
              Text(
                formState.error!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: colors.destructive,
                    ),
              ),
            ],

            const SizedBox(height: Ba33Spacing.spacing8),

            // --- Create Button ---
            Ba33Button(
              onPressed: formState.isValid
                  ? () {
                      final lotId = vm.createLot();
                      if (lotId != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Lot $lotId created'),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                        context.pop();
                      }
                    }
                  : null,
              label: 'Create Lot',
              icon: Icons.check_rounded,
              size: Ba33ButtonSize.lg,
              expand: true,
              isLoading: formState.isSaving,
            ),
          ],
        ),
      ),
    );
  }

  String _sourceLabel(SourceType type) => switch (type) {
        SourceType.c1 => 'Shepherd',
        SourceType.c2 => 'Slaughterhouse',
        SourceType.c3 => 'Aggregator',
      };

  IconData? _sourceIcon(SourceType type) => switch (type) {
        SourceType.c1 => Icons.person_rounded,
        SourceType.c2 => Icons.warehouse_rounded,
        SourceType.c3 => Icons.groups_rounded,
      };

  String _woolLabel(WoolState ws) => switch (ws) {
        WoolState.clean => 'Clean',
        WoolState.dirty => 'Dirty',
        WoolState.veryDirty => 'Very Dirty',
        WoolState.contaminated => 'Contaminated',
        WoolState.withMeat => 'With Meat',
      };
}
