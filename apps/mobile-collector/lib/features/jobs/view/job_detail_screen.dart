import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../model/collection_job.dart';
import '../view_model/active_job_view_model.dart';

class JobDetailScreen extends ConsumerStatefulWidget {
  const JobDetailScreen({super.key, required this.jobId});

  final String jobId;

  @override
  ConsumerState<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends ConsumerState<JobDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(activeJobViewModelProvider.notifier).load(widget.jobId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(activeJobViewModelProvider);
    final colors = Theme.of(context).ba33;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Détails'),
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (s) {
          if (s == null) return const SizedBox.shrink();
          final job = s.job;
          final source = job.source;
          final depot = job.depot;
          final preLot = job.preLot;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(Ba33Spacing.spacing4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (job.isUrgent) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: Ba33Spacing.spacing3,
                      vertical: Ba33Spacing.spacing2,
                    ),
                    decoration: BoxDecoration(
                      color: colors.destructive.withAlpha(30),
                      borderRadius: Ba33Radii.borderRadiusSm,
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.priority_high_rounded,
                            color: colors.destructive),
                        const SizedBox(width: Ba33Spacing.spacing2),
                        Text(
                          'Mission urgente',
                          style: Theme.of(context)
                              .textTheme
                              .titleSmall
                              ?.copyWith(color: colors.destructive),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: Ba33Spacing.spacing4),
                ],

                _SectionTitle('Point de départ'),
                _InfoRow(
                  icon: Icons.person_outline_rounded,
                  label: source?.name ?? '—',
                ),
                if (source?.profession != null)
                  _InfoRow(
                    icon: Icons.badge_outlined,
                    label: _professionLabel(source!.profession!),
                  ),
                if (source?.address != null)
                  _InfoRow(
                    icon: Icons.place_outlined,
                    label: source!.address!,
                  ),
                if (source?.contactPhone != null)
                  _InfoRow(
                    icon: Icons.phone_outlined,
                    label: source!.contactPhone!,
                  ),

                const SizedBox(height: Ba33Spacing.spacing4),
                _SectionTitle('Destination'),
                _InfoRow(
                  icon: Icons.warehouse_outlined,
                  label: depot?.name ?? '—',
                ),
                if (depot?.address != null)
                  _InfoRow(
                    icon: Icons.place_outlined,
                    label: depot!.address!,
                  ),

                if (preLot != null) ...[
                  const SizedBox(height: Ba33Spacing.spacing4),
                  _SectionTitle('Déclaré par la source'),
                  _InfoRow(
                    icon: Icons.scale_outlined,
                    label:
                        '${preLot.estimatedWeightKg.toStringAsFixed(1)} kg estimés',
                  ),
                  if (preLot.notes != null && preLot.notes!.isNotEmpty)
                    _InfoRow(
                      icon: Icons.notes_rounded,
                      label: preLot.notes!,
                    ),
                ],

                const SizedBox(height: Ba33Spacing.spacing6),

                if (job.pickupLat != null && job.pickupLng != null)
                  Ba33Button(
                    onPressed: () => _openMaps(job),
                    label: 'Ouvrir Google Maps',
                    icon: Icons.map_outlined,
                    variant: Ba33ButtonVariant.outline,
                    expand: true,
                    size: Ba33ButtonSize.lg,
                  ),

                const SizedBox(height: Ba33Spacing.spacing3),

                _PrimaryAction(
                  job: job,
                  onAccept: () => _onAccept(),
                  onStart: () => _onStart(),
                  onContinue: () =>
                      context.push('/jobs/${Uri.encodeComponent(job.id)}/active'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _onAccept() async {
    try {
      await ref.read(activeJobViewModelProvider.notifier).accept();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    }
  }

  Future<void> _onStart() async {
    try {
      await ref.read(activeJobViewModelProvider.notifier).start();
      if (!mounted) return;
      context.push('/jobs/${Uri.encodeComponent(widget.jobId)}/active');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    }
  }

  Future<void> _openMaps(CollectionJob job) async {
    final lat = job.pickupLat!;
    final lng = job.pickupLng!;
    final url = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  String _professionLabel(String p) => switch (p) {
        'shepherd' => 'Éleveur',
        'slaughterhouse' => 'Abattoir',
        'butcher' => 'Boucher',
        'aggregator' => 'Agrégateur',
        _ => 'Autre',
      };
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Padding(
      padding: const EdgeInsets.only(bottom: Ba33Spacing.spacing2),
      child: Text(
        text,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: colors.mutedForeground,
            ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: colors.mutedForeground),
          const SizedBox(width: Ba33Spacing.spacing2),
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class _PrimaryAction extends StatelessWidget {
  const _PrimaryAction({
    required this.job,
    required this.onAccept,
    required this.onStart,
    required this.onContinue,
  });

  final CollectionJob job;
  final VoidCallback onAccept;
  final VoidCallback onStart;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    switch (job.status) {
      case CollectionJobStatus.pending:
      case CollectionJobStatus.assigned:
        return Ba33Button(
          onPressed: onAccept,
          label: 'Accepter la mission',
          icon: Icons.check_rounded,
          expand: true,
          size: Ba33ButtonSize.lg,
        );
      case CollectionJobStatus.accepted:
        return Ba33Button(
          onPressed: onStart,
          label: 'Démarrer le trajet',
          icon: Icons.directions_car_rounded,
          expand: true,
          size: Ba33ButtonSize.lg,
        );
      case CollectionJobStatus.inProgress:
      case CollectionJobStatus.arrived:
        return Ba33Button(
          onPressed: onContinue,
          label: 'Continuer',
          icon: Icons.navigation_rounded,
          expand: true,
          size: Ba33ButtonSize.lg,
        );
      case CollectionJobStatus.completed:
        return const _CompletedHint(text: 'Mission terminée');
      case CollectionJobStatus.cancelled:
        return const _CompletedHint(text: 'Mission annulée');
    }
  }
}

class _CompletedHint extends StatelessWidget {
  const _CompletedHint({required this.text});
  final String text;
  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
      decoration: BoxDecoration(
        color: colors.muted,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text(text, style: Theme.of(context).textTheme.bodyMedium),
      ),
    );
  }
}
