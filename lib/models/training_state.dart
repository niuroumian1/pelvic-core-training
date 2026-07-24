enum TrainingState {
  idle,
  ready,
  contract,
  hold,
  relax,
  roundSuccess,
  complete,
}

extension TrainingStateCopy on TrainingState {
  String get title => switch (this) {
        TrainingState.idle => '待机',
        TrainingState.ready => '准备',
        TrainingState.contract => '收缩',
        TrainingState.hold => '保持',
        TrainingState.relax => '放松',
        TrainingState.roundSuccess => '本组完成',
        TrainingState.complete => '训练完成',
      };

  String get guidance => switch (this) {
        TrainingState.idle => '调整呼吸，准备开始',
        TrainingState.ready => '集中注意力',
        TrainingState.contract => '缓慢向上收紧核心',
        TrainingState.hold => '稳定输出',
        TrainingState.relax => '完全释放，恢复呼吸',
        TrainingState.roundSuccess => '很好，准备下一组',
        TrainingState.complete => '今日核心训练已完成',
      };
}
