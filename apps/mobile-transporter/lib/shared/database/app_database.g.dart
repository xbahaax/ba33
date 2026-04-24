// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $GpsRecordsTable extends GpsRecords
    with TableInfo<$GpsRecordsTable, DbGpsRecord> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $GpsRecordsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _jobIdMeta = const VerificationMeta('jobId');
  @override
  late final GeneratedColumn<String> jobId = GeneratedColumn<String>(
    'job_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _latMeta = const VerificationMeta('lat');
  @override
  late final GeneratedColumn<double> lat = GeneratedColumn<double>(
    'lat',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lngMeta = const VerificationMeta('lng');
  @override
  late final GeneratedColumn<double> lng = GeneratedColumn<double>(
    'lng',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _accuracyMeta = const VerificationMeta(
    'accuracy',
  );
  @override
  late final GeneratedColumn<double> accuracy = GeneratedColumn<double>(
    'accuracy',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(0.0),
  );
  static const VerificationMeta _speedMpsMeta = const VerificationMeta(
    'speedMps',
  );
  @override
  late final GeneratedColumn<double> speedMps = GeneratedColumn<double>(
    'speed_mps',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(0.0),
  );
  static const VerificationMeta _recordedAtMeta = const VerificationMeta(
    'recordedAt',
  );
  @override
  late final GeneratedColumn<DateTime> recordedAt = GeneratedColumn<DateTime>(
    'recorded_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _syncedMeta = const VerificationMeta('synced');
  @override
  late final GeneratedColumn<bool> synced = GeneratedColumn<bool>(
    'synced',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("synced" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    jobId,
    lat,
    lng,
    accuracy,
    speedMps,
    recordedAt,
    synced,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'gps_records';
  @override
  VerificationContext validateIntegrity(
    Insertable<DbGpsRecord> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('job_id')) {
      context.handle(
        _jobIdMeta,
        jobId.isAcceptableOrUnknown(data['job_id']!, _jobIdMeta),
      );
    } else if (isInserting) {
      context.missing(_jobIdMeta);
    }
    if (data.containsKey('lat')) {
      context.handle(
        _latMeta,
        lat.isAcceptableOrUnknown(data['lat']!, _latMeta),
      );
    } else if (isInserting) {
      context.missing(_latMeta);
    }
    if (data.containsKey('lng')) {
      context.handle(
        _lngMeta,
        lng.isAcceptableOrUnknown(data['lng']!, _lngMeta),
      );
    } else if (isInserting) {
      context.missing(_lngMeta);
    }
    if (data.containsKey('accuracy')) {
      context.handle(
        _accuracyMeta,
        accuracy.isAcceptableOrUnknown(data['accuracy']!, _accuracyMeta),
      );
    }
    if (data.containsKey('speed_mps')) {
      context.handle(
        _speedMpsMeta,
        speedMps.isAcceptableOrUnknown(data['speed_mps']!, _speedMpsMeta),
      );
    }
    if (data.containsKey('recorded_at')) {
      context.handle(
        _recordedAtMeta,
        recordedAt.isAcceptableOrUnknown(data['recorded_at']!, _recordedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_recordedAtMeta);
    }
    if (data.containsKey('synced')) {
      context.handle(
        _syncedMeta,
        synced.isAcceptableOrUnknown(data['synced']!, _syncedMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  DbGpsRecord map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return DbGpsRecord(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      jobId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}job_id'],
      )!,
      lat: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}lat'],
      )!,
      lng: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}lng'],
      )!,
      accuracy: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}accuracy'],
      )!,
      speedMps: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}speed_mps'],
      )!,
      recordedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}recorded_at'],
      )!,
      synced: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}synced'],
      )!,
    );
  }

  @override
  $GpsRecordsTable createAlias(String alias) {
    return $GpsRecordsTable(attachedDatabase, alias);
  }
}

