import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_provider.g.dart';

@Riverpod(keepAlive: true)
class Auth extends _$Auth {
  @override
  User? build() => null;

  Future<bool> login(String phone, String password) async {
    // TODO(BA33-020): Real auth API integration
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (password.length < 4) return false;
    state = User(
      id: 'COL-001',
      phone: phone,
      role: UserRole.collector,
      regionId: 'R-DJELFA',
      name: 'Ahmed Collector',
    );
    return true;
  }

  void logout() => state = null;
}

@riverpod
bool isAuthenticated(IsAuthenticatedRef ref) {
  return ref.watch(authProvider) != null;
}
