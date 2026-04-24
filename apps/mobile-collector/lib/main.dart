import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'navigation/router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: CollectorApp()));
}

class CollectorApp extends ConsumerWidget {
  const CollectorApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final goRouter = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'ba33 Collector',
      debugShowCheckedModeBanner: false,
      theme: Ba33Theme.light(),
      darkTheme: Ba33Theme.dark(),
      themeMode: ThemeMode.system,
      routerConfig: goRouter,
    );
  }
}
