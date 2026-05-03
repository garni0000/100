/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  BarChart3, 
  Target, 
  LayoutDashboard, 
  X,
  TrendingUp,
  Download,
  Calendar,
  MousePointer2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
} from 'recharts';
import { Stats, UserCategory, Lead } from '../types';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AdminDashboardProps {
  stats: Stats;
  onClose: () => void;
  onClearStats: () => void;
}

export default function AdminDashboard({ stats, onClose, onClearStats }: AdminDashboardProps) {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const leads = snapshot.docs.map(doc => ({
        ...doc.data(),
        // Convert Firestore timestamp to number if it exists
        timestamp: doc.data().timestamp?.toMillis?.() || Date.now()
      })) as Lead[];
      setRecentLeads(leads);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });
    return unsub;
  }, []);

  const chartData = [
    { name: 'VIP', value: stats.vipCount, color: '#f59e0b' },
    { name: 'Standard', value: stats.standardCount, color: '#10b981' },
    { name: 'Faible Valeur', value: stats.lowValueCount, color: '#52525b' },
  ].filter(d => d.value > 0);

  const conversionRate = stats.totalUsers > 0 
    ? Math.round(((stats.vipCount + stats.standardCount) / stats.totalUsers) * 100) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#050505] overflow-y-auto"
    >
      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/10 rounded-lg">
                <LayoutDashboard className="text-brand-primary w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">OPERATIONS PANEL</h1>
            </div>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
              Central Intelligence & Performance Tracking
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onClearStats}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 font-semibold transition-all border border-zinc-800"
            >
              Réinitialiser
            </button>
            <button 
              onClick={onClose}
              className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Top Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Inscriptions Totales" value={stats.totalUsers} icon={Users} color="text-white" />
          <StatCard label="Taux de Qualification" value={`${conversionRate}%`} icon={Target} color="text-brand-primary" />
          <StatCard label="Nouveaux VIP" value={stats.vipCount} icon={Crown} color="text-brand-secondary" />
          <StatCard label="Clics Sortants" value={stats.conversions} icon={MousePointer2} color="text-brand-accent" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Distribution Chart */}
          <div className="lg:col-span-2 glass-card p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-brand-primary w-5 h-5" />
                Distribution des Segments
              </h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-secondary" />
                   <span className="text-[10px] text-zinc-500 uppercase font-mono">VIP</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-primary" />
                   <span className="text-[10px] text-zinc-500 uppercase font-mono">Standard</span>
                 </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 italic">
                  Aucune donnée disponible pour le graphique
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
               <MetricSmall label="Moy. Potentiel" value="74%" />
               <MetricSmall label="Indice Discipline" value="62%" />
               <MetricSmall label="Rétention Est." value="88%" />
            </div>
          </div>

          {/* Performance Card */}
          <div className="glass-card p-8 bg-brand-primary/5 border-brand-primary/20 space-y-6 flex flex-col justify-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="text-brand-primary w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Growth Optimization</h3>
              <p className="text-sm text-zinc-400">Analyse de conversion automatique activée. Le système segmente 100% des leads entrants.</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <p className="text-[10px] uppercase font-mono text-zinc-500 mb-1">Target VIP Conversion</p>
                <div className="flex items-center gap-4">
                   <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-secondary w-[65%]" />
                   </div>
                   <span className="text-sm font-bold text-brand-secondary">65%</span>
                </div>
              </div>
              <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-brand-primary transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Leads Récents</h3>
              <p className="text-xs text-zinc-500">Dernières qualifications traitées par l'IA</p>
            </div>
            <Calendar className="text-zinc-700 w-5 h-5" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 text-[10px] uppercase font-mono tracking-widest text-zinc-500 border-b border-zinc-800">
                  <th className="px-8 py-4">ID User</th>
                  <th className="px-8 py-4">Catégorie</th>
                  <th className="px-8 py-4">Potentiel</th>
                  <th className="px-8 py-4">Score Financier</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentLeads && recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-8 py-4 font-mono text-xs text-zinc-400">#{lead.id}</td>
                      <td className="px-8 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          lead.analysis.userCategory === UserCategory.VIP 
                            ? 'bg-brand-secondary/10 text-brand-secondary' 
                            : 'bg-brand-primary/10 text-brand-primary'
                        }`}>
                          {lead.analysis.userCategory}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                         <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-primary" style={{ width: `${lead.analysis.potentialScore}%` }} />
                            </div>
                            <span className="text-xs font-bold text-white">{lead.analysis.potentialScore}%</span>
                         </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-semibold text-zinc-300">{lead.analysis.financialScore}/100</span>
                      </td>
                      <td className="px-8 py-4 text-xs text-zinc-500">
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4">
                        <button className="text-brand-primary hover:underline text-xs font-bold uppercase tracking-widest">Detail</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-zinc-600 italic">
                      Aucun lead récent détecté.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className={`p-3 bg-zinc-900 border border-zinc-800 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-brand-primary font-mono bg-brand-primary/5 px-2 py-0.5 rounded">
           <TrendingUp className="w-3 h-3" />
           +12%
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function MetricSmall({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 mb-1">{label}</p>
      <p className="text-lg font-bold text-zinc-200">{value}</p>
    </div>
  );
}
