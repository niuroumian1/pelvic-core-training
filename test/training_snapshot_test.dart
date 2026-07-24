import 'package:flutter_test/flutter_test.dart';
import 'package:pelvic_core_demo/models/training_snapshot.dart';
import 'package:pelvic_core_demo/models/training_state.dart';

void main() {
  test('display seconds rounds up for human countdown', () {
    const snapshot = TrainingSnapshot(
      state: TrainingState.contract,
      round: 1,
      totalRounds: 3,
      remaining: Duration(milliseconds: 4001),
      phaseProgress: .2,
      experience: 0,
      combo: 0,
    );

    expect(snapshot.displaySeconds, 5);
  });
}
