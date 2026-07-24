import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class HudCard extends StatelessWidget {
  const HudCard({required this.child, this.padding, super.key});

  final Widget child;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface.withOpacity(.82),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.cyan.withOpacity(.13)),
        boxShadow: const [
          BoxShadow(color: Color(0x33000000), blurRadius: 24, offset: Offset(0, 8)),
        ],
      ),
      child: child,
    );
  }
}
