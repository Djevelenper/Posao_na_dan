import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar as CalendarIcon, Clock, Users, Euro, CheckCircle2, AlertCircle, ChevronRight, LayoutDashboard, Stethoscope, HeartPulse, Edit2, Trash2, Camera, User, X, Star, Briefcase, Save } from 'lucide-react';
import { Shift, Industry, City } from '../types';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function VenueDashboard({ industry, city, venue }: { industry: Industry, city: City, venue: any }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shifts'>('dashboard');
  const [venueProfile, setVenueProfile] = useState(venue);

  const [editForm, setEditForm] = useState({
    name: venueProfile.name,
    avatar: venueProfile.avatar.startsWith('http') ? venueProfile.avatar : `https://picsum.photos/seed/${venueProfile.avatar}/100/100`
  });

  useEffect(() => {
    fetchShifts();
  }, [industry, city, venue.id]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setVenueProfile(prev => ({ ...prev, name: editForm.name, avatar: editForm.avatar }));
    setIsProfileEditOpen(false);
  };

  const fetchShifts = async (retries = 3) => {
    try {
      const res = await fetch(`/api/shifts?industry=${industry}&city=${city}&venueId=${venue.id}`);
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
    const shiftData = {
      venueId: venue.id,
      venueName: venue.name,
      venueAvatar: venue.avatar.startsWith('http') ? venue.avatar : `https://picsum.photos/seed/${venue.avatar}/100/100`,
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

    const url = editingShift ? `/api/shifts/${editingShift.id}` : '/api/shifts';
    const method = editingShift ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shiftData),
    });

    if (res.ok) {
      setIsPostModalOpen(false);
      setEditingShift(null);
      fetchShifts();
    }
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsPostModalOpen(true);
  };

  const handleDeleteShift = async (id: string) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu smenu?')) {
      const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchShifts();
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
          <div className="flex items-center gap-3">
            <button onClick={() => setIsProfileEditOpen(true)} className="relative group">
              <img src={venueProfile.avatar.startsWith('http') ? venueProfile.avatar : `https://picsum.photos/seed/${venueProfile.avatar}/100/100`} alt={venueProfile.name} className="w-10 h-10 rounded-lg border border-slate-100 object-cover" />
              <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{city} • {venueProfile.name}</p>
              <h1 className="text-xl font-bold text-primary">Upravljanje</h1>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingShift(null);
              setIsPostModalOpen(true);
            }}
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
            badge={pendingShifts.length > 0}
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
                      <button 
                        onClick={() => setSelectedWorker({ name: "Marko J.", avatar: "https://picsum.photos/seed/worker3/200/200", rating: 4.7, completedShifts: 12, profession: industry === 'hospitality' ? 'Konobar' : 'Medicinski tehničar' })}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Marko J.
                      </button>
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
                  <div className="flex items-center gap-4">
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
                    {shift.status === 'open' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditShift(shift)}
                          className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteShift(shift.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-400 text-sm">Još uvek niste objavili nijednu smenu.</p>
                <button 
                  onClick={() => {
                    setEditingShift(null);
                    setIsPostModalOpen(true);
                  }}
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
        {isProfileEditOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileEditOpen(false)} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-8 shadow-2xl border-t border-slate-100">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Uredi profil objekta</h3>
                <button onClick={() => setIsProfileEditOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative group cursor-pointer">
                    <img src={editForm.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-50 shadow-sm" />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Naziv objekta</label>
                  <input 
                    value={editForm.name} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Logotipa</label>
                  <input 
                    value={editForm.avatar} 
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-primary-light transition-all mt-4 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Sačuvaj izmene
                </button>
              </form>
            </motion.div>
          </>
        )}

        {selectedWorker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedWorker(null)} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-4 m-auto w-full max-w-sm h-fit bg-white rounded-[32px] z-50 p-8 shadow-2xl overflow-hidden">
              <div className="text-center">
                <img src={selectedWorker.avatar} alt={selectedWorker.name} className="w-24 h-24 rounded-2xl mx-auto mb-4 border-4 border-slate-50 object-cover shadow-sm" />
                <h3 className="text-xl font-bold text-slate-800">{selectedWorker.name}</h3>
                <p className="text-primary font-bold text-xs uppercase tracking-widest mb-6">{selectedWorker.profession}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{selectedWorker.rating}</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Ocena</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-bold">{selectedWorker.completedShifts}</span>
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Smena</p>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-xs font-bold text-slate-600">Verifikovan profil</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-slate-600">Dostupan odmah</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedWorker(null)}
                  className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  Zatvori
                </button>
              </div>
            </motion.div>
          </>
        )}

        {isPostModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-8 shadow-2xl border-t border-slate-100">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-800 mb-6">{editingShift ? 'Izmeni smenu' : 'Objavi novu smenu'}</h3>
              <form onSubmit={handlePostShift} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Datum</label>
                    <input name="date" type="date" required defaultValue={editingShift?.date ? format(new Date(editingShift.date), 'yyyy-MM-dd') : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pozicija</label>
                    <select name="role" required defaultValue={editingShift?.role || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                      {industry === 'hospitality' ? (
                        <>
                          <option value="Konobar">Konobar</option>
                          <option value="Šanker">Šanker</option>
                          <option value="Barista">Barista</option>
                          <option value="Pomoćni radnik">Pomoćni radnik</option>
                          <option value="Kuvar">Kuvar</option>
                          <option value="Hostesa">Hostesa</option>
                        </>
                      ) : (
                        <>
                          <option value="Medicinska sestra">Medicinska sestra</option>
                          <option value="Tehničar">Tehničar</option>
                          <option value="Laborant">Laborant</option>
                          <option value="Fizioterapeut">Fizioterapeut</option>
                          <option value="Instrumentarka">Instrumentarka</option>
                          <option value="Bolničar">Bolničar</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                {industry === 'healthcare' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ustanova i Odeljenje</label>
                    <select name="department" required defaultValue={editingShift?.department || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none">
                      <optgroup label="VMA">
                        <option value="VMA - Neurologija">VMA - Neurologija</option>
                        <option value="VMA - Traumatologija">VMA - Traumatologija</option>
                        <option value="VMA - Ortopedija">VMA - Ortopedija</option>
                        <option value="VMA - Nefrologija">VMA - Nefrologija</option>
                      </optgroup>
                      <optgroup label="KBC Bežanijska kosa">
                        <option value="KBC BK - Intezivna nega">KBC BK - Intezivna nega</option>
                        <option value="KBC BK - Reumatologija">KBC BK - Reumatologija</option>
                        <option value="KBC BK - Fizikalna">KBC BK - Fizikalna</option>
                        <option value="KBC BK - Transfuzija">KBC BK - Transfuzija</option>
                      </optgroup>
                      <optgroup label="Klinički centar">
                        <option value="KC - Ortopedija">KC - Ortopedija</option>
                        <option value="KC - Infektivna">KC - Infektivna</option>
                        <option value="KC - Hitna">KC - Hitna</option>
                      </optgroup>
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Početak</label>
                    <input name="startTime" type="time" required defaultValue={editingShift?.startTime || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kraj</label>
                    <input name="endTime" type="time" required defaultValue={editingShift?.endTime || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dnevnica (€)</label>
                  <input name="pay" type="number" required defaultValue={editingShift?.pay || ''} placeholder="Npr. 35" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-primary-light transition-all mt-4">
                  {editingShift ? 'Sačuvaj izmene' : 'Objavi smenu'}
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

function StatCard({ label, value, icon, color, badge }: { label: string, value: number, icon: React.ReactNode, color: string, badge?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
      {badge && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
        </span>
      )}
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
