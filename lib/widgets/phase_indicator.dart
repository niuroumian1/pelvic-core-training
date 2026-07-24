import 'package:flutter/material.dart';

import '../models/training_state.dart';
import '../theme/app_theme.dart';

class PhaseIndicator extends StatelessWidget {
  const PhaseIndicator({required this.current, super.key});

  final TrainingState current;

  @override
  Widget build(BuildContext context) {
    const phases = [
      TrainingState.contract,
      TrainingState.hold,
      TrainingState.relax,
    ];
    return Row(
      children: [
        for (var i = 0; i < phases.length; i++) ...[
          Expanded(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              height: 4,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(99),
                color: current == phases[i]
                    ? AppColors.cyan
                    : AppColors.surfaceHigh,
                boxShadow: current == phases[i]
                    ? const [
                        BoxShadow(color: AppColors.cyan, blurRadius: 8),
                      ]
                    : null,
              ),
            ),
          ),
          if (i != phases.length - 1) const SizedBox(width: 7),
        ],
      ],
    );
  }
}
