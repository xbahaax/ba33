import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../view_model/login_view_model.dart';

/// Email + password login screen.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final loginState = ref.watch(loginViewModelProvider);

    ref.listen(loginViewModelProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: colors.destructive,
          ),
        );
      }
    });

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Text(
                'ba33',
                style: Ba33Typography.serif(
                  fontSize: 48,
                  fontWeight: FontWeight.w700,
                  color: colors.primary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                'راعي',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: colors.mutedForeground,
                    ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              Text(
                'الإيميل',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  hintText: 'example@ba33.dz',
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              Text(
                'كلمة السر',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  hintText: '••••••',
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: loginState.isLoading
                      ? null
                      : () => ref
                          .read(loginViewModelProvider.notifier)
                          .login(
                            _emailController.text.trim(),
                            _passwordController.text,
                          ),
                  child: loginState.isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('دخول'),
                ),
              ),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}
