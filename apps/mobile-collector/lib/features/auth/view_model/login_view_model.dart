import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/auth_provider.dart';

part 'login_view_model.g.dart';

class LoginState {
  const LoginState({
    this.email = '',
    this.password = '',
    this.isLoading = false,
    this.obscurePassword = true,
    this.error,
  });

  final String email;
  final String password;
  final bool isLoading;
  final bool obscurePassword;
  final String? error;

  bool get isValid => email.contains('@') && password.length >= 4;

  LoginState copyWith({
    String? email,
    String? password,
    bool? isLoading,
    bool? obscurePassword,
    String? error,
  }) {
    return LoginState(
      email: email ?? this.email,
      password: password ?? this.password,
      isLoading: isLoading ?? this.isLoading,
      obscurePassword: obscurePassword ?? this.obscurePassword,
      error: error,
    );
  }
}

@riverpod
class LoginViewModel extends _$LoginViewModel {
  @override
  LoginState build() => const LoginState();

  void setEmail(String email) {
    state = state.copyWith(email: email, error: null);
  }

  void setPassword(String password) {
    state = state.copyWith(password: password, error: null);
  }

  void togglePasswordVisibility() {
    state = state.copyWith(obscurePassword: !state.obscurePassword);
  }

  Future<bool> login() async {
    if (!state.isValid) {
      state = state.copyWith(error: 'Email and password are required');
      return false;
    }
    state = state.copyWith(isLoading: true, error: null);

    final success = await ref
        .read(authProvider.notifier)
        .login(state.email, state.password);

    if (!success) {
      state = state.copyWith(
        isLoading: false,
        error: 'Invalid email or password',
      );
      return false;
    }

    state = state.copyWith(isLoading: false);
    return true;
  }
}
