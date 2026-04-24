import 'package:ba33_api_client/src/api_client.dart';

class AuthService {
  AuthService(this._client);
  final Ba33ApiClient _client;

  /// Login with phone and password. Returns {accessToken, refreshToken}.
  Future<Map<String, dynamic>> loginWithPhone(String phone, String password) async {
    final response = await _client.dio.post('/auth/login', data: {
      'phone': phone,
      'password': password,
    });
    return response.data as Map<String, dynamic>;
  }

  /// Login with email and password. Returns {accessToken, refreshToken}.
  Future<Map<String, dynamic>> loginWithEmail(String email, String password) async {
    final response = await _client.dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data as Map<String, dynamic>;
  }

  /// Refresh tokens. Returns {accessToken, refreshToken}.
  Future<Map<String, dynamic>> refresh(String refreshToken) async {
    final response = await _client.dio.post('/auth/refresh', data: {
      'refreshToken': refreshToken,
    });
    return response.data as Map<String, dynamic>;
  }

  /// Get current user profile.
  Future<Map<String, dynamic>> me() async {
    final response = await _client.dio.get('/auth/me');
    return response.data as Map<String, dynamic>;
  }
}
