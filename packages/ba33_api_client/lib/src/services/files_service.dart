import 'package:dio/dio.dart';
import 'package:ba33_api_client/src/api_client.dart';

class FilesService {
  FilesService(this._client);
  final Ba33ApiClient _client;

  Future<Map<String, dynamic>> upload(String filePath, String kind,
      {String? uploadedBy}) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
      'kind': kind,
      if (uploadedBy != null) 'uploadedBy': uploadedBy,
    });
    final response =
        await _client.dio.post('/files/upload', data: formData);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getFileInfo(String id) async {
    final response = await _client.dio.get('/files/$id/info');
    return response.data as Map<String, dynamic>;
  }
}
