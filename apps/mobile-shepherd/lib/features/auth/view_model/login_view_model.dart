import 'package:ba33_domain/ba33_domain.dart';
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

  Future<void> login(String phone) async {
    if (phone.isEmpty) {
      state = state.copyWith(error: 'دخل رقم تيليفونك');
      return;
    }

    state = state.copyWith(isLoading: true);

    // TODO(BA33-020): integrate real auth API
    await Future<void>.delayed(const Duration(milliseconds: 500));

    final user = User(
      id: 'shepherd-001',
      phone: '+213$phone',
      role: UserRole.shepherd,
      regionId: 'region-01',
      name: 'راعي',
    );

    ref.read(authProvider.notifier).login(user);
    state = state.copyWith(isLoading: false);
  }
}
