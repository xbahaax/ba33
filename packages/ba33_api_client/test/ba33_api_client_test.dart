import 'package:flutter_test/flutter_test.dart';
import 'package:ba33_api_client/ba33_api_client.dart';

void main() {
  test('creates api client', () {
    final client = Ba33ApiClient(baseUrl: 'http://localhost:3100');
    expect(client.dio.options.baseUrl, 'http://localhost:3100');
  });
}
