import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../view_model/login_view_model.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(loginViewModelProvider);
    final vm = ref.read(loginViewModelProvider.notifier);
    final colors = Theme.of(context).ba33;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: Ba33Spacing.spacing16),

              // Logo
              Icon(
                Icons.grass_rounded,
                size: 72,
                color: colors.primary,
              ),
              const SizedBox(height: Ba33Spacing.spacing4),
              Text(
                'ba33',
                style: Ba33Typography.serif(
                  fontSize: 36,
                  fontWeight: FontWeight.w700,
                  color: colors.foreground,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Ba33Spacing.spacing2),
              Text(
                'Collector',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: colors.mutedForeground,
                    ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: Ba33Spacing.spacing12),

              Text(
                'Sign in',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: Ba33Spacing.spacing6),

              // Phone
              Ba33Input(
                label: 'Phone number',
                hint: '0555 XX XX XX',
                prefixIcon: Icons.phone_rounded,
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(10),
                ],
                autofocus: true,
                onChanged: vm.setPhone,
              ),

              const SizedBox(height: Ba33Spacing.spacing4),

              // Password
              Ba33Input(
                label: 'Password',
                hint: 'Enter your password',
                prefixIcon: Icons.lock_rounded,
                suffixIcon: IconButton(
                  icon: Icon(
                    state.obscurePassword
                        ? Icons.visibility_off_rounded
                        : Icons.visibility_rounded,
                    color: colors.mutedForeground,
                  ),
                  onPressed: vm.togglePasswordVisibility,
                ),
                obscureText: state.obscurePassword,
                onChanged: vm.setPassword,
                onFieldSubmitted: state.isValid ? (_) => vm.login() : null,
              ),

              // Error
              if (state.error != null) ...[
                const SizedBox(height: Ba33Spacing.spacing3),
                Text(
                  state.error!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: colors.destructive,
                      ),
                ),
              ],

              const SizedBox(height: Ba33Spacing.spacing8),

              Ba33Button(
                onPressed: state.isValid ? () => vm.login() : null,
                label: 'Sign in',
                icon: Icons.login_rounded,
                size: Ba33ButtonSize.lg,
                expand: true,
                isLoading: state.isLoading,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
