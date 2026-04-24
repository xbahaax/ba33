import 'package:ba33_api_client/src/api_client.dart';

class SourcesService {
  SourcesService(this._client);
  final Ba33ApiClient _client;

  Future<List<dynamic>> listSources(
      {String? type, String? regionId, String? status}) async {
    final params = <String, dynamic>{};
    if (type != null) params['type'] = type;
    if (regionId != null) params['regionId'] = regionId;
    if (status != null) params['status'] = status;
    final response =
        await _client.dio.get('/sources', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> listShepherds({String? regionId}) async {
    final params = <String, dynamic>{};
    if (regionId != null) params['regionId'] = regionId;
    final response = await _client.dio
        .get('/sources/shepherds', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getSource(String id) async {
    final response = await _client.dio.get('/sources/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createSource(
      Map<String, dynamic> data) async {
    final response = await _client.dio.post('/sources', data: data);
    return response.data as Map<String, dynamic>;
  }
}
