import 'package:ba33_api_client/src/api_client.dart';

class CollectionService {
  CollectionService(this._client);
  final Ba33ApiClient _client;

  Future<Map<String, dynamic>> createPreLot(Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/collection/pre-lots', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> listPreLots(
      {String? status,
      String? assignedCollectorId,
      String? regionId}) async {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (assignedCollectorId != null) {
      params['assignedCollectorId'] = assignedCollectorId;
    }
    if (regionId != null) params['regionId'] = regionId;
    final response = await _client.dio
        .get('/collection/pre-lots', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getPreLot(String id) async {
    final response = await _client.dio.get('/collection/pre-lots/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> assignPreLot(
      String id, Map<String, dynamic> data) async {
    final response = await _client.dio
        .patch('/collection/pre-lots/$id/assign', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> completePreLot(
      String id, Map<String, dynamic> data) async {
    final response = await _client.dio
        .patch('/collection/pre-lots/$id/complete', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createCollector(
      Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/collection/collectors', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMyCollectorProfile() async {
    final response = await _client.dio.get('/collection/collectors/me');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createRoute(Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/collection/routes', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> listRoutes({String? collectorId, String? date}) async {
    final params = <String, dynamic>{};
    if (collectorId != null) params['collectorId'] = collectorId;
    if (date != null) params['date'] = date;
    final response = await _client.dio
        .get('/collection/routes', queryParameters: params);
    return response.data as List<dynamic>;
  }
}
