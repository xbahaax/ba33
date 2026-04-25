import 'dart:io';

import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../shared/providers/profession_provider.dart';
import '../view_model/declaration_view_model.dart';
import '../widgets/location_status.dart';

/// Full declaration form. Profession-aware: shepherds see shearing/breed/
/// parasite-treatment fields; slaughterhouses/butchers/aggregators get a
/// trimmed version focused on weight + bagging + identity.
class DeclarationFormScreen extends ConsumerStatefulWidget {
  const DeclarationFormScreen({super.key});

  @override
  ConsumerState<DeclarationFormScreen> createState() =>
      _DeclarationFormScreenState();
}

class _DeclarationFormScreenState extends ConsumerState<DeclarationFormScreen> {
  final _weightCtrl = TextEditingController();
  final _bagCountCtrl = TextEditingController();
  final _breedCtrl = TextEditingController();
  final _surnomCtrl = TextEditingController();
  final _mazraaCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();

  bool _locationRequested = false;
  bool _locationLoading = false;

  @override
  void initState() {
    super.initState();
    _requestLocation();
  }

  @override
  void dispose() {
    _weightCtrl.dispose();
    _bagCountCtrl.dispose();
    _breedCtrl.dispose();
    _surnomCtrl.dispose();
    _mazraaCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestLocation() async {
    if (_locationRequested) return;
    _locationRequested = true;
    setState(() => _locationLoading = true);

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('خدمة الموقع مطفية، شعلها')),
        );
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('لازم تسمح بالموقع')),
        );
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );
      if (!mounted) return;
      ref.read(declarationViewModelProvider.notifier).setLocation(
            position.latitude,
            position.longitude,
            name: 'الموقع الحالي',
          );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ما قدرناش نحددو الموقع')),
      );
    } finally {
      if (mounted) setState(() => _locationLoading = false);
    }
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    final photo = await picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1200,
      maxHeight: 1200,
      imageQuality: 80,
    );
    if (photo != null && mounted) {
      ref.read(declarationViewModelProvider.notifier).setPhoto(photo.path);
    }
  }

  Future<DateTime?> _pickDate(DateTime? initial) async {
    final now = DateTime.now();
    return showDatePicker(
      context: context,
      initialDate: initial ?? now,
      firstDate: DateTime(now.year - 5),
      lastDate: now,
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final formState = ref.watch(declarationViewModelProvider);
    final profession = ref.watch(professionProvider).value;
    final isShepherd = profession == SourceProfession.shepherd;
    final isSlaughter = profession == SourceProfession.slaughterhouse ||
        profession == SourceProfession.butcher;

    ref.listen(declarationViewModelProvider, (prev, next) {
      if (next.error != null && next.error != prev?.error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: colors.destructive,
          ),
        );
      }
      if (next.isSubmitted && !(prev?.isSubmitted ?? false)) {
        context.go('/declaration/success');
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('تصريح بالصوف'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_forward),
          onPressed: () => context.go('/'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _SectionHeader(
              icon: Icons.scale_rounded,
              title: 'كمية الصوف',
              subtitle: 'الوزن المقدر بالكيلوغرام',
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            Ba33Input(
              controller: _weightCtrl,
              label: 'الوزن (kg)',
              hint: 'مثلا 25.5',
              prefixIcon: Icons.scale,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
              ],
              autofocus: true,
              onChanged: (v) => ref
                  .read(declarationViewModelProvider.notifier)
                  .setWeight(double.tryParse(v)),
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            _SectionHeader(
              icon: Icons.inventory_2_outlined,
              title: 'التعبئة',
              subtitle: 'كم كيس و واش نوعهم',
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Ba33Input(
                    controller: _bagCountCtrl,
                    label: 'عدد الكياس',
                    hint: 'مثلا 4',
                    prefixIcon: Icons.numbers_rounded,
                    keyboardType: TextInputType.number,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                    ],
                    onChanged: (v) => ref
                        .read(declarationViewModelProvider.notifier)
                        .setBagCount(int.tryParse(v)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            Text(
              'نوع الكيس',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            const SizedBox(height: Ba33Spacing.spacing2),
            Ba33ChoiceChips<BagType>(
              values: BagType.values,
              selected: formState.bagType,
              labelBuilder: (b) => b.labelArabic(),
              onSelected: (b) => ref
                  .read(declarationViewModelProvider.notifier)
                  .setBagType(b),
            ),

            if (isShepherd) ...[
              const SizedBox(height: Ba33Spacing.spacing6),
              _SectionHeader(
                icon: Icons.agriculture_rounded,
                title: 'تفاصيل التربية',
                subtitle: 'معلومات على الجزّ و الغنم',
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              _DateTile(
                label: 'تاريخ الجزّ',
                value: formState.shearingDate,
                icon: Icons.content_cut,
                onPick: () async {
                  final d = await _pickDate(formState.shearingDate);
                  if (d != null) {
                    ref
                        .read(declarationViewModelProvider.notifier)
                        .setShearingDate(d);
                  }
                },
                onClear: formState.shearingDate != null
                    ? () => ref
                        .read(declarationViewModelProvider.notifier)
                        .setShearingDate(null)
                    : null,
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              Ba33Input(
                controller: _breedCtrl,
                label: 'سلالة الغنم',
                hint: 'أولاد جلال، حمراء، رمبي…',
                prefixIcon: Icons.pets_rounded,
                onChanged: (v) => ref
                    .read(declarationViewModelProvider.notifier)
                    .setSheepBreed(v),
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              _DateTile(
                label: 'آخر علاج ضد الطفيليات',
                value: formState.lastParasiteTreatmentDate,
                icon: Icons.medical_services_outlined,
                onPick: () async {
                  final d = await _pickDate(formState.lastParasiteTreatmentDate);
                  if (d != null) {
                    ref
                        .read(declarationViewModelProvider.notifier)
                        .setParasiteTreatmentDate(d);
                  }
                },
                onClear: formState.lastParasiteTreatmentDate != null
                    ? () => ref
                        .read(declarationViewModelProvider.notifier)
                        .setParasiteTreatmentDate(null)
                    : null,
              ),
            ],

            if (isSlaughter) ...[
              const SizedBox(height: Ba33Spacing.spacing6),
              _SectionHeader(
                icon: Icons.calendar_today_rounded,
                title: 'تاريخ الاستخراج',
                subtitle: 'يوم اللي خرّجت فيه الصوف',
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              _DateTile(
                label: 'تاريخ الاستخراج',
                value: formState.shearingDate,
                icon: Icons.event_rounded,
                onPick: () async {
                  final d = await _pickDate(formState.shearingDate);
                  if (d != null) {
                    ref
                        .read(declarationViewModelProvider.notifier)
                        .setShearingDate(d);
                  }
                },
                onClear: formState.shearingDate != null
                    ? () => ref
                        .read(declarationViewModelProvider.notifier)
                        .setShearingDate(null)
                    : null,
              ),
            ],

            const SizedBox(height: Ba33Spacing.spacing6),

            _SectionHeader(
              icon: Icons.person_outline_rounded,
              title: 'هويتك',
              subtitle: 'باش الجامع يعرفك',
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            Ba33Input(
              controller: _surnomCtrl,
              label: 'السرنوم (اللقب)',
              hint: 'واش يقولولك الناس',
              prefixIcon: Icons.badge_outlined,
              onChanged: (v) => ref
                  .read(declarationViewModelProvider.notifier)
                  .setSurnom(v),
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            Ba33Input(
              controller: _mazraaCtrl,
              label: isSlaughter ? 'اسم المحل / المذبح' : 'اسم المزرعة',
              hint: 'مكان البلاصة',
              prefixIcon: Icons.location_city_outlined,
              onChanged: (v) => ref
                  .read(declarationViewModelProvider.notifier)
                  .setMazraa(v),
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            _SectionHeader(
              icon: Icons.location_on_outlined,
              title: 'الموقع',
              subtitle: 'باش الجامع يلقى الطريق',
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            if (_locationLoading)
              Container(
                padding: const EdgeInsets.all(Ba33Spacing.spacing4),
                decoration: BoxDecoration(
                  color: colors.muted,
                  borderRadius: Ba33Radii.borderRadiusLg,
                  border: Border.all(color: colors.border),
                ),
                child: const Row(
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    SizedBox(width: Ba33Spacing.spacing3),
                    Text('نحددو الموقع...'),
                  ],
                ),
              )
            else
              LocationStatus(
                latitude: formState.latitude,
                longitude: formState.longitude,
                locationName: formState.locationName,
                onRefresh: () {
                  _locationRequested = false;
                  _requestLocation();
                },
              ),

            const SizedBox(height: Ba33Spacing.spacing6),

            _SectionHeader(
              icon: Icons.camera_alt_outlined,
              title: 'تصويرة (اختياري)',
              subtitle: 'تصويرة للصوف باش الجامع يشوف',
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            GestureDetector(
              onTap: _takePhoto,
              child: Container(
                height: 120,
                decoration: BoxDecoration(
                  color: colors.muted,
                  borderRadius: Ba33Radii.borderRadiusLg,
                  border: Border.all(color: colors.border),
                ),
                child: formState.photoPath != null
                    ? ClipRRect(
                        borderRadius: Ba33Radii.borderRadiusLg,
                        child: Image.file(
                          File(formState.photoPath!),
                          fit: BoxFit.cover,
                          width: double.infinity,
                        ),
                      )
                    : Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.camera_alt_outlined,
                                size: 36, color: colors.mutedForeground),
                            const SizedBox(height: Ba33Spacing.spacing2),
                            Text(
                              'اضغط باش تصور',
                              style:
                                  TextStyle(color: colors.mutedForeground),
                            ),
                          ],
                        ),
                      ),
              ),
            ),

            const SizedBox(height: Ba33Spacing.spacing6),

            _SectionHeader(
              icon: Icons.notes_rounded,
              title: 'ملاحظات (اختياري)',
              subtitle: 'تفاصيل زيادة',
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            Ba33Input(
              controller: _notesCtrl,
              hint: 'مثلا: الصوف نظيف، يلزم يجي قبل المطر…',
              maxLines: 3,
              onChanged: (v) => ref
                  .read(declarationViewModelProvider.notifier)
                  .setNotes(v),
            ),

            const SizedBox(height: Ba33Spacing.spacing8),

            Ba33Button(
              onPressed: formState.isValid && !formState.isSubmitting
                  ? () => ref
                      .read(declarationViewModelProvider.notifier)
                      .submit()
                  : null,
              label: 'أكد التصريح',
              icon: Icons.check_rounded,
              size: Ba33ButtonSize.lg,
              expand: true,
              isLoading: formState.isSubmitting,
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: colors.primary.withAlpha(28),
            borderRadius: Ba33Radii.borderRadiusMd,
          ),
          child: Icon(icon, color: colors.primary, size: 20),
        ),
        const SizedBox(width: Ba33Spacing.spacing3),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleSmall),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: colors.mutedForeground,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _DateTile extends StatelessWidget {
  const _DateTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.onPick,
    this.onClear,
  });

  final String label;
  final DateTime? value;
  final IconData icon;
  final VoidCallback onPick;
  final VoidCallback? onClear;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final has = value != null;
    return InkWell(
      borderRadius: Ba33Radii.borderRadiusLg,
      onTap: onPick,
      child: Container(
        padding: const EdgeInsets.all(Ba33Spacing.spacing4),
        decoration: BoxDecoration(
          color: colors.card,
          borderRadius: Ba33Radii.borderRadiusLg,
          border: Border.all(color: colors.border),
        ),
        child: Row(
          children: [
            Icon(icon, color: colors.primary, size: 22),
            const SizedBox(width: Ba33Spacing.spacing3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: Theme.of(context).textTheme.bodyMedium),
                  Text(
                    has ? _format(value!) : 'اضغط للاختيار',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: has
                              ? colors.foreground
                              : colors.mutedForeground,
                        ),
                  ),
                ],
              ),
            ),
            if (has && onClear != null)
              IconButton(
                icon: Icon(Icons.close_rounded, color: colors.mutedForeground),
                onPressed: onClear,
              ),
          ],
        ),
      ),
    );
  }

  String _format(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}
