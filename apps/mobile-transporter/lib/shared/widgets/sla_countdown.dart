import 'dart:async';

import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';

class SlaCountdown extends StatefulWidget {
  const SlaCountdown({super.key, required this.deadline});

  final DateTime deadline;

  @override
  State<SlaCountdown> createState() => _SlaCountdownState();
}

class _SlaCountdownState extends State<SlaCountdown> {
  late Timer _timer;
  late Duration _remaining;

  @override
  void initState() {
    super.initState();
    _update();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _update());
  }

  void _update() {
    final diff = widget.deadline.difference(DateTime.now());
    setState(() => _remaining = diff.isNegative ? Duration.zero : diff);
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final isBreached = _remaining == Duration.zero;
    final isWarning = _remaining.inMinutes < 30;
    final color = isBreached
        ? colors.destructive
        : isWarning
            ? Colors.orange
            : colors.mutedForeground;

    final h = _remaining.inHours;
    final m = _remaining.inMinutes % 60;
    final s = _remaining.inSeconds % 60;
    final label = h > 0 ? '${h}h ${m}m' : '${m}m ${s}s';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: Ba33Radii.borderRadiusSm,
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.timer_outlined, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            isBreached ? 'SLA DÉPASSÉ' : label,
            style: Ba33Typography.mono(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
