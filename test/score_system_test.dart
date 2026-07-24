import 'package:flutter_test/flutter_test.dart';
import 'package:pelvic_core_demo/services/score_system.dart';

void main() {
  test('awards ten experience and one combo per completed round', () {
    final score = ScoreSystem();

    expect(score.experienceForRounds(3), 30);
    expect(score.comboForRounds(3), 3);
  });
}
