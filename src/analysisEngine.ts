/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  QuestionnaireAnswers, 
  ProfileAnalysis, 
  UserCategory, 
  ExperienceLevel, 
  StakeLevel, 
  FinancialGoal, 
  ProfitabilityStatus 
} from './types';

export function analyzeProfile(answers: QuestionnaireAnswers): ProfileAnalysis {
  let financialScore = 0;
  let disciplineScore = 0;
  let potentialScore = 0;

  // 1. Financial Scoring (Basé sur la mise moyenne et les gains max)
  switch (answers.averageStake) {
    case StakeLevel.LOW: financialScore += 20; break;
    case StakeLevel.MEDIUM: financialScore += 50; break;
    case StakeLevel.HIGH: financialScore += 80; break;
    case StakeLevel.WHALE: financialScore += 100; break;
  }

  const maxWinVal = parseInt(answers.maxWin);
  if (maxWinVal >= 10000) financialScore = Math.min(100, financialScore + 20);
  else if (maxWinVal >= 1000) financialScore = Math.min(100, financialScore + 10);

  // 2. Discipline Scoring (Basé sur l'expérience, la rentabilité et les objectifs)
  switch (answers.experience) {
    case ExperienceLevel.BEGINNER: disciplineScore += 30; break;
    case ExperienceLevel.INTERMEDIATE: disciplineScore += 60; break;
    case ExperienceLevel.ADVANCED: disciplineScore += 90; break;
  }

  switch (answers.profitability) {
    case ProfitabilityStatus.HEAVY_LOSS: disciplineScore -= 20; break;
    case ProfitabilityStatus.STABLE: disciplineScore += 10; break;
    case ProfitabilityStatus.LIGHT_PROFIT: disciplineScore += 20; break;
    case ProfitabilityStatus.HEAVY_PROFIT: disciplineScore += 30; break;
  }
  
  disciplineScore = Math.max(0, Math.min(100, disciplineScore));

  // 3. Potential Scoring
  potentialScore = (financialScore * 0.4) + (disciplineScore * 0.3);
  if (answers.goal === FinancialGoal.PROFESSIONAL) potentialScore += 30;
  if (answers.goal === FinancialGoal.MOONSHOT) potentialScore -= 10; // High risk behavior
  
  potentialScore = Math.max(0, Math.min(100, potentialScore));

  // 4. Determine Category
  let userCategory: UserCategory = UserCategory.LOW_VALUE;
  if (financialScore >= 70 && disciplineScore >= 50) {
    userCategory = UserCategory.VIP;
  } else if (financialScore >= 40 || disciplineScore >= 40) {
    userCategory = UserCategory.STANDARD;
  }

  // 5. Risk Level
  let riskLevel: ProfileAnalysis['riskLevel'] = 'Moderate';
  if (answers.goal === FinancialGoal.MOONSHOT || answers.profitability === ProfitabilityStatus.HEAVY_LOSS) {
    riskLevel = 'High';
  }
  if (answers.averageStake === StakeLevel.WHALE && answers.profitability === ProfitabilityStatus.HEAVY_LOSS) {
    riskLevel = 'Extreme';
  }
  if (disciplineScore > 80 && answers.profitability !== ProfitabilityStatus.HEAVY_LOSS) {
    riskLevel = 'Low';
  }

  // 6. Psychological Profile
  let psychProfile = "Parieur en phase d'apprentissage";
  if (answers.profitability === ProfitabilityStatus.HEAVY_LOSS) psychProfile = "Parieur impulsif / en difficulté";
  else if (answers.experience === ExperienceLevel.ADVANCED && answers.profitability === ProfitabilityStatus.HEAVY_PROFIT) psychProfile = "Investisseur Discipliné & Rentable";
  else if (answers.goal === FinancialGoal.MOONSHOT) psychProfile = "Profiler 'Loterie' (Recherche de gros gains)";
  else if (userCategory === UserCategory.VIP) psychProfile = "Profil à Haut Potentiel VIP";

  // 7. Recommendation
  let recommendation = "Focalisez-vous sur la gestion de bankroll et le contenu éducatif.";
  if (userCategory === UserCategory.VIP) recommendation = "Accès prioritaire recommandé. Votre profil correspond à nos standards institutionnels.";
  else if (userCategory === UserCategory.STANDARD) recommendation = "Continuez à progresser. Accès au canal standard recommandé.";

  return {
    userCategory,
    potentialScore: Math.round(potentialScore),
    disciplineScore: Math.round(disciplineScore),
    financialScore: Math.round(financialScore),
    riskLevel,
    psychologicalProfile: psychProfile,
    recommendation
  };
}
