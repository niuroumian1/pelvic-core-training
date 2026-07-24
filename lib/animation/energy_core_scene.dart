import 'package:flutter/widgets.dart';

import '../models/training_snapshot.dart';
import '../widgets/energy_core.dart';
import 'training_scene.dart';

class EnergyCoreScene implements TrainingScene {
  const EnergyCoreScene();

  @override
  Widget build(BuildContext context, TrainingSnapshot snapshot) {
    return EnergyCore(snapshot: snapshot);
  }
}
