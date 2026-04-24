import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ba33_ui/ba33_ui.dart';

import 'navigation/router.dart';
import 'features/trip/view_model/active_trip_view_model.dart';
import 'shared/providers/sync_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: TransporterApp()));
}

class TransporterApp extends ConsumerStatefulWidget {
  const TransporterApp({super.key});

  @override
  ConsumerState<TransporterApp> createState() => _TransporterAppState();
}

class _TransporterAppState extends ConsumerState<TransporterApp> {
  @override
  void initState() {
    super.initState();
    // Restore persisted trip and sync count after first frame
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(activeTripProvider.notifier).restoreFromDb();
      await ref.read(syncQueueProvider.notifier).refreshCount();
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'ba33 Transporter',
      debugShowCheckedModeBanner: false,
      theme: Ba33Theme.light(),
      darkTheme: Ba33Theme.dark(),
      themeMode: ThemeMode.system,
      routerConfig: routerProvider,
    );
  }
}