class DbGpsRecord extends DataClass implements Insertable<DbGpsRecord> {
  final int id;
  final String jobId;
  final double lat;
  final double lng;
  final double accuracy;
  final double speedMps;
  final DateTime recordedAt;
  final bool synced;
  const DbGpsRecord({
    required this.id,
    required this.jobId,
    required this.lat,
    required this.lng,
    required this.accuracy,
    required this.speedMps,
    required this.recordedAt,
    required this.synced,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['job_id'] = Variable<String>(jobId);
    map['lat'] = Variable<double>(lat);
    map['lng'] = Variable<double>(lng);
    map['accuracy'] = Variable<double>(accuracy);
    map['speed_mps'] = Variable<double>(speedMps);
    map['recorded_at'] = Variable<DateTime>(recordedAt);
    map['synced'] = Variable<bool>(synced);
    return map;
  }

  GpsRecordsCompanion toCompanion(bool nullToAbsent) {
    return GpsRecordsCompanion(
      id: Value(id),
      jobId: Value(jobId),
      lat: Value(lat),
      lng: Value(lng),
      accuracy: Value(accuracy),
      speedMps: Value(speedMps),
      recordedAt: Value(recordedAt),
      synced: Value(synced),
    );
  }

  factory DbGpsRecord.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return DbGpsRecord(
      id: serializer.fromJson<int>(json['id']),
      jobId: serializer.fromJson<String>(json['jobId']),
      lat: serializer.fromJson<double>(json['lat']),
      lng: serializer.fromJson<double>(json['lng']),
      accuracy: serializer.fromJson<double>(json['accuracy']),
      speedMps: serializer.fromJson<double>(json['speedMps']),
      recordedAt: serializer.fromJson<DateTime>(json['recordedAt']),
      synced: serializer.fromJson<bool>(json['synced']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'jobId': serializer.toJson<String>(jobId),
      'lat': serializer.toJson<double>(lat),
      'lng': serializer.toJson<double>(lng),
      'accuracy': serializer.toJson<double>(accuracy),
      'speedMps': serializer.toJson<double>(speedMps),
      'recordedAt': serializer.toJson<DateTime>(recordedAt),
      'synced': serializer.toJson<bool>(synced),
    };
  }

  DbGpsRecord copyWith({
    int? id,
    String? jobId,
    double? lat,
    double? lng,
    double? accuracy,
    double? speedMps,
    DateTime? recordedAt,
    bool? synced,
  }) => DbGpsRecord(
    id: id ?? this.id,
    jobId: jobId ?? this.jobId,
    lat: lat ?? this.lat,
    lng: lng ?? this.lng,
    accuracy: accuracy ?? this.accuracy,
    speedMps: speedMps ?? this.speedMps,
    recordedAt: recordedAt ?? this.recordedAt,
    synced: synced ?? this.synced,
  );
  DbGpsRecord copyWithCompanion(GpsRecordsCompanion data) {
    return DbGpsRecord(
      id: data.id.present ? data.id.value : this.id,
      jobId: data.jobId.present ? data.jobId.value : this.jobId,
      lat: data.lat.present ? data.lat.value : this.lat,
      lng: data.lng.present ? data.lng.value : this.lng,
      accuracy: data.accuracy.present ? data.accuracy.value : this.accuracy,
      speedMps: data.speedMps.present ? data.speedMps.value : this.speedMps,
      recordedAt: data.recordedAt.present
          ? data.recordedAt.value
          : this.recordedAt,
      synced: data.synced.present ? data.synced.value : this.synced,
    );
  }

  @override
  String toString() {
    return (StringBuffer('DbGpsRecord(')
          ..write('id: $id, ')
          ..write('jobId: $jobId, ')
          ..write('lat: $lat, ')
          ..write('lng: $lng, ')
          ..write('accuracy: $accuracy, ')
          ..write('speedMps: $speedMps, ')
          ..write('recordedAt: $recordedAt, ')
          ..write('synced: $synced')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, jobId, lat, lng, accuracy, speedMps, recordedAt, synced);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is DbGpsRecord &&
          other.id == this.id &&
          other.jobId == this.jobId &&
          other.lat == this.lat &&
          other.lng == this.lng &&
          other.accuracy == this.accuracy &&
          other.speedMps == this.speedMps &&
          other.recordedAt == this.recordedAt &&
          other.synced == this.synced);
}

class GpsRecordsCompanion extends UpdateCompanion<DbGpsRecord> {
  final Value<int> id;
  final Value<String> jobId;
  final Value<double> lat;
  final Value<double> lng;
  final Value<double> accuracy;
  final Value<double> speedMps;
  final Value<DateTime> recordedAt;
  final Value<bool> synced;
  const GpsRecordsCompanion({
    this.id = const Value.absent(),
    this.jobId = const Value.absent(),
    this.lat = const Value.absent(),
    this.lng = const Value.absent(),
    this.accuracy = const Value.absent(),
    this.speedMps = const Value.absent(),
    this.recordedAt = const Value.absent(),
    this.synced = const Value.absent(),
  });
  GpsRecordsCompanion.insert({
    this.id = const Value.absent(),
    required String jobId,
    required double lat,
    required double lng,
    this.accuracy = const Value.absent(),
    this.speedMps = const Value.absent(),
    required DateTime recordedAt,
    this.synced = const Value.absent(),
  }) : jobId = Value(jobId),
       lat = Value(lat),
       lng = Value(lng),
       recordedAt = Value(recordedAt);
  static Insertable<DbGpsRecord> custom({
    Expression<int>? id,
    Expression<String>? jobId,
    Expression<double>? lat,
    Expression<double>? lng,
    Expression<double>? accuracy,
    Expression<double>? speedMps,
    Expression<DateTime>? recordedAt,
    Expression<bool>? synced,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (jobId != null) 'job_id': jobId,
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
      if (accuracy != null) 'accuracy': accuracy,
      if (speedMps != null) 'speed_mps': speedMps,
      if (recordedAt != null) 'recorded_at': recordedAt,
      if (synced != null) 'synced': synced,
    });
  }

