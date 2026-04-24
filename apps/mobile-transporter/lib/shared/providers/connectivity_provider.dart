import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'connectivity_provider.g.dart';

@Riverpod(keepAlive: true)
class ConnectivityNotifier extends _$ConnectivityNotifier {
  @override
  bool build() {
    final sub = Connectivity().onConnectivityChanged.listen((results) {
      state = !results.contains(ConnectivityResult.none);
    });
    ref.onDispose(sub.cancel);
    return true;
  }
}
