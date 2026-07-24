import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../models/training_snapshot.dart';
import '../models/training_state.dart';
import '../theme/app_theme.dart';

class EnergyCore extends StatefulWidget {
  const EnergyCore({required this.snapshot, super.key});

  final TrainingSnapshot snapshot;

  @override
  State<EnergyCore> createState() => _EnergyCoreState();
}

class _EnergyCoreState extends State<EnergyCore>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ambient;

  @override
  void initState() {
    super.initState();
    _ambient = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _ambient.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: AnimatedBuilder(
        animation: _ambient,
        builder: (context, _) => CustomPaint(
          painter: _EnergyCorePainter(
            snapshot: widget.snapshot,
            ambient: _ambient.value,
          ),
          child: const SizedBox.expand(),
        ),
      ),
    );
  }
}

class _EnergyCorePainter extends CustomPainter {
  const _EnergyCorePainter({required this.snapshot, required this.ambient});

  final TrainingSnapshot snapshot;
  final double ambient;

  double get compression {
    return switch (snapshot.state) {
      TrainingState.contract => snapshot.phaseProgress,
      TrainingState.hold => 1,
      TrainingState.relax => 1 - Curves.easeOutCubic.transform(
          snapshot.phaseProgress,
        ),
      TrainingState.roundSuccess => 0,
      _ => 0,
    };
  }

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final minSide = math.min(size.width, size.height);
    final pulse = math.sin(ambient * math.pi * 2);
    final holdJitter = snapshot.state == TrainingState.hold ? pulse * 1.5 : 0.0;
    final coreRadius = minSide * (0.145 - compression * 0.045) + holdJitter;
    final ringRadius = minSide * (0.29 - compression * 0.105);

    _drawParticles(canvas, center, ringRadius, minSide);
    _drawRings(canvas, center, ringRadius, pulse);
    _drawCore(canvas, center, coreRadius, pulse);
    if (snapshot.state == TrainingState.relax) {
      _drawReleaseWave(canvas, center, minSide);
    }
  }

  void _drawParticles(
    Canvas canvas,
    Offset center,
    double ringRadius,
    double minSide,
  ) {
    final particlePaint = Paint()
      ..color = AppColors.cyan.withOpacity(0.28 + compression * 0.42)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    for (var i = 0; i < 22; i++) {
      final angle = i * math.pi * 2 / 22 + ambient * .35 * (i.isEven ? 1 : -1);
      final variation = math.sin(i * 7.13 + ambient * math.pi * 2) * 13;
      final radius = ringRadius + variation + (1 - compression) * 36;
      final offset = center +
          Offset(math.cos(angle) * radius, math.sin(angle) * radius);
      canvas.drawCircle(offset, 1.5 + (i % 3) * .65, particlePaint);
    }
  }

  void _drawRings(Canvas canvas, Offset center, double radius, double pulse) {
    for (var i = 0; i < 3; i++) {
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = i == 0 ? 2.2 : 1
        ..color = AppColors.cyan.withOpacity(.32 - i * .075)
        ..maskFilter = i == 0
            ? const MaskFilter.blur(BlurStyle.normal, 5)
            : null;
      canvas.drawCircle(center, radius + i * 22 + pulse * (i + 1), paint);
    }
    final arcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..shader = const SweepGradient(
        colors: [Colors.transparent, AppColors.cyan, Colors.transparent],
      ).createShader(Rect.fromCircle(center: center, radius: radius + 12));
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius + 12),
      ambient * math.pi * 2,
      math.pi * .85,
      false,
      arcPaint,
    );
  }

  void _drawCore(Canvas canvas, Offset center, double radius, double pulse) {
    final glowPaint = Paint()
      ..color = AppColors.blue.withOpacity(.18 + compression * .18)
      ..maskFilter = MaskFilter.blur(BlurStyle.normal, radius * .7);
    canvas.drawCircle(center, radius * 1.65, glowPaint);

    final corePaint = Paint()
      ..shader = RadialGradient(
        colors: [
          Colors.white,
          AppColors.cyan,
          Color.lerp(AppColors.blue, AppColors.cyan, compression)!,
          const Color(0xFF061B33),
        ],
        stops: const [0, .18, .55, 1],
      ).createShader(Rect.fromCircle(center: center, radius: radius));
    canvas.drawCircle(center, radius + pulse * 1.5, corePaint);

    final shellPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..color = Colors.white.withOpacity(.55);
    canvas.drawCircle(center, radius * .86, shellPaint);
  }

  void _drawReleaseWave(Canvas canvas, Offset center, double minSide) {
    final eased = Curves.easeOutCubic.transform(snapshot.phaseProgress);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3 * (1 - eased) + .5
      ..color = AppColors.green.withOpacity((1 - eased) * .65);
    canvas.drawCircle(center, minSide * (.17 + .35 * eased), paint);
  }

  @override
  bool shouldRepaint(covariant _EnergyCorePainter oldDelegate) =>
      oldDelegate.snapshot != snapshot || oldDelegate.ambient != ambient;
}
