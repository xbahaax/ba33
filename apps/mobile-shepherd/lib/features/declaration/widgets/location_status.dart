import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';

/// Shows current GPS location status with coordinates.
class LocationStatus extends StatelessWidget {
  const LocationStatus({
    super.key,
    required this.latitude,
    required this.longitude,
    this.locationName,
    required this.onRefresh,
  });

  final double? latitude;
  final double? longitude;
  final String? locationName;
  final VoidCallback onRefresh;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final hasLocation = latitude != null && longitude != null;

    return Container(
      padding: const EdgeInsets.all(Ba33Spacing.spacing4),
      decoration: BoxDecoration(
        color: hasLocation ? colors.card : colors.muted,
        borderRadius: Ba33Radii.borderRadiusLg,
        border: Border.all(color: colors.border),
      ),
      child: Row(
        children: [
          Icon(
            hasLocation ? Icons.location_on : Icons.location_off,
            color: hasLocation ? colors.primary : colors.mutedForeground,
            size: 28,
          ),
          const SizedBox(width: Ba33Spacing.spacing3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hasLocation
                      ? (locationName ?? 'الموقع محدد')
                      : 'الموقع غير متاح',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                ),
                if (hasLocation)
                  Text(
                    '${latitude!.toStringAsFixed(4)}, ${longitude!.toStringAsFixed(4)}',
                    style: Ba33Typography.mono(
                      fontSize: 12,
                      color: colors.mutedForeground,
                    ),
                  ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(Icons.refresh, color: colors.primary),
            onPressed: onRefresh,
          ),
        ],
      ),
    );
  }
}
