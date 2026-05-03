/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExperienceLevel, StakeLevel, FinancialGoal, ProfitabilityStatus } from './types';

export const QUESTIONS = [
  {
    id: 'experience',
    question: 'Depuis combien de temps paries-tu ?',
    options: [
      { label: 'Débutant', value: ExperienceLevel.BEGINNER, description: 'Je découvre les bases' },
      { label: 'Intermédiaire', value: ExperienceLevel.INTERMEDIATE, description: 'Je parie régulièrement' },
      { label: 'Avancé / Pro', value: ExperienceLevel.ADVANCED, description: 'C\'est mon activité principale' },
    ],
  },
  {
    id: 'averageStake',
    question: 'Combien mises-tu en moyenne par jour ?',
    options: [
      { label: 'Moins de 5$', value: StakeLevel.LOW },
      { label: '5$ à 20$', value: StakeLevel.MEDIUM },
      { label: '20$ à 50$', value: StakeLevel.HIGH },
      { label: '50$+', value: StakeLevel.WHALE },
    ],
  },
  {
    id: 'goal',
    question: 'Quel est ton objectif principal ?',
    options: [
      { label: 'Gagner un revenu complémentaire', value: FinancialGoal.COMPLEMENTARY },
      { label: 'Faire quelques gains rapides', value: FinancialGoal.QUICK_GAINS },
      { label: 'Vivre des paris sportifs', value: FinancialGoal.PROFESSIONAL },
      { label: 'Transformer un petit budget en gros gains', value: FinancialGoal.MOONSHOT },
    ],
  },
  {
    id: 'maxWin',
    question: 'As-tu déjà gagné plus de :',
    options: [
      { label: 'Jamais', value: '0' },
      { label: '100$', value: '100' },
      { label: '1 000$', value: '1000' },
      { label: '10 000$', value: '10000' },
    ],
  },
  {
    id: 'profitability',
    question: 'Actuellement, comment qualifierais-tu tes résultats ?',
    options: [
      { label: 'En grosse perte', value: ProfitabilityStatus.HEAVY_LOSS },
      { label: 'Stable', value: ProfitabilityStatus.STABLE },
      { label: 'Légèrement rentable', value: ProfitabilityStatus.LIGHT_PROFIT },
      { label: 'Très rentable', value: ProfitabilityStatus.HEAVY_PROFIT },
    ],
  },
];
