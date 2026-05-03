/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum StakeLevel {
  LOW = 'low', // <5$
  MEDIUM = 'medium', // 5-20$
  HIGH = 'high', // 20-50$
  WHALE = 'whale', // 50$+
}

export enum FinancialGoal {
  COMPLEMENTARY = 'complementary',
  QUICK_GAINS = 'quick_gains',
  PROFESSIONAL = 'professional',
  MOONSHOT = 'moonshot',
}

export enum ProfitabilityStatus {
  HEAVY_LOSS = 'heavy_loss',
  STABLE = 'stable',
  LIGHT_PROFIT = 'light_profit',
  HEAVY_PROFIT = 'heavy_profit',
}

export enum UserCategory {
  VIP = 'vip',
  STANDARD = 'standard',
  LOW_VALUE = 'low_value',
}

export interface QuestionnaireAnswers {
  experience: ExperienceLevel;
  averageStake: StakeLevel;
  goal: FinancialGoal;
  maxWin: string;
  profitability: ProfitabilityStatus;
}

export interface ProfileAnalysis {
  userCategory: UserCategory;
  potentialScore: number; // 0-100
  disciplineScore: number; // 0-100
  financialScore: number; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  psychologicalProfile: string;
  recommendation: string;
}

export interface Lead {
  id: string;
  timestamp: number;
  answers: QuestionnaireAnswers;
  analysis: ProfileAnalysis;
}

export interface Stats {
  totalUsers: number;
  vipCount: number;
  standardCount: number;
  lowValueCount: number;
  conversions: number;
  recentLeads: Lead[];
}
