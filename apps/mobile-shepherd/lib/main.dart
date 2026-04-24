import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ba33_ui/ba33_ui.dart';

import 'navigation/router.dart';
import 'shared/providers/auth_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: ShepherdApp()));
}

class ShepherdApp extends ConsumerWidget {
  const ShepherdApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLoggedIn = ref.watch(isAuthenticatedProvider);
    final router = createRouter(isAuthenticated: isLoggedIn);

    return MaterialApp.router(
      title: 'ba33 راعي',
      debugShowCheckedModeBanner: false,
      theme: Ba33Theme.light(),
      darkTheme: Ba33Theme.dark(),
      themeMode: ThemeMode.system,
      locale: const Locale('ar'),
      supportedLocales: const [
        Locale('ar'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
