import 'package:ba33_ui/ba33_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../receipts/view_model/receipts_view_model.dart';
import '../view_model/declaration_view_model.dart';

/// Shown after a successful declaration submission.
class DeclarationSuccessScreen extends ConsumerWidget {
  const DeclarationSuccessScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colors = Theme.of(context).ba33;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Ba33Spacing.spacing6),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: colors.primary,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check,
                  size: 48,
                  color: colors.primaryForeground,
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing6),
              Text(
                'تم التصريح بالصوف!',
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              Text(
                'غادي نبعثولك جامع الصوف. '
                'راح توصلك إشعار بوقت الجمع.',
                style: TextStyle(
                  color: colors.mutedForeground,
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              SizedBox(
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    ref.invalidate(receiptsProvider);
                    ref.read(declarationViewModelProvider.notifier).reset();
                    context.go('/');
                  },
                  child: const Text(
                    'رجوع للرئيسية',
                    style: TextStyle(fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing3),
              SizedBox(
                height: 56,
                child: OutlinedButton(
                  onPressed: () {
                    ref.invalidate(receiptsProvider);
                    ref.read(declarationViewModelProvider.notifier).reset();
                    context.go('/receipts');
                  },
                  child: const Text(
                    'شوف الوصولات تاعي',
                    style: TextStyle(fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(height: Ba33Spacing.spacing8),
            ],
          ),
        ),
      ),
    );
  }
}
