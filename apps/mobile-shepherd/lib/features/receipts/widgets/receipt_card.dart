import 'package:ba33_domain/ba33_domain.dart';
import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';

/// A card showing a single declaration / receipt.
class ReceiptCard extends StatelessWidget {
  const ReceiptCard({super.key, required this.declaration});

  final Declaration declaration;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _StatusBadge(status: declaration.status, colors: colors),
                const Spacer(),
                Text(
                  declaration.id,
                  style: Ba33Typography.mono(
                    fontSize: 11,
                    color: colors.mutedForeground,
                  ),
                ),
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            Row(
              children: [
                Icon(
                  _iconForCategory(declaration.weightCategory),
                  color: colors.foreground,
                  size: 20,
                ),
                const SizedBox(width: Ba33Spacing.spacing2),
                Text(
                  _labelForCategory(declaration.weightCategory),
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
                if (declaration.finalWeight != null) ...[
                  const SizedBox(width: Ba33Spacing.spacing2),
                  Text(
                    '←',
                    style: TextStyle(color: colors.mutedForeground),
                  ),
                  const SizedBox(width: Ba33Spacing.spacing2),
                  Text(
                    '${declaration.finalWeight} كغ',
                    style: Ba33Typography.mono(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: colors.primary,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing2),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 14,
                  color: colors.mutedForeground,
                ),
                const SizedBox(width: Ba33Spacing.spacing1),
                Text(
                  _formatDate(declaration.createdAt),
                  style: TextStyle(
                    color: colors.mutedForeground,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
            if (declaration.pickupScheduledAt != null) ...[
              const SizedBox(height: Ba33Spacing.spacing1),
              Row(
                children: [
                  Icon(
                    Icons.local_shipping_outlined,
                    size: 14,
                    color: colors.primary,
                  ),
                  const SizedBox(width: Ba33Spacing.spacing1),
                  Text(
                    'الجمع: ${_formatDate(declaration.pickupScheduledAt!)}',
                    style: TextStyle(
                      color: colors.primary,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
            if (declaration.priceEstimate != null) ...[
              const SizedBox(height: Ba33Spacing.spacing3),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: Ba33Spacing.spacing3,
                  vertical: Ba33Spacing.spacing2,
                ),
                decoration: BoxDecoration(
                  color: colors.accent,
                  borderRadius: Ba33Radii.borderRadiusSm,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'تقدير السعر: ',
                      style: TextStyle(
                        color: colors.accentForeground,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      '${declaration.priceEstimate!.toStringAsFixed(0)} دج',
                      style: Ba33Typography.mono(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: colors.accentForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  static IconData _iconForCategory(WeightCategory category) {
    return switch (category) {
      WeightCategory.oneSheep => Icons.cruelty_free,
      WeightCategory.oneBag => Icons.shopping_bag_outlined,
      WeightCategory.smallPile => Icons.inventory_2_outlined,
      WeightCategory.largePile => Icons.warehouse_outlined,
    };
  }

  static String _labelForCategory(WeightCategory category) {
    return switch (category) {
      WeightCategory.oneSheep => 'نعجة وحدة (~2-3 كغ)',
      WeightCategory.oneBag => 'شكارة وحدة (~5 كغ)',
      WeightCategory.smallPile => 'كومة صغيرة (~10-20 كغ)',
      WeightCategory.largePile => 'كومة كبيرة (~50+ كغ)',
    };
  }

  static String _formatDate(DateTime date) {
    final day = date.day.toString().padLeft(2, '0');
    final month = date.month.toString().padLeft(2, '0');
    final hour = date.hour.toString().padLeft(2, '0');
    final minute = date.minute.toString().padLeft(2, '0');
    return '$day/$month/${date.year} $hour:$minute';
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status, required this.colors});

  final DeclarationStatus status;
  final Ba33Colors colors;

  @override
  Widget build(BuildContext context) {
    final (label, bgColor, fgColor) = switch (status) {
      DeclarationStatus.announced => (
          'معلن',
          colors.secondary,
          colors.secondaryForeground,
        ),
      DeclarationStatus.scheduledPickup => (
          'الجمع محدد',
          colors.primary,
          colors.primaryForeground,
        ),
      DeclarationStatus.collected => (
          'تم الجمع',
          colors.accent,
          colors.accentForeground,
        ),
      DeclarationStatus.cancelled => (
          'ملغي',
          colors.destructive,
          colors.destructiveForeground,
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: Ba33Spacing.spacing2,
        vertical: Ba33Spacing.spacing1,
      ),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: Ba33Radii.borderRadiusSm,
      ),
      child: Text(
        label,
        style: TextStyle(
          color: fgColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
