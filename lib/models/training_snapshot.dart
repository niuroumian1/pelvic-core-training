import 'training_state.dart';

class TrainingSnapshot {
  const TrainingSnapshot({
    required this.state,
    required this.round,
    required this.totalRounds,
    required this.remaining,
    required this.phaseProgress,
    required this.experience,
    required this.combo,
  });

  final TrainingState state;
  final int round;
  final int totalRounds;
  final Duration remaining;
  final double phaseProgress;
  final int experience;
  final int combo;

  int get displaySeconds =>
      remaining.inMilliseconds <= 0 ? 0 : (remaining.inMilliseconds / 1000).ceil();
}
