import 'package:ba33_api_client/src/api_client.dart';

class TransportService {
  TransportService(this._client);
  final Ba33ApiClient _client;

  Future<Map<String, dynamic>> createJob(Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/transport/jobs', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> listJobs(
      {String? transporterId, String? status, String? lane}) async {
    final params = <String, dynamic>{};
    if (transporterId != null) params['transporterId'] = transporterId;
    if (status != null) params['status'] = status;
    if (lane != null) params['lane'] = lane;
    final response = await _client.dio
        .get('/transport/jobs', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getJob(String id) async {
    final response = await _client.dio.get('/transport/jobs/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> acceptJob(
      String id, Map<String, dynamic> data) async {
    final response = await _client.dio
        .patch('/transport/jobs/$id/accept', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> startJob(String id) async {
    final response =
        await _client.dio.patch('/transport/jobs/$id/start');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> loadLot(
      String jobId, String lotId, Map<String, dynamic> data) async {
    final response = await _client.dio
        .post('/transport/jobs/$jobId/lots/$lotId/load', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> deliverLot(
      String jobId, String lotId, Map<String, dynamic> data) async {
    final response = await _client.dio
        .post('/transport/jobs/$jobId/lots/$lotId/deliver', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> completeJob(String id) async {
    final response =
        await _client.dio.patch('/transport/jobs/$id/complete');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addGpsPoint(
      String jobId, Map<String, dynamic> data) async {
    final response = await _client.dio
        .post('/transport/jobs/$jobId/gps', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getGpsTrail(String jobId) async {
    final response =
        await _client.dio.get('/transport/jobs/$jobId/gps');
    return response.data as List<dynamic>;
  }
}
