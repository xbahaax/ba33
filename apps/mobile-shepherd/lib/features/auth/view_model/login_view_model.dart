import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/auth_provider.dart';

part 'login_view_model.g.dart';

class LoginState {
  const LoginState({
    this.isLoading = false,
    this.error,
  });

  final bool isLoading;
  final String? error;

  LoginState copyWith({
    bool? isLoading,
    String? error,
  }) {
    return LoginState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

@riverpod
class LoginViewModel extends _$LoginViewModel {
  @override
  LoginState build() => const LoginState();

  Future<void> login(String phone, String password) async {
    if (phone.isEmpty || password.isEmpty) {
      state = state.copyWith(error: 'ادخل رقم الهاتف و كلمة السر');
      return;
    }

    state = state.copyWith(isLoading: true);

    try {
      await ref.read(authProvider.notifier).login(phone, password);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'فشل الدخول، تأكد من المعلومات',
      );
    }
  }
}
