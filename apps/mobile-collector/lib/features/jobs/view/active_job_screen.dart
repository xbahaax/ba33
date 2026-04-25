import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../model/collection_job.dart';
import '../view_model/active_job_view_model.dart';

class ActiveJobScreen extends ConsumerStatefulWidget {
  const ActiveJobScreen({super.key, required this.jobId});

  final String jobId;

  @override
  ConsumerState<ActiveJobScreen> createState() => _ActiveJobScreenState();
}

class _ActiveJobScreenState extends ConsumerState<ActiveJobScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      // The detail screen already loaded the job, but if the user deep-linked
      // here we make sure the VM is populated.
      final cur = ref.read(activeJobViewModelProvider).value;
      if (cur == null || cur.job.id != widget.jobId) {
        await ref.read(activeJobViewModelProvider.notifier).load(widget.jobId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(activeJobViewModelProvider);
    final colors = Theme.of(context).ba33;

    return Scaffold(
      appBar: AppBar(title: const Text('Mission en cours')),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (s) {
          if (s == null) {
            return const Center(child: CircularProgressIndicator());
          }
          final job = s.job;
          final distance = s.distanceToOriginMeters;
          final hasArrived = s.hasArrived;

          return Padding(
            padding: const EdgeInsets.all(Ba33Spacing.spacing4),
            child: Column(
              children: [
                _ProgressBanner(
                  job: job,
                  distance: distance,
                  hasArrived: hasArrived,
                ),
                const SizedBox(height: Ba33Spacing.spacing4),

                Ba33Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Trajet',
                          style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: Ba33Spacing.spacing2),
                      _StatRow(
                        label: 'Points GPS enregistrés',
                        value: '${s.points.length}',
                      ),
                      if (s.lastFix != null) ...[
                        _StatRow(
                          label: 'Vitesse',
                          value: s.lastFix!.speed >= 0
                              ? '${(s.lastFix!.speed * 3.6).toStringAsFixed(0)} km/h'
                              : '—',
                        ),
                        _StatRow(
                          label: 'Précision',
                          value: '${s.lastFix!.accuracy.toStringAsFixed(0)} m',
                        ),
                      ],
                      if (s.isPushing)
                        Padding(
                          padding:
                              const EdgeInsets.only(top: Ba33Spacing.spacing2),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 12,
                                height: 12,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: colors.primary,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text('Synchronisation…',
                                  style: Theme.of(context).textTheme.bodySmall),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),

                if (s.error != null) ...[
                  const SizedBox(height: Ba33Spacing.spacing3),
                  Text(
                    s.error!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: colors.destructive,
                        ),
                  ),
                ],

                const Spacer(),

                if (job.pickupLat != null && job.pickupLng != null)
                  Ba33Button(
                    onPressed: () => _openMaps(job),
                    label: 'Ouvrir Maps',
                    icon: Icons.map_outlined,
                    variant: Ba33ButtonVariant.outline,
                    expand: true,
                  ),
                const SizedBox(height: Ba33Spacing.spacing2),

                if (job.status == CollectionJobStatus.inProgress)
                  Ba33Button(
                    onPressed: hasArrived
                        ? () => _onArrive()
                        : () => _confirmManualArrival(),
                    label: hasArrived
                        ? 'Confirmer l\'arrivée'
                        : 'Je suis arrivé manuellement',
                    icon: Icons.flag_rounded,
                    expand: true,
                    size: Ba33ButtonSize.lg,
                    variant: hasArrived
                        ? Ba33ButtonVariant.primary
                        : Ba33ButtonVariant.outline,
                  ),

                if (job.status == CollectionJobStatus.arrived)
                  Ba33Button(
                    onPressed: () => context.push(
                        '/jobs/${Uri.encodeComponent(widget.jobId)}/arrival'),
                    label: 'Remplir le formulaire de collecte',
                    icon: Icons.assignment_rounded,
                    expand: true,
                    size: Ba33ButtonSize.lg,
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _onArrive() async {
    try {
      await ref.read(activeJobViewModelProvider.notifier).markArrived();
      if (!mounted) return;
      context.push('/jobs/${Uri.encodeComponent(widget.jobId)}/arrival');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Erreur: $e')));
    }
  }

  Future<void> _confirmManualArrival() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmer l\'arrivée'),
        content: const Text(
          'Vous n\'êtes pas encore proche du point de départ d\'après le GPS. '
          'Voulez-vous quand même marquer comme arrivé ?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Confirmer'),
          ),
        ],
      ),
    );
    if (confirm == true) await _onArrive();
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
}

class _ProgressBanner extends StatelessWidget {
  const _ProgressBanner({
    required this.job,
    required this.distance,
    required this.hasArrived,
  });

  final CollectionJob job;
  final double? distance;
  final bool hasArrived;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final color = hasArrived ? colors.primary : colors.foreground;
    final label = hasArrived
        ? 'Vous êtes au point de départ'
        : (distance != null
            ? '${distance!.toStringAsFixed(0)} m du départ'
            : 'En route…');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
      decoration: BoxDecoration(
        color: hasArrived
            ? colors.primary.withAlpha(20)
            : colors.muted,
        borderRadius: Ba33Radii.borderRadiusLg,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            job.source?.name ?? 'Source',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  const _StatRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: colors.mutedForeground)),
          Text(value, style: Ba33Typography.mono(fontSize: 13)),
        ],
      ),
    );
  }
}
