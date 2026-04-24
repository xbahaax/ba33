import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/auth_provider.dart';

part 'login_view_model.g.dart';

class LoginState {
  const LoginState({
    this.phone = '',
    this.password = '',
    this.isLoading = false,
    this.obscurePassword = true,
    this.error,
  });

  final String phone;
  final String password;
  final bool isLoading;
  final bool obscurePassword;
  final String? error;

  bool get isValid => phone.length >= 9 && password.length >= 4;

  LoginState copyWith({
    String? phone,
    String? password,
    bool? isLoading,
    bool? obscurePassword,
    String? error,
  }) {
    return LoginState(
      phone: phone ?? this.phone,
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

  void setPhone(String phone) {
    state = state.copyWith(phone: phone, error: null);
  }

  void setPassword(String password) {
    state = state.copyWith(password: password, error: null);
  }

  void togglePasswordVisibility() {
    state = state.copyWith(obscurePassword: !state.obscurePassword);
  }

  Future<bool> login() async {
    if (!state.isValid) {
      state = state.copyWith(error: 'Phone and password are required');
      return false;
    }
    state = state.copyWith(isLoading: true, error: null);

    final success =
        await ref.read(authProvider.notifier).login(state.phone, state.password);

    if (!success) {
      state = state.copyWith(
        isLoading: false,
        error: 'Invalid phone or password',
      );
      return false;
    }

    state = state.copyWith(isLoading: false);
    return true;
  }
}
