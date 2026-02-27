import React, { useState, useEffect } from 'react';
import WorkerDashboard from './components/WorkerDashboard';
import VenueDashboard from './components/VenueDashboard';
import { UserRole, Industry, City } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Building2, ChevronRight, Stethoscope, HeartPulse, MapPin, User } from 'lucide-react';

export default function App() {
  const [city, setCity] = useState<City | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  if (!city) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase tracking-tighter">POSAO NA DAN</h1>
            <p className="text-slate-500 text-sm">Profesionalna platforma za dnevne smene</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Izaberi grad</p>
            </div>
            <div className="divide-y divide-slate-100">
              {(['Beograd', 'Novi Sad', 'Kragujevac', 'Niš', 'Subotica'] as City[]).map((c) => (
                <button 
                  key={c}
                  onClick={() => setCity(c)}
                  className="w-full p-5 flex items-center justify-between hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-colors shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{c}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-3">
            <button 
              onClick={() => setCity(null)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-primary transition-colors flex items-center gap-1 mx-auto"
            >
              ← Nazad na gradove
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-primary">{city}</h1>
            <p className="text-slate-500 text-sm">Izaberi sektor rada</p>
          </div>

          <div className="grid gap-4">
            <SelectionCard 
              title="Ugostiteljstvo" 
              description="HORECA sektor - restorani, kafići, hoteli."
              icon={<Briefcase className="w-6 h-6 text-primary" />}
              onClick={() => setIndustry('hospitality')}
            />
            <SelectionCard 
              title="Zdravstvo" 
              description="Medicinske ustanove, klinike i bolnice."
              icon={<Stethoscope className="w-6 h-6 text-primary-light" />}
              onClick={() => setIndustry('healthcare')}
            />
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-3">
            <button 
              onClick={() => setIndustry(null)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-primary transition-colors flex items-center gap-1 mx-auto"
            >
              ← Nazad na sektore
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {industry === 'hospitality' ? 'Ugostiteljstvo' : 'Zdravstvo'}
            </h1>
            <p className="text-slate-500 text-sm">{city} • Izaberi ulogu</p>
          </div>

          <div className="grid gap-4">
            <SelectionCard 
              title={industry === 'hospitality' ? "Radnik" : "Medicinski radnik"} 
              description="Pronađi i rezerviši slobodne smene."
              icon={<User className="w-6 h-6 text-primary" />}
              onClick={() => setRole('worker')}
            />
            <SelectionCard 
              title={industry === 'hospitality' ? "Poslodavac" : "Ustanova"} 
              description="Upravljaj smenama i osobljem."
              icon={<Building2 className="w-6 h-6 text-primary" />}
              onClick={() => setRole('venue')}
            />
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AnimatePresence mode="wait">
        {role === 'worker' ? (
          <motion.div
            key="worker"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <WorkerDashboard industry={industry} city={city} />
          </motion.div>
        ) : (
          <motion.div
            key="venue"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <VenueDashboard industry={industry} city={city} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />

      {/* Role Switcher (Hidden in production, useful for demo) */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        <button 
          onClick={() => setRole(role === 'worker' ? 'venue' : 'worker')}
          className="bg-white/50 backdrop-blur-sm p-2 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-sm"
        >
          Promeni ulogu
        </button>
        <button 
          onClick={() => { setIndustry(null); setRole(null); }}
          className="bg-white/50 backdrop-blur-sm p-2 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-sm"
        >
          Promeni sektor
        </button>
        <button 
          onClick={() => { setCity(null); setIndustry(null); setRole(null); }}
          className="bg-white/50 backdrop-blur-sm p-2 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-sm"
        >
          Promeni grad
        </button>
      </div>
    </div>
  );
}

function SelectionCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 sm:gap-6 text-left group transition-all hover:shadow-xl hover:border-primary/20"
    >
      <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl group-hover:bg-primary/5 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-primary transition-colors" />
    </motion.button>
  );
}

function Footer() {
  return (
    <footer className="py-8 text-center">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        Powered by <span className="text-primary">UTvikler</span>
      </p>
    </footer>
  );
}
