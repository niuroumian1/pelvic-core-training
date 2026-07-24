import 'package:flutter/material.dart';

abstract final class AppColors {
  static const background = Color(0xFF050A12);
  static const surface = Color(0xFF0C1522);
  static const surfaceHigh = Color(0xFF132235);
  static const cyan = Color(0xFF35D9FF);
  static const blue = Color(0xFF337CFF);
  static const green = Color(0xFF62F5B2);
  static const textPrimary = Color(0xFFF2F7FF);
  static const textSecondary = Color(0xFF8EA3BB);
}

abstract final class AppTheme {
  static ThemeData get dark => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.cyan,
          secondary: AppColors.blue,
          surface: AppColors.surface,
        ),
        fontFamily: 'sans-serif',
        textTheme: const TextTheme(
          displaySmall: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w700,
            letterSpacing: -1,
          ),
          headlineMedium: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
          ),
          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          bodyLarge: TextStyle(fontSize: 16, height: 1.5),
        ),
        useMaterial3: true,
      );
}
