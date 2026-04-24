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
    await Future.delayed(const Duration(milliseconds: 600));
    ref.read(authStateProvider.notifier).login();
    if (mounted) context.go('/');
  }

  void _demoLogin() {
    ref.read(authStateProvider.notifier).login();
    context.go('/');
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

              if (!_otpSent) ...[
                Text('رقم التيليفون', style: textTheme.labelLarge),
                const SizedBox(height: Ba33Spacing.spacing2),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    hintText: '06 12 34 56 78',
                    prefixText: '+213  ',
                  ),
                ),
                const SizedBox(height: Ba33Spacing.spacing4),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _sendOtp,
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
                        : const Text('ابعث كود OTP'),
                  ),
                ),
              ] else ...[
                // OTP confirmation banner
                Container(
                  padding: const EdgeInsets.all(Ba33Spacing.spacing3),
                  decoration: BoxDecoration(
                    color: colors.muted,
                    borderRadius: Ba33Radii.borderRadiusMd,
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle,
                          color: colors.primary, size: 18),
                      const SizedBox(width: Ba33Spacing.spacing2),
                      Expanded(
                        child: Text(
                          'الكود تبعث ل +213 ${_phoneController.text}',
                          style: textTheme.bodySmall
                              ?.copyWith(color: colors.mutedForeground),
                        ),
                      ),
                      TextButton(
                        onPressed: () => setState(() => _otpSent = false),
                        child: const Text('بدل'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: Ba33Spacing.spacing4),
                Text('كود OTP', style: textTheme.labelLarge),
                const SizedBox(height: Ba33Spacing.spacing2),
                TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  autofocus: true,
                  style: Ba33Typography.mono(fontSize: 24),
                  textAlign: TextAlign.center,
                  decoration: const InputDecoration(
                    hintText: '• • • • • •',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: Ba33Spacing.spacing1),
                Text(
                  'ديمو: دخل أي كود فيه 4+ أرقام',
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.mutedForeground),
                ),
                const SizedBox(height: Ba33Spacing.spacing4),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOtp,
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
                        : const Text('تأكد و ادخل'),
                  ),
                ),
              ],

              const SizedBox(height: Ba33Spacing.spacing6),
              Divider(color: colors.border),
              const SizedBox(height: Ba33Spacing.spacing4),

              // Demo bypass — always visible
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _demoLogin,
                  icon: const Icon(Icons.bolt, size: 18),
                  label: const Text('دخول ديمو سريع'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        vertical: Ba33Spacing.spacing4),
                  ),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Center(
                child: Text(
                  'بلا OTP — للديمو فقط',
                  style: textTheme.bodySmall
                      ?.copyWith(color: colors.mutedForeground),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
