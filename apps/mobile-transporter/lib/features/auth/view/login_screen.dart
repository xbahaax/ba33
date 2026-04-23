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
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _otpSent = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    if (_phoneController.text.length < 9) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _isLoading = false;
      _otpSent = true;
    });
  }

  Future<void> _verifyOtp() async {
    if (_otpController.text.length < 4) return;
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 800));
    ref.read(authStateProvider.notifier).login();
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: Ba33Spacing.spacing12),
              // Brand header
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
              const SizedBox(height: Ba33Spacing.spacing6),
              Text('Transporter', style: textTheme.displaySmall),
              const SizedBox(height: Ba33Spacing.spacing1),
              Text(
                'Connectez-vous pour accéder à vos missions',
                style: textTheme.bodyMedium?.copyWith(
                  color: colors.mutedForeground,
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing12),

              if (!_otpSent) ...[
                Text('Numéro de téléphone', style: textTheme.labelLarge),
                const SizedBox(height: Ba33Spacing.spacing2),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    hintText: '06 12 34 56 78',
                    prefixIcon: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: Ba33Spacing.spacing3,
                      ),
                      margin: const EdgeInsets.symmetric(
                        vertical: Ba33Spacing.spacing2,
                        horizontal: Ba33Spacing.spacing2,
                      ),
                      decoration: BoxDecoration(
                        color: colors.muted,
                        borderRadius: Ba33Radii.borderRadiusMd,
                      ),
                      child: Center(
                        child: Text(
                          '+213',
                          style: Ba33Typography.mono(
                            fontSize: 13,
                            color: colors.foreground,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: Ba33Spacing.spacing4),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _sendOtp,
                    child: _isLoading
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              color: colors.primaryForeground,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text('Envoyer le code OTP'),
                  ),
                ),
              ] else ...[
                // OTP sent state
                Container(
                  padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                  decoration: BoxDecoration(
                    color: colors.muted,
                    borderRadius: Ba33Radii.borderRadiusLg,
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle,
                          color: colors.primary, size: 20),
                      const SizedBox(width: Ba33Spacing.spacing2),
                      Expanded(
                        child: Text(
                          'Code envoyé au +213 ${_phoneController.text}',
                          style: textTheme.bodySmall
                              ?.copyWith(color: colors.mutedForeground),
                        ),
                      ),
                      TextButton(
                        onPressed: () =>
                            setState(() => _otpSent = false),
                        child: const Text('Changer'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: Ba33Spacing.spacing4),
                Text('Code OTP', style: textTheme.labelLarge),
                const SizedBox(height: Ba33Spacing.spacing2),
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  style: Ba33Typography.mono(fontSize: 24),
                  textAlign: TextAlign.center,
                  decoration: const InputDecoration(
                    hintText: '• • • • • •',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: Ba33Spacing.spacing1),
                Text(
                  'Demo: entrez n\'importe quel code à 4+ chiffres',
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.mutedForeground),
                ),
                const SizedBox(height: Ba33Spacing.spacing4),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOtp,
                    child: _isLoading
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              color: colors.primaryForeground,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text('Vérifier & Se connecter'),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
