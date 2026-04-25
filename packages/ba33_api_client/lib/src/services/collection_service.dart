import 'package:ba33_api_client/src/api_client.dart';

class CollectionService {
  CollectionService(this._client);
  final Ba33ApiClient _client;

  Future<Map<String, dynamic>> createPreLot(Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/collection/pre-lots', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> declareWool(Map<String, dynamic> data) async {
    final response =
        await _client.dio.post('/collection/pre-lots/declare', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> declareWoolOnBehalf(
      Map<String, dynamic> data) async {
    final response = await _client.dio
        .post('/collection/pre-lots/declare-on-behalf', data: data);
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

  // ── Collection Jobs ─────────────────────────────────────
  // The two-actor model: depots/admin issue jobs, collectors execute them.

  Future<List<dynamic>> listJobs({
    String? status,
    String? collectorId,
    String? depotId,
  }) async {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (collectorId != null) params['collectorId'] = collectorId;
    if (depotId != null) params['depotId'] = depotId;
    final response = await _client.dio
        .get('/collection/jobs', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> listMyJobs({String? status}) async {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    final response = await _client.dio
        .get('/collection/jobs/me', queryParameters: params);
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getJob(String id) async {
    final response = await _client.dio.get('/collection/jobs/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> assignJob(
      String id, String collectorId) async {
    final response = await _client.dio.patch(
      '/collection/jobs/$id/assign',
      data: {'collectorId': collectorId},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> acceptJob(String id) async {
    final response =
        await _client.dio.patch('/collection/jobs/$id/accept');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> startJob(String id) async {
    final response = await _client.dio.patch('/collection/jobs/$id/start');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> submitJobGps(
      String id, List<Map<String, dynamic>> points) async {
    final response = await _client.dio.post(
      '/collection/jobs/$id/gps',
      data: {'points': points},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> markJobArrived(
      String id, {String? lat, String? lng}) async {
    final body = <String, dynamic>{};
    if (lat != null) body['lat'] = lat;
    if (lng != null) body['lng'] = lng;
    final response =
        await _client.dio.patch('/collection/jobs/$id/arrive', data: body);
    return response.data as Map<String, dynamic>;
  }

  /// Submits the arrival form. Server creates the lot, marks the pre-lot
  /// collected, and completes the job. Returns `{job, lot}`.
  Future<Map<String, dynamic>> completeJob(
      String id, Map<String, dynamic> arrival) async {
    final response = await _client.dio
        .post('/collection/jobs/$id/complete', data: arrival);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> cancelJob(String id, {String? reason}) async {
    final body = <String, dynamic>{};
    if (reason != null) body['reason'] = reason;
    final response = await _client.dio
        .patch('/collection/jobs/$id/cancel', data: body);
    return response.data as Map<String, dynamic>;
  }
}
