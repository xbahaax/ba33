import 'package:ba33_api_client/src/api_client.dart';

class LotsService {
  LotsService(this._client);
  final Ba33ApiClient _client;

  Future<Map<String, dynamic>> createLot(Map<String, dynamic> data) async {
    final response = await _client.dio.post('/lots', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> listLots(
      {String? collectorId,
      String? status,
      String? sourceType,
      bool? isUrgent}) async {
    final params = <String, dynamic>{};
    if (collectorId != null) params['collectorId'] = collectorId;
    if (status != null) params['status'] = status;
    if (sourceType != null) params['sourceType'] = sourceType;
    if (isUrgent != null) params['isUrgent'] = isUrgent;
    final response =
        await _client.dio.get('/lots', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getLot(String id) async {
    final response = await _client.dio.get('/lots/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getLotByQr(String code) async {
    final response = await _client.dio.get('/lots/qr/$code');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateLot(
      String id, Map<String, dynamic> data) async {
    final response = await _client.dio.patch('/lots/$id', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateLotStatus(
      String id, Map<String, dynamic> data) async {
    final response =
        await _client.dio.patch('/lots/$id/status', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addPhoto(
      String lotId, Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/lots/$lotId/photos', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addSignature(
      String lotId, Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/lots/$lotId/signatures', data: data);
    return response.data as Map<String, dynamic>;
  }
}
