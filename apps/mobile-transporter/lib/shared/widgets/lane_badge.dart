import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';

import '../../features/jobs/model/transport_job.dart';

class LaneBadge extends StatelessWidget {
  const LaneBadge({super.key, required this.lane});

  final TransportLane lane;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;

    final (label, bg, fg, icon) = switch (lane) {
      TransportLane.urgentColdChain => (
          'مستعجل · مبرد',
          colors.destructive,
          colors.destructiveForeground,
          Icons.ac_unit,
        ),
      TransportLane.urgentStandard => (
          'مستعجل',
          colors.destructive,
          colors.destructiveForeground,
          Icons.priority_high,
        ),
      TransportLane.normal => (
          'عادي',
          colors.muted,
          colors.mutedForeground,
          Icons.local_shipping_outlined,
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg.withOpacity(lane == TransportLane.normal ? 1.0 : 0.15),
        borderRadius: Ba33Radii.borderRadiusSm,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon,
              size: 12,
              color: lane == TransportLane.normal ? fg : colors.destructive),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: lane == TransportLane.normal ? fg : colors.destructive,
            ),
          ),
        ],
      ),
    );
  }
}
