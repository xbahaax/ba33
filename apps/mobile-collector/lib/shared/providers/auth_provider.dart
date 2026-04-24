import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'api_provider.dart';

part 'auth_provider.g.dart';

@Riverpod(keepAlive: true)
class Auth extends _$Auth {
  @override
  User? build() => null;

  Future<bool> login(String phone, String password) async {
    try {
      final authSvc = ref.read(authServiceProvider);
      final apiClient = ref.read(apiClientProvider);

      final tokens = await authSvc.loginWithPhone(phone, password);
      final accessToken = tokens['accessToken'] as String;
      apiClient.setAccessToken(accessToken);

      final profile = await authSvc.me();
      state = User(
        id: profile['id'] as String,
        phone: profile['phone'] as String? ?? '',
        role: _mapRole(profile['userType'] as String? ?? 'collector'),
        regionId: profile['regionId'] as String? ?? '',
        name: profile['fullName'] as String?,
        email: profile['email'] as String?,
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  void logout() {
    ref.read(apiClientProvider).clearAccessToken();
    state = null;
  }

  static UserRole _mapRole(String type) {
    switch (type) {
      case 'collector':
        return UserRole.collector;
      case 'shepherd':
        return UserRole.shepherd;
      case 'transporter':
        return UserRole.transporter;
      default:
        return UserRole.collector;
    }
  }
}

@riverpod
bool isAuthenticated(IsAuthenticatedRef ref) {
  return ref.watch(authProvider) != null;
}
