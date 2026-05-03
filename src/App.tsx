/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  BarChart3,
  Users,
  Crown,
  BookOpen,
  ArrowRight,
  RefreshCcw,
  LayoutDashboard,
  BrainCircuit,
  LogIn,
  LogOut,
  Wallet
} from 'lucide-react';
import { QUESTIONS } from './constants';
import { analyzeProfile } from './analysisEngine';
import { 
  QuestionnaireAnswers, 
  ProfileAnalysis, 
  UserCategory, 
  Stats
} from './types';
import AdminDashboard from './components/AdminDashboard';
import { db, auth, loginWithGoogle } from './lib/firebase';
import { connectMetaMask } from './lib/wallet';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  runTransaction, 
  serverTimestamp,
  collection
} from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ProfileAnalysis | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    vipCount: 0,
    standardCount: 0,
    lowValueCount: 0,
    conversions: 0,
    recentLeads: []
  });

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  // Real-time Stats Listener
  useEffect(() => {
    const statsDocRef = doc(db, 'metadata', 'stats');
    const unsub = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers || 0,
          vipCount: data.vipCount || 0,
          standardCount: data.standardCount || 0,
          lowValueCount: data.lowValueCount || 0,
          conversions: data.conversions || 0
        }));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'metadata/stats');
    });
    return unsub;
  }, []);

  const updateStatsAndSaveLead = async (vCategory: UserCategory, analysis: ProfileAnalysis, finalAnswers: QuestionnaireAnswers) => {
    const leadId = Math.random().toString(16).slice(2, 8).toUpperCase();
    const leadRef = doc(collection(db, 'leads'), leadId);
    const statsRef = doc(db, 'metadata', 'stats');

    try {
      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsRef);
        let currentStats = {
          totalUsers: 0,
          vipCount: 0,
          standardCount: 0,
          lowValueCount: 0,
          conversions: 0
        };

        if (statsDoc.exists()) {
          currentStats = statsDoc.data() as any;
        }

        // 1. Update Stats
        const newStats = {
          ...currentStats,
          totalUsers: (currentStats.totalUsers || 0) + 1,
          vipCount: (currentStats.vipCount || 0) + (vCategory === UserCategory.VIP ? 1 : 0),
          standardCount: (currentStats.standardCount || 0) + (vCategory === UserCategory.STANDARD ? 1 : 0),
          lowValueCount: (currentStats.lowValueCount || 0) + (vCategory === UserCategory.LOW_VALUE ? 1 : 0),
        };

        transaction.set(statsRef, newStats, { merge: true });

        // 2. Save Lead
        transaction.set(leadRef, {
          id: leadId,
          timestamp: serverTimestamp(),
          answers: finalAnswers,
          analysis: analysis
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'leads/stats-transaction');
    }
  };

  const handleClearStats = async () => {
    const statsRef = doc(db, 'metadata', 'stats');
    try {
      await setDoc(statsRef, {
        totalUsers: 0,
        vipCount: 0,
        standardCount: 0,
        lowValueCount: 0,
        conversions: 0
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'metadata/stats');
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setWalletAddress(null);
      setShowAdmin(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleMetaMaskLogin = async () => {
    try {
      setError(null);
      const address = await connectMetaMask();
      setWalletAddress(address);
    } catch (err: any) {
      setError(err.message || "Failed to connect to MetaMask");
      console.error(err);
    }
  };

  const isAdmin = user?.email === 'eurahttps.gg@gmail.com';

  const handleAnswer = (value: any) => {
    const currentQuestionId = QUESTIONS[step].id;
    const newAnswers = { ...answers, [currentQuestionId]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      startAnalysis(newAnswers as QuestionnaireAnswers);
    }
  };

  const startAnalysis = async (finalAnswers: QuestionnaireAnswers) => {
    setIsAnalyzing(true);
    // Simulate complex AI analysis
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    const analysis = analyzeProfile(finalAnswers);
    setResult(analysis);
    setIsAnalyzing(false);
    updateStatsAndSaveLead(analysis.userCategory, analysis, finalAnswers);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setIsAnalyzing(false);
  };

  if (showAdmin) {
    return (
      <AdminDashboard 
        stats={stats} 
        onClose={() => setShowAdmin(false)} 
        onClearStats={handleClearStats}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden premium-gradient">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <header className="p-6 md:p-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <TrendingUp className="text-black w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">
              Bettor<span className="text-brand-primary">Qualify</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">AI Analytic Engine 2.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => setShowAdmin(true)}
              className="text-brand-primary hover:bg-brand-primary/10 transition-colors p-2 rounded-xl flex items-center gap-2 border border-brand-primary/20"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Admin Dashboard</span>
            </button>
          )}

          {(user || walletAddress) ? (
            <div className="flex items-center gap-3">
              {walletAddress && (
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Wallet Active</span>
                  <span className="text-xs font-bold text-brand-primary">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-500 transition-colors p-2 rounded-xl flex items-center gap-2"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Sortir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleMetaMaskLogin}
                className="text-zinc-500 hover:text-brand-primary transition-all p-2 rounded-xl flex items-center gap-2 group"
                title="Connect MetaMask"
              >
                <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Wallet</span>
              </button>
              <button 
                onClick={handleLogin}
                className="text-white bg-zinc-900 hover:bg-zinc-800 transition-all px-4 py-2 rounded-xl flex items-center gap-2 border border-zinc-800"
              >
                <LogIn className="w-4 h-4 text-brand-primary" />
                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 backdrop-blur-md"
          >
            <ShieldCheck className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)} className="ml-2 hover:opacity-70">×</button>
          </motion.div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 pb-20 relative z-10 min-h-[70vh] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isAnalyzing && !result && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  <span>Analyse du profil parieur</span>
                  <span>Etape {step + 1} sur {QUESTIONS.length}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-brand-primary glow-emerald"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-brand-primary font-mono text-xs uppercase tracking-widest">Question {step + 1}</span>
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                    {QUESTIONS[step].question}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {QUESTIONS[step].options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswer(option.value)}
                      className="group relative p-6 text-left glass-card hover:bg-zinc-800/40 hover:border-brand-primary/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="block text-lg font-semibold text-zinc-100 group-hover:text-brand-primary transition-colors">
                            {option.label}
                          </span>
                          {/* @ts-ignore */}
                          {option.description && (
                             // @ts-ignore
                            <p className="text-sm text-zinc-500">{option.description}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.button>
                  ))}
                </div>

                {step > 0 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mt-8"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-12 py-20"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 border-2 border-dashed border-brand-primary/20 rounded-full flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 border-2 border-dashed border-brand-secondary/20 rounded-full"
                  />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-16 h-16 text-brand-primary animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-white">Analyse IA en cours...</h3>
                <div className="flex flex-col items-center space-y-2">
                  <AnalysisLoaderText />
                  <p className="text-zinc-500 text-sm max-w-sm">
                    Calcul des indicateurs de performance, de discipline et de risque financier.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      result.userCategory === UserCategory.VIP 
                        ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' 
                        : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                    }`}>
                      {result.userCategory === UserCategory.VIP ? 'Elite VIP Member' : 'Qualified Member'}
                    </span>
                    <span className="text-zinc-500 font-mono text-[10px]">ID: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                    VOTRE <span className="text-brand-primary">DIAGNOSTIC</span>
                  </h2>
                </div>
                
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-zinc-500 hover:text-brand-primary transition-colors text-sm"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Remplir à nouveau
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                 {/* Main Score Card */}
                <div className="md:col-span-2 glass-card p-8 border-l-4 border-l-brand-primary relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-32 h-32" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-brand-primary" />
                        Analyse Psychologique
                      </h3>
                      <p className="text-2xl md:text-3xl font-semibold text-white leading-snug">
                        {result.psychologicalProfile}
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-zinc-800">
                      <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Indicateurs Clés</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <ScoreIndicator label="Potentiel de Croissance" value={result.potentialScore} />
                        <ScoreIndicator label="Indice de Discipline" value={result.disciplineScore} color="amber" />
                        <ScoreIndicator label="Puissance Financière" value={result.financialScore} color="brand-accent" />
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Niveau de Risque</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${
                              result.riskLevel === 'Low' ? 'text-emerald-400' :
                              result.riskLevel === 'Moderate' ? 'text-amber-400' :
                              result.riskLevel === 'High' ? 'text-orange-400' : 'text-red-500'
                            }`}>
                              {result.riskLevel}
                            </span>
                            <ShieldCheck className={`w-5 h-5 ${
                              result.riskLevel === 'Low' ? 'text-emerald-400' : 'text-zinc-600'
                            }`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation & CTA */}
                <div className="space-y-6">
                  <div className={`glass-card p-8 border ${
                    result.userCategory === UserCategory.VIP ? 'border-brand-secondary/50 glow-amber' : 'border-zinc-800'
                  }`}>
                    <div className="space-y-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
                        {result.userCategory === UserCategory.VIP ? (
                          <Crown className="w-8 h-8 text-brand-secondary" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-brand-primary" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">
                          {result.userCategory === UserCategory.VIP 
                            ? 'ACCÈS VIP DÉBLOQUÉ' 
                            : 'ACCÈS STANDARD'
                          }
                        </h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                          {result.recommendation}
                        </p>
                      </div>

                      <a 
                        href="#" 
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all duration-300 ${
                          result.userCategory === UserCategory.VIP
                            ? 'bg-brand-secondary text-black hover:scale-[1.02] shadow-xl shadow-brand-secondary/20'
                            : 'bg-white text-black hover:bg-brand-primary hover:text-black transition-colors'
                        }`}
                      >
                        {result.userCategory === UserCategory.VIP ? 'Rejoindre le Cercle Privé' : 'Accéder au Contenu'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>

                  <div className="glass-card p-6 border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <Zap className="w-8 h-8 text-brand-primary shrink-0" />
                      <div className="space-y-0.5">
                        <p className="text-xs uppercase font-mono tracking-widest text-zinc-500">Expertise</p>
                        <p className="text-sm font-semibold text-zinc-100">Algorithme de détection comportementale.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-end pointer-events-none z-50">
        <div className="text-zinc-600 font-mono text-[8px] uppercase tracking-widest">
          Analytic Protocol 4.12 // SECURED
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 group cursor-help">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] text-zinc-500 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Server Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScoreIndicator({ label, value, color = "emerald" }: { label: string, value: number, color?: string }) {
  const colorMap: Record<string, string> = {
    'emerald': 'bg-brand-primary',
    'amber': 'bg-brand-secondary',
    'brand-accent': 'bg-brand-accent',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">{label}</span>
        <span className="text-lg font-bold text-white">{value}%</span>
      </div>
      <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${colorMap[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </div>
  );
}

function AnalysisLoaderText() {
  const [text, setText] = useState("Scan des patterns émotionnels...");
  const texts = [
    "Scan des patterns émotionnels...",
    "ÉVALUATION DES MARGES FINANCIÈRES...",
    "DÉTECTION DE LA DISCIPLINE DE MISE...",
    "CALCUL DE LA VALEUR À LONG TERME...",
    "VALIDATION DU PROFIL VIP..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setText(texts[i]);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-brand-primary font-mono text-xs uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/20">
      {text}
    </p>
  );
}


