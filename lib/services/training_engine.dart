import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/training_snapshot.dart';
import '../models/training_state.dart';
import 'score_system.dart';

class TrainingEngine extends ChangeNotifier {
  TrainingEngine({
    this.totalRounds = 3,
    this.tickInterval = const Duration(milliseconds: 50),
    ScoreSystem? scoreSystem,
  }) : _scoreSystem = scoreSystem ?? ScoreSystem();

  static const phaseDurations = <TrainingState, Duration>{
    TrainingState.ready: Duration(seconds: 3),
    TrainingState.contract: Duration(seconds: 5),
    TrainingState.hold: Duration(seconds: 3),
    TrainingState.relax: Duration(seconds: 5),
    TrainingState.roundSuccess: Duration(milliseconds: 1400),
  };

  final int totalRounds;
  final Duration tickInterval;
  final ScoreSystem _scoreSystem;

  Timer? _timer;
  DateTime? _phaseStartedAt;
  TrainingState _state = TrainingState.idle;
  int _round = 1;
  int _completedRounds = 0;
  double _progress = 0;
  Duration _remaining = Duration.zero;

  TrainingState get state => _state;
  bool get isRunning =>
      _state != TrainingState.idle && _state != TrainingState.complete;

  TrainingSnapshot get snapshot => TrainingSnapshot(
        state: _state,
        round: _round,
        totalRounds: totalRounds,
        remaining: _remaining,
        phaseProgress: _progress,
        experience: _scoreSystem.experienceForRounds(_completedRounds),
        combo: _scoreSystem.comboForRounds(_completedRounds),
      );

  void start() {
    if (isRunning) return;
    _round = 1;
    _completedRounds = 0;
    _enter(TrainingState.ready);
    _timer?.cancel();
    _timer = Timer.periodic(tickInterval, (_) => _tick(DateTime.now()));
  }

  void _tick(DateTime now) {
    final duration = phaseDurations[_state];
    if (duration == null || _phaseStartedAt == null) return;
    final elapsed = now.difference(_phaseStartedAt!);
    _progress = (elapsed.inMicroseconds / duration.inMicroseconds).clamp(0, 1);
    _remaining = duration - elapsed;
    if (_remaining.isNegative) _remaining = Duration.zero;

    if (elapsed >= duration) {
      _advance();
    } else {
      notifyListeners();
    }
  }

  void _advance() {
    switch (_state) {
      case TrainingState.ready:
        _enter(TrainingState.contract);
        return;
      case TrainingState.contract:
        _enter(TrainingState.hold);
        return;
      case TrainingState.hold:
        _enter(TrainingState.relax);
        return;
      case TrainingState.relax:
        _completedRounds++;
        _enter(TrainingState.roundSuccess);
        return;
      case TrainingState.roundSuccess:
        if (_completedRounds >= totalRounds) {
          _timer?.cancel();
          _enter(TrainingState.complete);
        } else {
          _round++;
          _enter(TrainingState.contract);
        }
        return;
      case TrainingState.idle:
      case TrainingState.complete:
        return;
    }
  }

  void _enter(TrainingState next) {
    _state = next;
    _phaseStartedAt = DateTime.now();
    _progress = 0;
    _remaining = phaseDurations[next] ?? Duration.zero;
    notifyListeners();
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _state = TrainingState.idle;
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
