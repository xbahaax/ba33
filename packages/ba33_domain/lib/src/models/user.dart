import '../enums/user_role.dart';

/// A platform user.
class User {
  const User({
    required this.id,
    required this.phone,
    required this.role,
    required this.regionId,
    this.name,
    this.email,
  });

  final String id;
  final String phone;
  final UserRole role;
  final String regionId;
  final String? name;
  final String? email;
}
