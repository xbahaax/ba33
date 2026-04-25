import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'profession_provider.g.dart';

/// The five professions the platform supports for a wool source. The picker is
/// shown once after the first login and the value is also editable from the
/// profile screen. The chosen value is sent on every wool declaration so the
/// backend stores a unified `sources.profession`.
enum SourceProfession {
  shepherd,
  slaughterhouse,
  butcher,
  aggregator,
  other,
}

extension SourceProfessionX on SourceProfession {
  String get apiValue => name; // matches backend enum
  String labelArabic() => switch (this) {
        SourceProfession.shepherd => 'فلاح',
        SourceProfession.slaughterhouse => 'مذبح',
        SourceProfession.butcher => 'جزار',
        SourceProfession.aggregator => 'تعاونية / وسيط',
        SourceProfession.other => 'آخر',
      };
  String labelFrench() => switch (this) {
        SourceProfession.shepherd => 'Éleveur',
        SourceProfession.slaughterhouse => 'Abattoir',
        SourceProfession.butcher => 'Boucher',
        SourceProfession.aggregator => 'Coopérative / agrégateur',
        SourceProfession.other => 'Autre',
      };
}

const _kProfessionKey = 'source_profession';

@Riverpod(keepAlive: true)
class Profession extends _$Profession {
  @override
  Future<SourceProfession?> build() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kProfessionKey);
    if (raw == null) return null;
    return SourceProfession.values
        .firstWhere((p) => p.name == raw, orElse: () => SourceProfession.shepherd);
  }

  Future<void> set(SourceProfession profession) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kProfessionKey, profession.name);
    state = AsyncValue.data(profession);
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kProfessionKey);
    state = const AsyncValue.data(null);
  }
}
