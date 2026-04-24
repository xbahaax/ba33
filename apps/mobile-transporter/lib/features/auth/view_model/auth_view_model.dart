import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/api_provider.dart';

part 'auth_view_model.g.dart';

class AuthInfo {
  const AuthInfo({
    this.isAuthenticated = false,
    this.userId,
    this.userName,
  });

  final bool isAuthenticated;
  final String? userId;
  final String? userName;
}

@Riverpod(keepAlive: true)
class AuthState extends _$AuthState {
  @override
  AuthInfo build() => const AuthInfo();

  /// Login with phone number and password via the real API.
  /// Returns null on success, or the error message on failure.
  Future<String?> login(String phone, String password) async {
    try {
      final authSvc = ref.read(authServiceProvider);
      final apiClient = ref.read(apiClientProvider);

      final tokens = await authSvc.loginWithPhone(phone, password);
      apiClient.setAccessToken(tokens['accessToken'] as String);

      final profile = await authSvc.me();
      state = AuthInfo(
        isAuthenticated: true,
        userId: profile['id'] as String?,
        userName: profile['fullName'] as String?,
      );
      return null;
    } catch (e) {
      return e.toString();
    }
  }

  void logout() {
    ref.read(apiClientProvider).clearAccessToken();
    state = const AuthInfo();
  }
}
