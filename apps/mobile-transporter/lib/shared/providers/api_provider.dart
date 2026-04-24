import 'package:ba33_api_client/ba33_api_client.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'api_provider.g.dart';

const _envUrl =
    String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3100');
final _baseUrl = _envUrl.endsWith('/api/v1') ? _envUrl : '$_envUrl/api/v1';

@Riverpod(keepAlive: true)
Ba33ApiClient apiClient(ApiClientRef ref) {
  return Ba33ApiClient(baseUrl: _baseUrl);
}

@Riverpod(keepAlive: true)
AuthService authService(AuthServiceRef ref) {
  return AuthService(ref.watch(apiClientProvider));
}

@Riverpod(keepAlive: true)
TransportService transportService(TransportServiceRef ref) {
  return TransportService(ref.watch(apiClientProvider));
}

@Riverpod(keepAlive: true)
FilesService filesService(FilesServiceRef ref) {
  return FilesService(ref.watch(apiClientProvider));
}

@Riverpod(keepAlive: true)
CollectionService collectionService(CollectionServiceRef ref) {
  return CollectionService(ref.watch(apiClientProvider));
}

@Riverpod(keepAlive: true)
EventsSyncService eventsSyncService(EventsSyncServiceRef ref) {
  return EventsSyncService(ref.watch(apiClientProvider));
}
