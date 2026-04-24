import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../view_model/auth_view_model.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'ادخل الإيميل و كلمة السر');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final success =
        await ref.read(authStateProvider.notifier).login(email, password);

    if (!mounted) return;

    if (success) {
      context.go('/');
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage = 'الإيميل ولا كلمة السر غالطة';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: Ba33Spacing.spacing6,
            vertical: Ba33Spacing.spacing4,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: Ba33Spacing.spacing8),

              // Brand icon
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: colors.primary,
                  borderRadius: Ba33Radii.borderRadiusLg,
                ),
                child: Center(
                  child: Text(
                    'ba33',
                    style: Ba33Typography.mono(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: colors.primaryForeground,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              Text('الناقل', style: textTheme.displaySmall),
              const SizedBox(height: Ba33Spacing.spacing1),
              Text(
                'ادخل باش توصل للمهام تاعك.',
                style: textTheme.bodyMedium
                    ?.copyWith(color: colors.mutedForeground),
              ),
              const SizedBox(height: Ba33Spacing.spacing8),

              Text('الإيميل', style: textTheme.labelLarge),
              const SizedBox(height: Ba33Spacing.spacing2),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  hintText: 'transporter@ba33.dz',
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing4),

              Text('كلمة السر', style: textTheme.labelLarge),
              const SizedBox(height: Ba33Spacing.spacing2),
              TextField(
                controller: _passwordController,
                obscureText: true,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _login(),
                decoration: const InputDecoration(
                  hintText: '••••••••',
                ),
              ),

              if (_errorMessage != null) ...[
                const SizedBox(height: Ba33Spacing.spacing3),
                Text(
                  _errorMessage!,
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.destructive),
                ),
              ],

              const SizedBox(height: Ba33Spacing.spacing6),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        vertical: Ba33Spacing.spacing4),
                  ),
                  child: _isLoading
                      ? SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            color: colors.primaryForeground,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text('ادخل'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