  GpsRecordsCompanion copyWith({
    Value<int>? id,
    Value<String>? jobId,
    Value<double>? lat,
    Value<double>? lng,
    Value<double>? accuracy,
    Value<double>? speedMps,
    Value<DateTime>? recordedAt,
    Value<bool>? synced,
  }) {
    return GpsRecordsCompanion(
      id: id ?? this.id,
      jobId: jobId ?? this.jobId,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      accuracy: accuracy ?? this.accuracy,
      speedMps: speedMps ?? this.speedMps,
      recordedAt: recordedAt ?? this.recordedAt,
      synced: synced ?? this.synced,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (jobId.present) {
      map['job_id'] = Variable<String>(jobId.value);
    }
    if (lat.present) {
      map['lat'] = Variable<double>(lat.value);
    }
    if (lng.present) {
      map['lng'] = Variable<double>(lng.value);
    }
    if (accuracy.present) {
      map['accuracy'] = Variable<double>(accuracy.value);
    }
    if (speedMps.present) {
      map['speed_mps'] = Variable<double>(speedMps.value);
    }
    if (recordedAt.present) {
      map['recorded_at'] = Variable<DateTime>(recordedAt.value);
    }
    if (synced.present) {
      map['synced'] = Variable<bool>(synced.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('GpsRecordsCompanion(')
          ..write('id: $id, ')
          ..write('jobId: $jobId, ')
          ..write('lat: $lat, ')
          ..write('lng: $lng, ')
          ..write('accuracy: $accuracy, ')
          ..write('speedMps: $speedMps, ')
          ..write('recordedAt: $recordedAt, ')
          ..write('synced: $synced')
          ..write(')'))
        .toString();
  }
}

class $EventQueueTable extends EventQueue
    with TableInfo<$EventQueueTable, DbEvent> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $EventQueueTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _eventTypeMeta = const VerificationMeta(
    'eventType',
  );
  @override
  late final GeneratedColumn<String> eventType = GeneratedColumn<String>(
    'event_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _jobIdMeta = const VerificationMeta('jobId');
  @override
  late final GeneratedColumn<String> jobId = GeneratedColumn<String>(
    'job_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _payloadMeta = const VerificationMeta(
    'payload',
  );
  @override
  late final GeneratedColumn<String> payload = GeneratedColumn<String>(
    'payload',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _syncedMeta = const VerificationMeta('synced');
  @override
  late final GeneratedColumn<bool> synced = GeneratedColumn<bool>(
    'synced',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("synced" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    eventType,
    jobId,
    payload,
    createdAt,
    synced,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'event_queue';
  @override
  VerificationContext validateIntegrity(
    Insertable<DbEvent> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('event_type')) {
      context.handle(
        _eventTypeMeta,
        eventType.isAcceptableOrUnknown(data['event_type']!, _eventTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_eventTypeMeta);
    }
    if (data.containsKey('job_id')) {
      context.handle(
        _jobIdMeta,
        jobId.isAcceptableOrUnknown(data['job_id']!, _jobIdMeta),
      );
    } else if (isInserting) {
      context.missing(_jobIdMeta);
    }
    if (data.containsKey('payload')) {
      context.handle(
        _payloadMeta,
        payload.isAcceptableOrUnknown(data['payload']!, _payloadMeta),
      );
    } else if (isInserting) {
      context.missing(_payloadMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('synced')) {
      context.handle(
        _syncedMeta,
        synced.isAcceptableOrUnknown(data['synced']!, _syncedMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  DbEvent map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return DbEvent(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      eventType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}event_type'],
      )!,
      jobId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}job_id'],
      )!,
      payload: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payload'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      synced: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}synced'],
      )!,
    );
  }

  @override
  $EventQueueTable createAlias(String alias) {
    return $EventQueueTable(attachedDatabase, alias);
  }
}

class DbEvent extends DataClass implements Insertable<DbEvent> {
  final int id;
  final String eventType;
  final String jobId;
  final String payload;
  final DateTime createdAt;
  final bool synced;
  const DbEvent({
    required this.id,
    required this.eventType,
    required this.jobId,
    required this.payload,
    required this.createdAt,
    required this.synced,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['event_type'] = Variable<String>(eventType);
    map['job_id'] = Variable<String>(jobId);
    map['payload'] = Variable<String>(payload);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['synced'] = Variable<bool>(synced);
    return map;
  }

  EventQueueCompanion toCompanion(bool nullToAbsent) {
    return EventQueueCompanion(
      id: Value(id),
      eventType: Value(eventType),
      jobId: Value(jobId),
      payload: Value(payload),
      createdAt: Value(createdAt),
      synced: Value(synced),
    );
  }

  factory DbEvent.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return DbEvent(
      id: serializer.fromJson<int>(json['id']),
      eventType: serializer.fromJson<String>(json['eventType']),
      jobId: serializer.fromJson<String>(json['jobId']),
      payload: serializer.fromJson<String>(json['payload']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      synced: serializer.fromJson<bool>(json['synced']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'eventType': serializer.toJson<String>(eventType),
      'jobId': serializer.toJson<String>(jobId),
      'payload': serializer.toJson<String>(payload),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'synced': serializer.toJson<bool>(synced),
    };
  }

  DbEvent copyWith({
    int? id,
    String? eventType,
    String? jobId,
    String? payload,
    DateTime? createdAt,
    bool? synced,
  }) => DbEvent(
    id: id ?? this.id,
    eventType: eventType ?? this.eventType,
    jobId: jobId ?? this.jobId,
    payload: payload ?? this.payload,
    createdAt: createdAt ?? this.createdAt,
    synced: synced ?? this.synced,
  );
  DbEvent copyWithCompanion(EventQueueCompanion data) {
    return DbEvent(
      id: data.id.present ? data.id.value : this.id,
      eventType: data.eventType.present ? data.eventType.value : this.eventType,
      jobId: data.jobId.present ? data.jobId.value : this.jobId,
      payload: data.payload.present ? data.payload.value : this.payload,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      synced: data.synced.present ? data.synced.value : this.synced,
    );
  }

  @override
  String toString() {
    return (StringBuffer('DbEvent(')
          ..write('id: $id, ')
          ..write('eventType: $eventType, ')
          ..write('jobId: $jobId, ')
          ..write('payload: $payload, ')
          ..write('createdAt: $createdAt, ')
          ..write('synced: $synced')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, eventType, jobId, payload, createdAt, synced);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is DbEvent &&
          other.id == this.id &&
          other.eventType == this.eventType &&
          other.jobId == this.jobId &&
          other.payload == this.payload &&
          other.createdAt == this.createdAt &&
          other.synced == this.synced);
}

class EventQueueCompanion extends UpdateCompanion<DbEvent> {
  final Value<int> id;
  final Value<String> eventType;
  final Value<String> jobId;
  final Value<String> payload;
  final Value<DateTime> createdAt;
  final Value<bool> synced;
  const EventQueueCompanion({
    this.id = const Value.absent(),
    this.eventType = const Value.absent(),
    this.jobId = const Value.absent(),
    this.payload = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.synced = const Value.absent(),
  });
  EventQueueCompanion.insert({
    this.id = const Value.absent(),
    required String eventType,
    required String jobId,
    required String payload,
    required DateTime createdAt,
    this.synced = const Value.absent(),
  }) : eventType = Value(eventType),
       jobId = Value(jobId),
       payload = Value(payload),
       createdAt = Value(createdAt);
  static Insertable<DbEvent> custom({
    Expression<int>? id,
    Expression<String>? eventType,
    Expression<String>? jobId,
    Expression<String>? payload,
    Expression<DateTime>? createdAt,
    Expression<bool>? synced,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (eventType != null) 'event_type': eventType,
      if (jobId != null) 'job_id': jobId,
      if (payload != null) 'payload': payload,
      if (createdAt != null) 'created_at': createdAt,
      if (synced != null) 'synced': synced,
    });
  }

  EventQueueCompanion copyWith({
    Value<int>? id,
    Value<String>? eventType,
    Value<String>? jobId,
    Value<String>? payload,
    Value<DateTime>? createdAt,
    Value<bool>? synced,
  }) {
    return EventQueueCompanion(
      id: id ?? this.id,
      eventType: eventType ?? this.eventType,
      jobId: jobId ?? this.jobId,
      payload: payload ?? this.payload,
      createdAt: createdAt ?? this.createdAt,
      synced: synced ?? this.synced,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (eventType.present) {
      map['event_type'] = Variable<String>(eventType.value);
    }
    if (jobId.present) {
      map['job_id'] = Variable<String>(jobId.value);
    }
    if (payload.present) {
      map['payload'] = Variable<String>(payload.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (synced.present) {
      map['synced'] = Variable<bool>(synced.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('EventQueueCompanion(')
          ..write('id: $id, ')
          ..write('eventType: $eventType, ')
          ..write('jobId: $jobId, ')
          ..write('payload: $payload, ')
          ..write('createdAt: $createdAt, ')
          ..write('synced: $synced')
          ..write(')'))
        .toString();
  }
}

class $TripCacheTable extends TripCache
    with TableInfo<$TripCacheTable, DbTripCache> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $TripCacheTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _rowKeyMeta = const VerificationMeta('rowKey');
  @override
  late final GeneratedColumn<String> rowKey = GeneratedColumn<String>(
    'row_key',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('singleton'),
  );
  static const VerificationMeta _stateJsonMeta = const VerificationMeta(
    'stateJson',
  );
  @override
  late final GeneratedColumn<String> stateJson = GeneratedColumn<String>(
    'state_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _signatureBytesMeta = const VerificationMeta(
    'signatureBytes',
  );
  @override
  late final GeneratedColumn<Uint8List> signatureBytes =
      GeneratedColumn<Uint8List>(
        'signature_bytes',
        aliasedName,
        true,
        type: DriftSqlType.blob,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    rowKey,
    stateJson,
    signatureBytes,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'trip_cache';
  @override
  VerificationContext validateIntegrity(
    Insertable<DbTripCache> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('row_key')) {
      context.handle(
        _rowKeyMeta,
        rowKey.isAcceptableOrUnknown(data['row_key']!, _rowKeyMeta),
      );
    }
    if (data.containsKey('state_json')) {
      context.handle(
        _stateJsonMeta,
        stateJson.isAcceptableOrUnknown(data['state_json']!, _stateJsonMeta),
      );
    } else if (isInserting) {
      context.missing(_stateJsonMeta);
    }
    if (data.containsKey('signature_bytes')) {
      context.handle(
        _signatureBytesMeta,
        signatureBytes.isAcceptableOrUnknown(
          data['signature_bytes']!,
          _signatureBytesMeta,
        ),
      );
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {rowKey};
  @override
  DbTripCache map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return DbTripCache(
      rowKey: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}row_key'],
      )!,
      stateJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}state_json'],
      )!,
      signatureBytes: attachedDatabase.typeMapping.read(
        DriftSqlType.blob,
        data['${effectivePrefix}signature_bytes'],
      ),
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $TripCacheTable createAlias(String alias) {
    return $TripCacheTable(attachedDatabase, alias);
  }
}

class DbTripCache extends DataClass implements Insertable<DbTripCache> {
  final String rowKey;
  final String stateJson;
  final Uint8List? signatureBytes;
  final DateTime updatedAt;
  const DbTripCache({
    required this.rowKey,
    required this.stateJson,
    this.signatureBytes,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['row_key'] = Variable<String>(rowKey);
    map['state_json'] = Variable<String>(stateJson);
    if (!nullToAbsent || signatureBytes != null) {
      map['signature_bytes'] = Variable<Uint8List>(signatureBytes);
    }
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  TripCacheCompanion toCompanion(bool nullToAbsent) {
    return TripCacheCompanion(
      rowKey: Value(rowKey),
      stateJson: Value(stateJson),
      signatureBytes: signatureBytes == null && nullToAbsent
          ? const Value.absent()
          : Value(signatureBytes),
      updatedAt: Value(updatedAt),
    );
  }

  factory DbTripCache.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return DbTripCache(
      rowKey: serializer.fromJson<String>(json['rowKey']),
      stateJson: serializer.fromJson<String>(json['stateJson']),
      signatureBytes: serializer.fromJson<Uint8List?>(json['signatureBytes']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'rowKey': serializer.toJson<String>(rowKey),
      'stateJson': serializer.toJson<String>(stateJson),
      'signatureBytes': serializer.toJson<Uint8List?>(signatureBytes),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  DbTripCache copyWith({
    String? rowKey,
    String? stateJson,
    Value<Uint8List?> signatureBytes = const Value.absent(),
    DateTime? updatedAt,
  }) => DbTripCache(
    rowKey: rowKey ?? this.rowKey,
    stateJson: stateJson ?? this.stateJson,
    signatureBytes: signatureBytes.present
        ? signatureBytes.value
        : this.signatureBytes,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  DbTripCache copyWithCompanion(TripCacheCompanion data) {
    return DbTripCache(
      rowKey: data.rowKey.present ? data.rowKey.value : this.rowKey,
      stateJson: data.stateJson.present ? data.stateJson.value : this.stateJson,
      signatureBytes: data.signatureBytes.present
          ? data.signatureBytes.value
          : this.signatureBytes,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('DbTripCache(')
          ..write('rowKey: $rowKey, ')
          ..write('stateJson: $stateJson, ')
          ..write('signatureBytes: $signatureBytes, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    rowKey,
    stateJson,
    $driftBlobEquality.hash(signatureBytes),
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is DbTripCache &&
          other.rowKey == this.rowKey &&
          other.stateJson == this.stateJson &&
          $driftBlobEquality.equals(
            other.signatureBytes,
            this.signatureBytes,
          ) &&
          other.updatedAt == this.updatedAt);
}

class TripCacheCompanion extends UpdateCompanion<DbTripCache> {
  final Value<String> rowKey;
  final Value<String> stateJson;
  final Value<Uint8List?> signatureBytes;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const TripCacheCompanion({
    this.rowKey = const Value.absent(),
    this.stateJson = const Value.absent(),
    this.signatureBytes = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  TripCacheCompanion.insert({
    this.rowKey = const Value.absent(),
    required String stateJson,
    this.signatureBytes = const Value.absent(),
    required DateTime updatedAt,
    this.rowid = const Value.absent(),
  }) : stateJson = Value(stateJson),
       updatedAt = Value(updatedAt);
  static Insertable<DbTripCache> custom({
    Expression<String>? rowKey,
    Expression<String>? stateJson,
    Expression<Uint8List>? signatureBytes,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (rowKey != null) 'row_key': rowKey,
      if (stateJson != null) 'state_json': stateJson,
      if (signatureBytes != null) 'signature_bytes': signatureBytes,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  TripCacheCompanion copyWith({
    Value<String>? rowKey,
    Value<String>? stateJson,
    Value<Uint8List?>? signatureBytes,
    Value<DateTime>? updatedAt,
    Value<int>? rowid,
  }) {
    return TripCacheCompanion(
      rowKey: rowKey ?? this.rowKey,
      stateJson: stateJson ?? this.stateJson,
      signatureBytes: signatureBytes ?? this.signatureBytes,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (rowKey.present) {
      map['row_key'] = Variable<String>(rowKey.value);
    }
    if (stateJson.present) {
      map['state_json'] = Variable<String>(stateJson.value);
    }
    if (signatureBytes.present) {
      map['signature_bytes'] = Variable<Uint8List>(signatureBytes.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TripCacheCompanion(')
          ..write('rowKey: $rowKey, ')
          ..write('stateJson: $stateJson, ')
          ..write('signatureBytes: $signatureBytes, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $GpsRecordsTable gpsRecords = $GpsRecordsTable(this);
  late final $EventQueueTable eventQueue = $EventQueueTable(this);
  late final $TripCacheTable tripCache = $TripCacheTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    gpsRecords,
    eventQueue,
    tripCache,
  ];
}

typedef $$GpsRecordsTableCreateCompanionBuilder =
    GpsRecordsCompanion Function({
      Value<int> id,
      required String jobId,
      required double lat,
      required double lng,
      Value<double> accuracy,
      Value<double> speedMps,
      required DateTime recordedAt,
      Value<bool> synced,
    });
typedef $$GpsRecordsTableUpdateCompanionBuilder =
    GpsRecordsCompanion Function({
      Value<int> id,
      Value<String> jobId,
      Value<double> lat,
      Value<double> lng,
      Value<double> accuracy,
      Value<double> speedMps,
      Value<DateTime> recordedAt,
      Value<bool> synced,
    });

class $$GpsRecordsTableFilterComposer
    extends Composer<_$AppDatabase, $GpsRecordsTable> {
  $$GpsRecordsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get jobId => $composableBuilder(
    column: $table.jobId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get lat => $composableBuilder(
    column: $table.lat,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get lng => $composableBuilder(
    column: $table.lng,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get accuracy => $composableBuilder(
    column: $table.accuracy,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get speedMps => $composableBuilder(
    column: $table.speedMps,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get recordedAt => $composableBuilder(
    column: $table.recordedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get synced => $composableBuilder(
    column: $table.synced,
    builder: (column) => ColumnFilters(column),
  );
}

class $$GpsRecordsTableOrderingComposer
    extends Composer<_$AppDatabase, $GpsRecordsTable> {
  $$GpsRecordsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get jobId => $composableBuilder(
    column: $table.jobId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get lat => $composableBuilder(
    column: $table.lat,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get lng => $composableBuilder(
    column: $table.lng,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get accuracy => $composableBuilder(
    column: $table.accuracy,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get speedMps => $composableBuilder(
    column: $table.speedMps,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get recordedAt => $composableBuilder(
    column: $table.recordedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get synced => $composableBuilder(
    column: $table.synced,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$GpsRecordsTableAnnotationComposer
    extends Composer<_$AppDatabase, $GpsRecordsTable> {
  $$GpsRecordsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get jobId =>
      $composableBuilder(column: $table.jobId, builder: (column) => column);

  GeneratedColumn<double> get lat =>
      $composableBuilder(column: $table.lat, builder: (column) => column);

  GeneratedColumn<double> get lng =>
      $composableBuilder(column: $table.lng, builder: (column) => column);

  GeneratedColumn<double> get accuracy =>
      $composableBuilder(column: $table.accuracy, builder: (column) => column);

  GeneratedColumn<double> get speedMps =>
      $composableBuilder(column: $table.speedMps, builder: (column) => column);

  GeneratedColumn<DateTime> get recordedAt => $composableBuilder(
    column: $table.recordedAt,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get synced =>
      $composableBuilder(column: $table.synced, builder: (column) => column);
}

class $$GpsRecordsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $GpsRecordsTable,
          DbGpsRecord,
          $$GpsRecordsTableFilterComposer,
          $$GpsRecordsTableOrderingComposer,
          $$GpsRecordsTableAnnotationComposer,
          $$GpsRecordsTableCreateCompanionBuilder,
          $$GpsRecordsTableUpdateCompanionBuilder,
          (
            DbGpsRecord,
            BaseReferences<_$AppDatabase, $GpsRecordsTable, DbGpsRecord>,
          ),
          DbGpsRecord,
          PrefetchHooks Function()
        > {
  $$GpsRecordsTableTableManager(_$AppDatabase db, $GpsRecordsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$GpsRecordsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$GpsRecordsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$GpsRecordsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> jobId = const Value.absent(),
                Value<double> lat = const Value.absent(),
                Value<double> lng = const Value.absent(),
                Value<double> accuracy = const Value.absent(),
                Value<double> speedMps = const Value.absent(),
                Value<DateTime> recordedAt = const Value.absent(),
                Value<bool> synced = const Value.absent(),
              }) => GpsRecordsCompanion(
                id: id,
                jobId: jobId,
                lat: lat,
                lng: lng,
                accuracy: accuracy,
                speedMps: speedMps,
                recordedAt: recordedAt,
                synced: synced,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String jobId,
                required double lat,
                required double lng,
                Value<double> accuracy = const Value.absent(),
                Value<double> speedMps = const Value.absent(),
                required DateTime recordedAt,
                Value<bool> synced = const Value.absent(),
              }) => GpsRecordsCompanion.insert(
                id: id,
                jobId: jobId,
                lat: lat,
                lng: lng,
                accuracy: accuracy,
                speedMps: speedMps,
                recordedAt: recordedAt,
                synced: synced,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$GpsRecordsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $GpsRecordsTable,
      DbGpsRecord,
      $$GpsRecordsTableFilterComposer,
      $$GpsRecordsTableOrderingComposer,
      $$GpsRecordsTableAnnotationComposer,
      $$GpsRecordsTableCreateCompanionBuilder,
      $$GpsRecordsTableUpdateCompanionBuilder,
      (
        DbGpsRecord,
        BaseReferences<_$AppDatabase, $GpsRecordsTable, DbGpsRecord>,
      ),
      DbGpsRecord,
      PrefetchHooks Function()
    >;
typedef $$EventQueueTableCreateCompanionBuilder =
    EventQueueCompanion Function({
      Value<int> id,
      required String eventType,
      required String jobId,
      required String payload,
      required DateTime createdAt,
      Value<bool> synced,
    });
typedef $$EventQueueTableUpdateCompanionBuilder =
    EventQueueCompanion Function({
      Value<int> id,
      Value<String> eventType,
      Value<String> jobId,
      Value<String> payload,
      Value<DateTime> createdAt,
      Value<bool> synced,
    });

class $$EventQueueTableFilterComposer
    extends Composer<_$AppDatabase, $EventQueueTable> {
  $$EventQueueTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get eventType => $composableBuilder(
    column: $table.eventType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get jobId => $composableBuilder(
    column: $table.jobId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get payload => $composableBuilder(
    column: $table.payload,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get synced => $composableBuilder(
    column: $table.synced,
    builder: (column) => ColumnFilters(column),
  );
}

class $$EventQueueTableOrderingComposer
    extends Composer<_$AppDatabase, $EventQueueTable> {
  $$EventQueueTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get eventType => $composableBuilder(
    column: $table.eventType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get jobId => $composableBuilder(
    column: $table.jobId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get payload => $composableBuilder(
    column: $table.payload,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get synced => $composableBuilder(
    column: $table.synced,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$EventQueueTableAnnotationComposer
    extends Composer<_$AppDatabase, $EventQueueTable> {
  $$EventQueueTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get eventType =>
      $composableBuilder(column: $table.eventType, builder: (column) => column);

  GeneratedColumn<String> get jobId =>
      $composableBuilder(column: $table.jobId, builder: (column) => column);

  GeneratedColumn<String> get payload =>
      $composableBuilder(column: $table.payload, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<bool> get synced =>
      $composableBuilder(column: $table.synced, builder: (column) => column);
}

class $$EventQueueTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $EventQueueTable,
          DbEvent,
          $$EventQueueTableFilterComposer,
          $$EventQueueTableOrderingComposer,
          $$EventQueueTableAnnotationComposer,
          $$EventQueueTableCreateCompanionBuilder,
          $$EventQueueTableUpdateCompanionBuilder,
          (DbEvent, BaseReferences<_$AppDatabase, $EventQueueTable, DbEvent>),
          DbEvent,
          PrefetchHooks Function()
        > {
  $$EventQueueTableTableManager(_$AppDatabase db, $EventQueueTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$EventQueueTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$EventQueueTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$EventQueueTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<String> eventType = const Value.absent(),
                Value<String> jobId = const Value.absent(),
                Value<String> payload = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<bool> synced = const Value.absent(),
              }) => EventQueueCompanion(
                id: id,
                eventType: eventType,
                jobId: jobId,
                payload: payload,
                createdAt: createdAt,
                synced: synced,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                required String eventType,
                required String jobId,
                required String payload,
                required DateTime createdAt,
                Value<bool> synced = const Value.absent(),
              }) => EventQueueCompanion.insert(
                id: id,
                eventType: eventType,
                jobId: jobId,
                payload: payload,
                createdAt: createdAt,
                synced: synced,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$EventQueueTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $EventQueueTable,
      DbEvent,
      $$EventQueueTableFilterComposer,
      $$EventQueueTableOrderingComposer,
      $$EventQueueTableAnnotationComposer,
      $$EventQueueTableCreateCompanionBuilder,
      $$EventQueueTableUpdateCompanionBuilder,
      (DbEvent, BaseReferences<_$AppDatabase, $EventQueueTable, DbEvent>),
      DbEvent,
      PrefetchHooks Function()
    >;
typedef $$TripCacheTableCreateCompanionBuilder =
    TripCacheCompanion Function({
      Value<String> rowKey,
      required String stateJson,
      Value<Uint8List?> signatureBytes,
      required DateTime updatedAt,
      Value<int> rowid,
    });
typedef $$TripCacheTableUpdateCompanionBuilder =
    TripCacheCompanion Function({
      Value<String> rowKey,
      Value<String> stateJson,
      Value<Uint8List?> signatureBytes,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });

class $$TripCacheTableFilterComposer
    extends Composer<_$AppDatabase, $TripCacheTable> {
  $$TripCacheTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get rowKey => $composableBuilder(
    column: $table.rowKey,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get stateJson => $composableBuilder(
    column: $table.stateJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<Uint8List> get signatureBytes => $composableBuilder(
    column: $table.signatureBytes,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$TripCacheTableOrderingComposer
    extends Composer<_$AppDatabase, $TripCacheTable> {
  $$TripCacheTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get rowKey => $composableBuilder(
    column: $table.rowKey,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get stateJson => $composableBuilder(
    column: $table.stateJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<Uint8List> get signatureBytes => $composableBuilder(
    column: $table.signatureBytes,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$TripCacheTableAnnotationComposer
    extends Composer<_$AppDatabase, $TripCacheTable> {
  $$TripCacheTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get rowKey =>
      $composableBuilder(column: $table.rowKey, builder: (column) => column);

  GeneratedColumn<String> get stateJson =>
      $composableBuilder(column: $table.stateJson, builder: (column) => column);

  GeneratedColumn<Uint8List> get signatureBytes => $composableBuilder(
    column: $table.signatureBytes,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$TripCacheTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $TripCacheTable,
          DbTripCache,
          $$TripCacheTableFilterComposer,
          $$TripCacheTableOrderingComposer,
          $$TripCacheTableAnnotationComposer,
          $$TripCacheTableCreateCompanionBuilder,
          $$TripCacheTableUpdateCompanionBuilder,
          (
            DbTripCache,
            BaseReferences<_$AppDatabase, $TripCacheTable, DbTripCache>,
          ),
          DbTripCache,
          PrefetchHooks Function()
        > {
  $$TripCacheTableTableManager(_$AppDatabase db, $TripCacheTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$TripCacheTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$TripCacheTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$TripCacheTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> rowKey = const Value.absent(),
                Value<String> stateJson = const Value.absent(),
                Value<Uint8List?> signatureBytes = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => TripCacheCompanion(
                rowKey: rowKey,
                stateJson: stateJson,
                signatureBytes: signatureBytes,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                Value<String> rowKey = const Value.absent(),
                required String stateJson,
                Value<Uint8List?> signatureBytes = const Value.absent(),
                required DateTime updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => TripCacheCompanion.insert(
                rowKey: rowKey,
                stateJson: stateJson,
                signatureBytes: signatureBytes,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$TripCacheTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $TripCacheTable,
      DbTripCache,
      $$TripCacheTableFilterComposer,
      $$TripCacheTableOrderingComposer,
      $$TripCacheTableAnnotationComposer,
      $$TripCacheTableCreateCompanionBuilder,
      $$TripCacheTableUpdateCompanionBuilder,
      (
        DbTripCache,
        BaseReferences<_$AppDatabase, $TripCacheTable, DbTripCache>,
      ),
      DbTripCache,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$GpsRecordsTableTableManager get gpsRecords =>
      $$GpsRecordsTableTableManager(_db, _db.gpsRecords);
  $$EventQueueTableTableManager get eventQueue =>
      $$EventQueueTableTableManager(_db, _db.eventQueue);
  $$TripCacheTableTableManager get tripCache =>
      $$TripCacheTableTableManager(_db, _db.tripCache);
}
