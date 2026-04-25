import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../view_model/active_job_view_model.dart';

/// The form the collector fills on arrival. Combines source-declared data
/// (already shown read-only) with the collector's observed values.
class ArrivalFormScreen extends ConsumerStatefulWidget {
  const ArrivalFormScreen({super.key, required this.jobId});

  final String jobId;

  @override
  ConsumerState<ArrivalFormScreen> createState() => _ArrivalFormScreenState();
}

class _ArrivalFormScreenState extends ConsumerState<ArrivalFormScreen> {
  final _weightCtrl = TextEditingController();
  final _tempCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  String? _stateQuick;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final cur = ref.read(activeJobViewModelProvider).value;
      if (cur == null || cur.job.id != widget.jobId) {
        await ref.read(activeJobViewModelProvider.notifier).load(widget.jobId);
      }
    });
  }

  @override
  void dispose() {
    _weightCtrl.dispose();
    _tempCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  bool get _isValid {
    final w = double.tryParse(_weightCtrl.text);
    return w != null && w > 0;
  }

  Future<void> _submit() async {
    if (!_isValid || _saving) return;
    setState(() => _saving = true);
    try {
      await ref.read(activeJobViewModelProvider.notifier).complete(
            actualWeightKg: _weightCtrl.text,
            stateQuick: _stateQuick,
            coldChainTempC:
                _tempCtrl.text.isNotEmpty ? _tempCtrl.text : null,
            notes: _notesCtrl.text,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mission terminée')),
      );
      context.go('/');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(activeJobViewModelProvider);
    final colors = Theme.of(context).ba33;

    return Scaffold(
      appBar: AppBar(title: const Text('Formulaire de collecte')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (s) {
          if (s == null) return const SizedBox.shrink();
          final job = s.job;
          final preLot = job.preLot;
          final source = job.source;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(Ba33Spacing.spacing4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Ba33Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Déclaré par la source',
                          style: Theme.of(context)
                              .textTheme
                              .titleSmall
                              ?.copyWith(color: colors.mutedForeground)),
                      const SizedBox(height: Ba33Spacing.spacing2),
                      Text(source?.name ?? '—',
                          style: Theme.of(context).textTheme.titleSmall),
                      if (preLot != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Poids déclaré: ${preLot.estimatedWeightKg.toStringAsFixed(1)} kg',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        if (preLot.notes != null && preLot.notes!.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(preLot.notes!,
                                style: Theme.of(context).textTheme.bodySmall),
                          ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: Ba33Spacing.spacing6),

                Ba33Input(
                  label: 'Poids réel (kg)',
                  hint: 'Mesure sur balance',
                  prefixIcon: Icons.scale,
                  controller: _weightCtrl,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(
                        RegExp(r'^\d*\.?\d{0,2}')),
                  ],
                  autofocus: true,
                  onChanged: (_) => setState(() {}),
                ),

                const SizedBox(height: Ba33Spacing.spacing6),

                Text("État de la laine",
                    style: Theme.of(context).textTheme.labelMedium),
                const SizedBox(height: Ba33Spacing.spacing2),
                Ba33ChoiceChips<String>(
                  values: const [
                    'clean',
                    'dirty',
                    'very_dirty',
                    'contaminated',
                    'with_meat',
                  ],
                  selected: _stateQuick,
                  labelBuilder: _stateLabel,
                  onSelected: (v) => setState(() => _stateQuick = v),
                ),

                const SizedBox(height: Ba33Spacing.spacing6),

                if (source?.profession == 'slaughterhouse' ||
                    source?.profession == 'butcher')
                  Ba33Input(
                    label: 'Température (°C)',
                    hint: 'Cold-chain',
                    prefixIcon: Icons.thermostat_outlined,
                    controller: _tempCtrl,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    inputFormatters: [
                      FilteringTextInputFormatter.allow(
                          RegExp(r'^-?\d*\.?\d{0,1}')),
                    ],
                  ),

                if (source?.profession == 'slaughterhouse' ||
                    source?.profession == 'butcher')
                  const SizedBox(height: Ba33Spacing.spacing4),

                Ba33Input(
                  label: 'Notes',
                  hint: 'Observations sur la laine, le contexte…',
                  prefixIcon: Icons.notes_rounded,
                  controller: _notesCtrl,
                  maxLines: 3,
                ),

                const SizedBox(height: Ba33Spacing.spacing8),

                Ba33Button(
                  onPressed: _isValid && !_saving ? _submit : null,
                  label: 'Soumettre la collecte',
                  icon: Icons.check_rounded,
                  size: Ba33ButtonSize.lg,
                  expand: true,
                  isLoading: _saving,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  String _stateLabel(String s) => switch (s) {
        'clean' => 'Propre',
        'dirty' => 'Sale',
        'very_dirty' => 'Très sale',
        'contaminated' => 'Contaminée',
        'with_meat' => 'Avec viande',
        _ => s,
      };
}
