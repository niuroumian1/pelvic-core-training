import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../animation/energy_core_scene.dart';
import '../models/training_snapshot.dart';
import '../models/training_state.dart';
import '../services/training_engine.dart';
import '../theme/app_theme.dart';
import '../widgets/phase_indicator.dart';
import 'success_screen.dart';

class TrainingScreen extends StatefulWidget {
  const TrainingScreen({super.key});

  @override
  State<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends State<TrainingScreen> {
  final TrainingEngine _engine = TrainingEngine();
  final EnergyCoreScene _scene = const EnergyCoreScene();
  TrainingState? _lastState;

  @override
  void initState() {
    super.initState();
    _engine.addListener(_onEngineChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) => _engine.start());
  }

  void _onEngineChanged() {
    final state = _engine.state;
    if (state != _lastState) {
      if (state == TrainingState.hold) {
        HapticFeedback.mediumImpact();
      } else if (state == TrainingState.relax) {
        HapticFeedback.lightImpact();
      } else if (state == TrainingState.roundSuccess) {
        HapticFeedback.heavyImpact();
      } else if (state == TrainingState.complete && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute<void>(builder: (_) => const SuccessScreen()),
        );
      }
      _lastState = state;
    }
  }

  @override
  void dispose() {
    _engine
      ..removeListener(_onEngineChanged)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (!didPop) _confirmExit();
      },
      child: Scaffold(
        body: SafeArea(
          child: AnimatedBuilder(
            animation: _engine,
            builder: (context, _) => _TrainingBody(
              snapshot: _engine.snapshot,
              scene: _scene,
              onClose: _confirmExit,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmExit() async {
    final leave = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('结束本次训练？'),
        content: const Text('当前训练进度不会保存。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('继续训练'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('结束'),
          ),
        ],
      ),
    );
    if (leave == true && mounted) Navigator.of(context).pop();
  }
}

class _TrainingBody extends StatelessWidget {
  const _TrainingBody({
    required this.snapshot,
    required this.scene,
    required this.onClose,
  });

  final TrainingSnapshot snapshot;
  final EnergyCoreScene scene;
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    final isReady = snapshot.state == TrainingState.ready;
    final isScore = snapshot.state == TrainingState.roundSuccess;
    return Stack(
      children: [
        Positioned.fill(
          child: DecoratedBox(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                radius: .95,
                colors: [Color(0xFF0B2942), AppColors.background],
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(22, 12, 22, 20),
          child: Column(
            children: [
              Row(
                children: [
                  IconButton(
                    onPressed: onClose,
                    icon: const Icon(Icons.close_rounded),
                    color: AppColors.textSecondary,
                  ),
                  const Spacer(),
                  Text(
                    '第 ${snapshot.round} / ${snapshot.totalRounds} 组',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const Spacer(),
                  const SizedBox(width: 48),
                ],
              ),
              const SizedBox(height: 12),
              PhaseIndicator(current: snapshot.state),
              Expanded(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Positioned.fill(child: scene.build(context, snapshot)),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 300),
                      child: isScore
                          ? const _RoundScore(key: ValueKey('score'))
                          : isReady
                              ? _Countdown(
                                  key: const ValueKey('ready'),
                                  seconds: snapshot.displaySeconds,
                                )
                              : const SizedBox.shrink(key: ValueKey('core')),
                    ),
                  ],
                ),
              ),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 220),
                child: Column(
                  key: ValueKey(snapshot.state),
                  children: [
                    Text(
                      snapshot.state.title,
                      style: const TextStyle(
                        color: AppColors.cyan,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 4,
                      ),
                    ),
                    const SizedBox(height: 9),
                    if (!isReady && !isScore)
                      Text(
                        '${snapshot.displaySeconds}',
                        style: const TextStyle(
                          fontSize: 52,
                          fontWeight: FontWeight.w300,
                          height: 1,
                        ),
                      ),
                    const SizedBox(height: 10),
                    Text(
                      snapshot.state.guidance,
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              ClipRRect(
                borderRadius: BorderRadius.circular(99),
                child: LinearProgressIndicator(
                  minHeight: 6,
                  value: snapshot.phaseProgress,
                  backgroundColor: AppColors.surfaceHigh,
                  color: AppColors.cyan,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Countdown extends StatelessWidget {
  const _Countdown({required this.seconds, super.key});
  final int seconds;

  @override
  Widget build(BuildContext context) => Text(
        '$seconds',
        style: const TextStyle(
          fontSize: 92,
          fontWeight: FontWeight.w200,
          color: AppColors.textPrimary,
          shadows: [Shadow(color: AppColors.cyan, blurRadius: 28)],
        ),
      );
}

class _RoundScore extends StatelessWidget {
  const _RoundScore({super.key});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 22),
        decoration: BoxDecoration(
          color: AppColors.surface.withOpacity(.9),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.green.withOpacity(.5)),
        ),
        child: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_rounded, color: AppColors.green, size: 36),
            SizedBox(height: 10),
            Text('本组完成', style: TextStyle(fontSize: 20)),
            SizedBox(height: 6),
            Text(
              '+10 XP',
              style: TextStyle(
                color: AppColors.green,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      );
}
