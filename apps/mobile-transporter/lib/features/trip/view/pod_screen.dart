import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../jobs/model/transport_job.dart';
import '../view_model/active_trip_view_model.dart';
import '../../../shared/services/pdf_service.dart';

class PodScreen extends ConsumerWidget {
  const PodScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trip = ref.watch(activeTripProvider);
    if (trip == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final job = trip.job;
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    final totalLoaded = job.totalLoadedWeight;
    final totalDelivered = job.totalDeliveredWeight;
    final delta = totalDelivered - totalLoaded;
    final hasMismatch = job.hasMismatch;

    return Scaffold(
      backgroundColor: colors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(Ba33Spacing.spacing4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Success header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(Ba33Spacing.spacing6),
                decoration: BoxDecoration(
                  color: colors.primary.withOpacity(0.08),
                  borderRadius: Ba33Radii.borderRadiusLg,
                  border: Border.all(
                    color: colors.primary.withOpacity(0.3),
                  ),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: colors.primary,
                        borderRadius: Ba33Radii.borderRadiusFull,
                      ),
                      child: Icon(
                        Icons.check,
                        color: colors.primaryForeground,
                        size: 32,
                      ),
                    ),
                    const SizedBox(height: Ba33Spacing.spacing3),
                    Text(
                      'التسليم تأكد',
                      style: textTheme.headlineSmall,
                    ),
                    const SizedBox(height: Ba33Spacing.spacing1),
                    Text(
                      'بون التسليم تولد',
                      style: textTheme.bodySmall
                          ?.copyWith(color: colors.mutedForeground),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),

              // Job info
              _InfoCard(
                colors: colors,
                children: [
                  _InfoRow(
                    label: 'المهمة',
                    value: job.id,
                    mono: true,
                    colors: colors,
                  ),
                  _InfoRow(
                    label: 'الأصل',
                    value: job.originName,
                    colors: colors,
                  ),
                  _InfoRow(
                    label: 'الوجهة',
                    value: job.destinationName,
                    colors: colors,
                  ),
                  if (trip.receiverName != null)
                    _InfoRow(
                      label: 'استلمه',
                      value: trip.receiverName!,
                      colors: colors,
                    ),
                ],
              ),
              const SizedBox(height: Ba33Spacing.spacing4),

              // Weight reconciliation
              Text('مقارنة الأوزان', style: textTheme.titleMedium),
              const SizedBox(height: Ba33Spacing.spacing3),
              Container(
                decoration: BoxDecoration(
                  color: colors.card,
                  borderRadius: Ba33Radii.borderRadiusLg,
                  border: Border.all(color: colors.border),
                ),
                child: Column(
                  children: [
                    // Table header
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: Ba33Spacing.spacing4,
                        vertical: Ba33Spacing.spacing2,
                      ),
                      decoration: BoxDecoration(
                        color: colors.muted,
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(Ba33Radii.lg),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Text(
                              'لوت',
                              style: textTheme.labelSmall?.copyWith(
                                color: colors.mutedForeground,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              'محمل',
                              textAlign: TextAlign.end,
                              style: textTheme.labelSmall?.copyWith(
                                color: colors.mutedForeground,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              'مسلم',
                              textAlign: TextAlign.end,
                              style: textTheme.labelSmall?.copyWith(
                                color: colors.mutedForeground,
                              ),
                            ),
                          ),
                          const SizedBox(width: 24),
                        ],
                      ),
                    ),
                    ...job.lots.map((lot) => _LotRow(lot: lot, colors: colors)),
                    // Total row
                    Container(
                      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                      decoration: BoxDecoration(
                        color: hasMismatch
                            ? colors.destructive.withOpacity(0.05)
                            : colors.primary.withOpacity(0.05),
                        borderRadius: const BorderRadius.vertical(
                          bottom: Radius.circular(Ba33Radii.lg),
                        ),
                        border: Border(
                          top: BorderSide(color: colors.border),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Text(
                              'المجموع',
                              style: textTheme.labelLarge,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              '${totalLoaded.toStringAsFixed(1)} كغ',
                              textAlign: TextAlign.end,
                              style: Ba33Typography.mono(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: colors.foreground,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Text(
                              '${totalDelivered.toStringAsFixed(1)} كغ',
                              textAlign: TextAlign.end,
                              style: Ba33Typography.mono(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: hasMismatch
                                    ? colors.destructive
                                    : colors.primary,
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 24,
                            child: Icon(
                              hasMismatch
                                  ? Icons.warning_amber
                                  : Icons.check_circle,
                              size: 16,
                              color: hasMismatch
                                  ? colors.destructive
                                  : colors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              if (hasMismatch) ...[
                const SizedBox(height: Ba33Spacing.spacing3),
                Container(
                  padding: const EdgeInsets.all(Ba33Spacing.spacing3),
                  decoration: BoxDecoration(
                    color: colors.destructive.withOpacity(0.08),
                    borderRadius: Ba33Radii.borderRadiusMd,
                    border:
                        Border.all(color: colors.destructive.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.warning_amber,
                          color: colors.destructive, size: 18),
                      const SizedBox(width: Ba33Spacing.spacing3),
                      Expanded(
                        child: Text(
                          'مشكلة نقطة سوداء تبلغت. '
                          'فرق ${delta.abs().toStringAsFixed(2)} كغ '
                          'تبعث للعمليات المركزية.',
                          style: textTheme.bodySmall
                              ?.copyWith(color: colors.destructive),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: Ba33Spacing.spacing4),

              // Signature preview
              if (trip.signatureBytes != null) ...[
                Text('توقيع المستلم',
                    style: textTheme.titleMedium),
                const SizedBox(height: Ba33Spacing.spacing3),
                Container(
                  height: 100,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: Ba33Radii.borderRadiusLg,
                    border: Border.all(color: colors.border),
                  ),
                  child: ClipRRect(
                    borderRadius: Ba33Radii.borderRadiusLg,
                    child: Image.memory(
                      trip.signatureBytes!,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                if (trip.receiverName != null) ...[
                  const SizedBox(height: Ba33Spacing.spacing2),
                  Text(
                    trip.receiverName!,
                    style: Ba33Typography.mono(
                      fontSize: 12,
                      color: colors.mutedForeground,
                    ),
                  ),
                ],
              ],

              const SizedBox(height: Ba33Spacing.spacing6),

              // Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final t = ref.read(activeTripProvider);
                        if (t != null) await PdfService.sharePoD(t);
                      },
                      icon: const Icon(Icons.picture_as_pdf_outlined),
                      label: const Text('صدر PDF'),
                    ),
                  ),
                  const SizedBox(width: Ba33Spacing.spacing3),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        ref.read(activeTripProvider.notifier).reset();
                        context.go('/');
                      },
                      child: const Text('خلاص'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
            ],
          ),
        ),
      ),
    );
  }
}

class _LotRow extends StatelessWidget {
  const _LotRow({required this.lot, required this.colors});

  final TransportLot lot;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    final mismatch = lot.hasMismatch;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Ba33Spacing.spacing4,
        vertical: Ba33Spacing.spacing3,
      ),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: colors.border, width: 0.5)),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(
              lot.qrCode,
              style: Ba33Typography.mono(
                fontSize: 11,
                color: colors.foreground,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Expanded(
            child: Text(
              '${(lot.loadedWeight ?? lot.declaredWeight).toStringAsFixed(1)} كغ',
              textAlign: TextAlign.end,
              style: Ba33Typography.mono(
                fontSize: 12,
                color: colors.mutedForeground,
              ),
            ),
          ),
          Expanded(
            child: Text(
              '${(lot.deliveredWeight ?? lot.loadedWeight ?? lot.declaredWeight).toStringAsFixed(1)} كغ',
              textAlign: TextAlign.end,
              style: Ba33Typography.mono(
                fontSize: 12,
                color: mismatch ? colors.destructive : colors.foreground,
              ),
            ),
          ),
          SizedBox(
            width: 24,
            child: mismatch
                ? Icon(Icons.warning_amber, size: 14, color: colors.destructive)
                : const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.colors, required this.children});

  final Ba33Colors colors;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
      decoration: BoxDecoration(
        color: colors.card,
        borderRadius: Ba33Radii.borderRadiusLg,
        border: Border.all(color: colors.border),
      ),
      child: Column(
        children: children,
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    required this.colors,
    this.mono = false,
  });

  final String label;
  final String value;
  final Ba33Colors colors;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: Ba33Spacing.spacing2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: textTheme.bodySmall
                  ?.copyWith(color: colors.mutedForeground),
            ),
          ),
          Expanded(
            child: mono
                ? Text(
                    value,
                    style: Ba33Typography.mono(
                      fontSize: 12,
                      color: colors.foreground,
                    ),
                  )
                : Text(
                    value,
                    style: textTheme.bodyMedium,
                  ),
          ),
        ],
      ),
    );
  }
}
