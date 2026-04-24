import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../jobs/model/transport_job.dart';

part 'a1_alert_view_model.g.dart';

@Riverpod(keepAlive: true)
class A1AlertNotifier extends _$A1AlertNotifier {
  @override
  A1Alert? build() => null;

  void fireAlert(A1Alert alert) => state = alert;

  void accept() => state = null;

  void dismiss() => state = null;

  void fireMockAlert() {
    state = A1Alert(
      id: 'A1-ALG-${DateTime.now().millisecondsSinceEpoch % 10000}',
      depotName: 'Dépôt Alger Est',
      depotRegion: 'Alger',
      lotsCount: 14,
      totalWeight: 623.5,
      firedAt: DateTime.now(),
      slaDeadline: DateTime.now().add(const Duration(hours: 2)),
      triggerReason: 'Dépôt à 92% de capacité — lots urgents C2 en attente',
    );
  }
}
