class ScoreSystem {
  static const experiencePerRound = 10;

  int experienceForRounds(int rounds) => rounds * experiencePerRound;

  int comboForRounds(int rounds) => rounds.clamp(0, 99);
}
