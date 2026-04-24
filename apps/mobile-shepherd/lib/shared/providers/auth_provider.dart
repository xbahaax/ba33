import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_provider.g.dart';

/// Current authenticated user state.
@Riverpod(keepAlive: true)
class Auth extends _$Auth {
  @override
  User? build() => null;

  void login(User user) {
    state = user;
  }

  void logout() {
    state = null;
  }
}

/// Whether the user is logged in.
@riverpod
bool isAuthenticated(IsAuthenticatedRef ref) {
  return ref.watch(authProvider) != null;
}
