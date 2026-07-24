import '../models/training_session.dart';

abstract interface class AIService {
  Future<String> chat(String message);

  Future<TrainingAnalysis> analyzeTraining(TrainingSession session);
}

class TrainingAnalysis {
  const TrainingAnalysis({
    required this.summary,
    required this.suggestions,
  });

  final String summary;
  final List<String> suggestions;
}

class StubAIService implements AIService {
  @override
  Future<TrainingAnalysis> analyzeTraining(TrainingSession session) async {
    return const TrainingAnalysis(
      summary: 'AI 训练分析将在后续版本开放。',
      suggestions: <String>[],
    );
  }

  @override
  Future<String> chat(String message) async => 'AI 教练将在后续版本开放。';
}
