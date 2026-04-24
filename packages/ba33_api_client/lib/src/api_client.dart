import 'package:dio/dio.dart';

class Ba33ApiClient {
  Ba33ApiClient({required String baseUrl, String? accessToken})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        )) {
    if (accessToken != null) {
      setAccessToken(accessToken);
    }
  }

  final Dio _dio;

  void setAccessToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearAccessToken() {
    _dio.options.headers.remove('Authorization');
  }

  Dio get dio => _dio;
}
