import 'package:flutter/widgets.dart';

import '../models/training_snapshot.dart';

abstract interface class TrainingScene {
  Widget build(BuildContext context, TrainingSnapshot snapshot);
}
