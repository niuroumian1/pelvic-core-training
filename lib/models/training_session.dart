class TrainingSession {
  const TrainingSession({
    required this.startedAt,
    required this.completedRounds,
    required this.totalRounds,
    required this.experienceEarned,
    required this.streakDays,
    required this.trainingLevel,
    this.userFeedback,
  });

  final DateTime startedAt;
  final int completedRounds;
  final int totalRounds;
  final int experienceEarned;
  final int streakDays;
  final int trainingLevel;
  final String? userFeedback;

  Map<String, Object?> toJson() => {
        'trainingDate': startedAt.toIso8601String(),
        'completedRounds': completedRounds,
        'totalRounds': totalRounds,
        'experienceEarned': experienceEarned,
        'streakDays': streakDays,
        'trainingLevel': trainingLevel,
        'userFeedback': userFeedback,
      };
}
