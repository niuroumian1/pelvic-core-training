import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/hud_card.dart';

class SuccessScreen extends StatelessWidget {
  const SuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 104,
                height: 104,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.green.withOpacity(.1),
                  border: Border.all(color: AppColors.green, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.green.withOpacity(.22),
                      blurRadius: 40,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.bolt_rounded,
                  color: AppColors.green,
                  size: 54,
                ),
              ),
              const SizedBox(height: 28),
              Text('训练完成', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 10),
              const Text(
                '能量核心已稳定充能',
                style: TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 34),
              const HudCard(
                child: Row(
                  children: [
                    _Result(value: '+30', label: '经验'),
                    _ResultDivider(),
                    _Result(value: 'x3', label: '连击'),
                    _ResultDivider(),
                    _Result(value: '3/3', label: '完成'),
                  ],
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.cyan,
                    foregroundColor: const Color(0xFF03111C),
                  ),
                  child: const Text(
                    '返回首页',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Result extends StatelessWidget {
  const _Result({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) => Expanded(
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                color: AppColors.green,
                fontWeight: FontWeight.w700,
                fontSize: 24,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              label,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
          ],
        ),
      );
}

class _ResultDivider extends StatelessWidget {
  const _ResultDivider();

  @override
  Widget build(BuildContext context) =>
      Container(height: 34, width: 1, color: AppColors.surfaceHigh);
}
