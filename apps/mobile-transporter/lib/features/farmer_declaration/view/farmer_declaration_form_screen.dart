import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../view_model/farmer_declaration_view_model.dart';
import '../widgets/location_status.dart';
import '../widgets/weight_estimator.dart';

/// Form for transporter to declare wool on behalf of a farmer.
class FarmerDeclarationFormScreen extends ConsumerStatefulWidget {
  const FarmerDeclarationFormScreen({super.key});

  @override
  ConsumerState<FarmerDeclarationFormScreen> createState() =>
      _FarmerDeclarationFormScreenState();
}

class _FarmerDeclarationFormScreenState
    extends ConsumerState<FarmerDeclarationFormScreen> {
  final _farmerNameController = TextEditingController();
  final _farmerPhoneController = TextEditingController();
  final _surnomController = TextEditingController();
  final _mazraaController = TextEditingController();
  final _notesController = TextEditingController();
  bool _locationRequested = false;
  bool _locationLoading = false;

  @override
  void initState() {
    super.initState();
    _requestLocation();
  }

  @override
  void dispose() {
    _farmerNameController.dispose();
    _farmerPhoneController.dispose();
    _surnomController.dispose();
    _mazraaController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _requestLocation() async {
    if (_locationRequested) return;
    _locationRequested = true;
    setState(() => _locationLoading = true);

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('خدمة الموقع مطفية، شعلها')),
        );
        setState(() => _locationLoading = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('لازم تسمح بالموقع باش نعرفو وين الفلاح')),
          );
          setState(() => _locationLoading = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('الموقع محظور، روح للإعدادات و سمح بيه'),
          ),
        );
        setState(() => _locationLoading = false);
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 15),
        ),
      );

      if (!mounted) return;
      ref.read(farmerDeclarationViewModelProvider.notifier).setLocation(
            position.latitude,
            position.longitude,
            name: 'الموقع الحالي',
          );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ما قدرناش نحددو الموقع، عاود حاول')),
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
      ref.read(farmerDeclarationViewModelProvider.notifier).setPhoto(photo.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final formState = ref.watch(farmerDeclarationViewModelProvider);

    ref.listen(farmerDeclarationViewModelProvider, (prev, next) {
      if (next.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.error!),
            backgroundColor: colors.destructive,
          ),
        );
      }
      if (next.isSubmitted && !(prev?.isSubmitted ?? false)) {
        context.go('/farmer-declare/success');
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('تصريح بالصوف لفلاح'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_forward),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(Ba33Spacing.spacing6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'اسم الفلاح',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            TextField(
              controller: _farmerNameController,
              decoration: const InputDecoration(
                hintText: 'الاسم الكامل تاع الفلاح',
              ),
              onChanged: (value) => ref
                  .read(farmerDeclarationViewModelProvider.notifier)
                  .setFarmerName(value),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            Text(
              'رقم تيليفون الفلاح (اختياري)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            TextField(
              controller: _farmerPhoneController,
              keyboardType: TextInputType.phone,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(
                hintText: '0555 123 456',
                prefixText: '+213 ',
              ),
              onChanged: (value) => ref
                  .read(farmerDeclarationViewModelProvider.notifier)
                  .setFarmerPhone(value),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            Text(
              'السرنوم (اللقب)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            TextField(
              controller: _surnomController,
              decoration: const InputDecoration(
                hintText: 'واش يقولولو الناس؟',
              ),
              onChanged: (value) => ref
                  .read(farmerDeclarationViewModelProvider.notifier)
                  .setSurnom(value),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            WeightEstimator(
              selected: formState.weightCategory,
              onSelected: (category) => ref
                  .read(farmerDeclarationViewModelProvider.notifier)
                  .selectWeight(category),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            Text(
              'الموقع',
              style: Theme.of(context).textTheme.titleMedium,
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
            Text(
              'المزرعة',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            TextField(
              controller: _mazraaController,
              decoration: const InputDecoration(
                hintText: 'اسم المزرعة ولا البلاصة',
              ),
              onChanged: (value) => ref
                  .read(farmerDeclarationViewModelProvider.notifier)
                  .setMazraa(value),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            Text(
              'تصويرة (اختياري)',
              style: Theme.of(context).textTheme.titleMedium,
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
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        formState.photoPath != null
                            ? Icons.check_circle
                            : Icons.camera_alt_outlined,
                        size: 36,
                        color: formState.photoPath != null
                            ? colors.primary
                            : colors.mutedForeground,
                      ),
                      const SizedBox(height: Ba33Spacing.spacing2),
                      Text(
                        formState.photoPath != null
                            ? 'التصويرة تزادت'
                            : 'اضغط باش تصور',
                        style: TextStyle(color: colors.mutedForeground),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            Text(
              'ملاحظات (اختياري)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'تفاصيل زيادة...',
              ),
              onChanged: (value) => ref
                  .read(farmerDeclarationViewModelProvider.notifier)
                  .setNotes(value),
            ),
            const SizedBox(height: Ba33Spacing.spacing8),
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: formState.isValid && !formState.isSubmitting
                    ? () => ref
                        .read(farmerDeclarationViewModelProvider.notifier)
                        .submit()
                    : null,
                child: formState.isSubmitting
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'أكد التصريح',
                        style: TextStyle(fontSize: 18),
                      ),
              ),
            ),
            const SizedBox(height: Ba33Spacing.spacing4),
          ],
        ),
      ),
    );
  }
}
