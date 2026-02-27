import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar as CalendarIcon, Clock, Users, Euro, CheckCircle2, AlertCircle, ChevronRight, LayoutDashboard, Stethoscope, HeartPulse } from 'lucide-react';
import { Shift, Industry, City } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function VenueDashboard({ industry, city }: { industry: Industry, city: City }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shifts'>('dashboard');

  useEffect(() => {
    fetchShifts();
  }, [industry, city]);

  const fetchShifts = async (retries = 3) => {
    try {
      const res = await fetch(`/api/shifts?industry=${industry}&city=${city}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setShifts(data);
    } catch (error) {
      console.error('Fetch shifts failed:', error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} left)`);
        setTimeout(() => fetchShifts(retries - 1), 1000);
      }
    }
  };

  const handlePostShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newShift = {
      venueName: industry === 'hospitality' ? "Tvoj Lokal" : "Tvoja Ustanova",
      venueAvatar: industry === 'hospitality' ? "https://picsum.photos/seed/myvenue/100/100" : "https://picsum.photos/seed/myhospital/100/100",
      distance: "0 km",
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      role: formData.get('role'),
      department: formData.get('department'),
      pay: Number(formData.get('pay')),
      industry: industry,
      city: city
    };

    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShift),
    });

    if (res.ok) {
      setIsPostModalOpen(false);
      fetchShifts();
    }
  };

  const handleApprove = async (id: string) => {
    const res = await fetch(`/api/shifts/${id}/approve`, { method: 'POST' });
    if (res.ok) fetchShifts();
  };

  const openShifts = shifts.filter(s => s.status === 'open');
  const pendingShifts = shifts.filter(s => s.status === 'pending');
  const bookedShifts = shifts.filter(s => s.status === 'booked');

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{city} • {industry === 'hospitality' ? 'Ugostiteljstvo' : 'Zdravstvo'}</p>
            <h1 className="text-xl font-bold text-primary">Upravljanje</h1>
          </div>
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="bg-primary text-white p-2.5 rounded-xl shadow-sm hover:bg-primary-light transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Otvorene" 
            value={openShifts.length} 
            icon={<Users className="w-5 h-5 text-primary" />}
            color="bg-slate-100"
          />
          <StatCard 
            label="Na čekanju" 
            value={pendingShifts.length} 
            icon={<AlertCircle className="w-5 h-5 text-warning" />}
            color="bg-slate-100"
          />
        </div>

        {/* Pending Applicants Section */}
        {pendingShifts.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nove prijave</h2>
              <span className="bg-warning/10 text-warning text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {pendingShifts.length} hitno
              </span>
            </div>
            <div className="space-y-3">
              {pendingShifts.map(shift => (
                <div key={shift.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{shift.role}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {shift.department && <span className="text-primary-light font-bold">{shift.department} • </span>}
                        {format(new Date(shift.date), 'dd.MM.')} • {shift.startTime}-{shift.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-300 uppercase">Prijava od:</p>
                      <p className="text-xs font-bold text-slate-700">Marko J.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(shift.id)}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold hover:bg-primary-light transition-colors"
                    >
                      Prihvati
                    </button>
                    <button className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                      Odbij
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Shifts List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sve smene</h2>
            <span className="text-[10px] font-bold text-slate-400">{shifts.length} ukupno</span>
          </div>
          <div className="space-y-2">
            {shifts.length > 0 ? (
              shifts.map(shift => (
                <div key={shift.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-primary/20 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      shift.status === 'booked' ? "bg-success/10 text-success" : 
                      shift.status === 'pending' ? "bg-warning/10 text-warning" : "bg-slate-100 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary"
                    )}>
                      {shift.status === 'booked' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{shift.role}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {shift.department && <span className="text-primary-light font-bold">{shift.department} • </span>}
                        {format(new Date(shift.date), 'dd.MM.')} • {shift.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">{shift.pay}€</p>
                    <p className={cn(
                      "text-[8px] font-bold uppercase tracking-wider",
                      shift.status === 'booked' ? "text-success" : 
                      shift.status === 'pending' ? "text-warning" : "text-slate-300"
                    )}>
                      {shift.status === 'booked' ? 'Popunjeno' : shift.status === 'pending' ? 'Prijava' : 'Otvoreno'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-400 text-sm">Još uvek niste objavili nijednu smenu.</p>
                <button 
                  onClick={() => setIsPostModalOpen(true)}
                  className="mt-4 text-primary text-xs font-bold uppercase tracking-wider hover:underline"
                >
                  Objavi prvu smenu
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Post Shift Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-8 shadow-2xl border-t border-slate-100">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-800 mb-6">Objavi novu smenu</h3>
              <form onSubmit={handlePostShift} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datum</label>
                    <input name="date" type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pozicija</label>
                    <select name="role" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                      {industry === 'hospitality' ? (
                        <>
                          <option>Konobar</option>
                          <option>Šanker</option>
                          <option>Barista</option>
                          <option>Pomoćni radnik</option>
                          <option>Kuvar</option>
                          <option>Hostesa</option>
                        </>
                      ) : (
                        <>
                          <option>Medicinska sestra</option>
                          <option>Tehničar</option>
                          <option>Laborant</option>
                          <option>Fizioterapeut</option>
                          <option>Instrumentarka</option>
                          <option>Bolničar</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                {industry === 'healthcare' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ustanova i Odeljenje</label>
                    <select name="department" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                      <optgroup label="VMA">
                        <option>VMA - Neurologija</option>
                        <option>VMA - Traumatologija</option>
                        <option>VMA - Ortopedija</option>
                        <option>VMA - Nefrologija</option>
                      </optgroup>
                      <optgroup label="KBC Bežanijska kosa">
                        <option>KBC BK - Intezivna nega</option>
                        <option>KBC BK - Reumatologija</option>
                        <option>KBC BK - Fizikalna</option>
                        <option>KBC BK - Transfuzija</option>
                      </optgroup>
                      <optgroup label="Klinički centar">
                        <option>KC - Ortopedija</option>
                        <option>KC - Infektivna</option>
                        <option>KC - Hitna</option>
                      </optgroup>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Početak</label>
                    <input name="startTime" type="time" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kraj</label>
                    <input name="endTime" type="time" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dnevnica (€)</label>
                  <input name="pay" type="number" required placeholder="Npr. 35" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-primary-light transition-all mt-4">
                  Objavi smenu
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-3 flex justify-between items-center z-30 shadow-lg">
        <NavIcon icon={<LayoutDashboard className="w-5 h-5" />} label="Pregled" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavIcon icon={<CalendarIcon className="w-5 h-5" />} label="Smene" active={activeTab === 'shifts'} onClick={() => setActiveTab('shifts')} />
        <NavIcon icon={<Users className="w-5 h-5" />} label="Radnici" />
      </nav>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", color)}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

function NavIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 transition-colors", active ? "text-primary" : "text-slate-400")}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && <motion.div layoutId="nav-dot-venue" className="w-1 h-1 bg-primary rounded-full" />}
    </button>
  );
}
