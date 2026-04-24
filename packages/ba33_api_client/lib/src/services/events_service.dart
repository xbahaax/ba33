import 'package:ba33_api_client/src/api_client.dart';

class EventsSyncService {
  EventsSyncService(this._client);
  final Ba33ApiClient _client;

  /// Post a batch of events to the backend.
  Future<Map<String, dynamic>> postEvents(
      List<Map<String, dynamic>> events) async {
    final response =
        await _client.dio.post('/events', data: {'events': events});
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getEventsSince(String timestamp) async {
    final response = await _client.dio
        .get('/events/since', queryParameters: {'recordedAt': timestamp});
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> getEntityEvents(
      String aggregateType, String aggregateId) async {
    final response = await _client.dio.get('/events', queryParameters: {
      'aggregateType': aggregateType,
      'aggregateId': aggregateId,
    });
    return response.data as List<dynamic>;
  }
}
