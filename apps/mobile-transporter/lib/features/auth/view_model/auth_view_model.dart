import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'auth_view_model.g.dart';

@riverpod
class AuthState extends _$AuthState {
  @override
  bool build() => false;

  void login() => state = true;
  void logout() => state = false;
}
