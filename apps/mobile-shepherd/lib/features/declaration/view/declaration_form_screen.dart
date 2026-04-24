import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../view_model/declaration_view_model.dart';
import '../widgets/location_status.dart';
import '../widgets/weight_estimator.dart';

/// Full declaration form: weight estimation, location, optional photo, notes.
class DeclarationFormScreen extends ConsumerStatefulWidget {
  const DeclarationFormScreen({super.key});

  @override
  ConsumerState<DeclarationFormScreen> createState() =>
      _DeclarationFormScreenState();
}

class _DeclarationFormScreenState extends ConsumerState<DeclarationFormScreen> {
  final _notesController = TextEditingController();
  final _surnomController = TextEditingController();
  final _mazraaController = TextEditingController();
  bool _locationRequested = false;
  bool _locationLoading = false;

  @override
  void initState() {
    super.initState();
    _requestLocation();
  }

  @override
  void dispose() {
    _notesController.dispose();
    _surnomController.dispose();
    _mazraaController.dispose();
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
            const SnackBar(content: Text('لازم تسمح بالموقع باش نعرفو وينك')),
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
      ref.read(declarationViewModelProvider.notifier).setLocation(
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
      ref.read(declarationViewModelProvider.notifier).setPhoto(photo.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).ba33;
    final formState = ref.watch(declarationViewModelProvider);

    ref.listen(declarationViewModelProvider, (prev, next) {
      if (next.error != null) {
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
            Text(
              'السرنوم (اللقب)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: Ba33Spacing.spacing3),
            TextField(
              controller: _surnomController,
              decoration: const InputDecoration(
                hintText: 'واش يقولولك الناس؟',
              ),
              onChanged: (value) => ref
                  .read(declarationViewModelProvider.notifier)
                  .setSurnom(value),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            WeightEstimator(
              selected: formState.weightCategory,
              onSelected: (category) => ref
                  .read(declarationViewModelProvider.notifier)
                  .selectWeight(category),
            ),
            const SizedBox(height: Ba33Spacing.spacing6),
            Text(
              'الموقع تاعك',
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
                  .read(declarationViewModelProvider.notifier)
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
                  border: Border.all(
                    color: colors.border,
                    style: BorderStyle.solid,
                  ),
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
                  .read(declarationViewModelProvider.notifier)
                  .setNotes(value),
            ),
            const SizedBox(height: Ba33Spacing.spacing8),
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: formState.isValid && !formState.isSubmitting
                    ? () => ref
                        .read(declarationViewModelProvider.notifier)
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
