import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Euro, CheckCircle2, User, Calendar as CalendarIcon, Briefcase, Star, ChevronRight, HeartPulse, Stethoscope, LayoutDashboard, Bell } from 'lucide-react';
import { Shift, User as UserType, Industry, City } from '../types';
import { cn } from '../lib/utils';

export default function WorkerDashboard({ industry, city }: { industry: Industry, city: City }) {
  const [date, setDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDateShifts, setSelectedDateShifts] = useState<Shift[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'my-shifts' | 'profile'>('explore');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [minPay, setMinPay] = useState<number>(0);
  const [user] = useState<UserType>({
    id: 'w1',
    name: 'Nikola Petrović',
    role: 'worker',
    industry: industry,
    city: city,
    avatar: 'https://picsum.photos/seed/worker1/200/200',
    rating: 4.9,
    completedShifts: 25
  });

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

  const handleDateChange = (newDate: any) => {
    const d = newDate as Date;
    setDate(d);
    const dayShifts = shifts.filter(s => isSameDay(parseISO(s.date), d));
    setSelectedDateShifts(dayShifts);
    setIsModalOpen(true);
  };

  const handleApply = async (id: string) => {
    const res = await fetch(`/api/shifts/${id}/apply`, { method: 'POST' });
    if (res.ok) {
      fetchShifts();
      setSelectedDateShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'pending' } : s));
    }
  };

  const tileContent = ({ date: tileDate, view }: { date: Date, view: string }) => {
    if (view !== 'month') return null;
    const dayShifts = shifts.filter(s => isSameDay(parseISO(s.date), tileDate));
    if (dayShifts.length === 0) return null;
    
    const hasBooked = dayShifts.some(s => s.status === 'booked');
    const hasPending = dayShifts.some(s => s.status === 'pending');
    
    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {hasBooked && <div className="w-1 h-1 rounded-full bg-success" />}
        {hasPending && <div className="w-1 h-1 rounded-full bg-warning" />}
        {!hasBooked && !hasPending && <div className="w-1 h-1 rounded-full bg-primary/40" />}
      </div>
    );
  };

  const myShifts = shifts.filter(s => s.status === 'pending' || s.status === 'booked');
  const totalEarnings = shifts
    .filter(s => s.status === 'booked')
    .reduce((acc, s) => acc + (s.pay * 8), 0); // Assuming 8h shift for demo

  const filteredShifts = shifts.filter(s => {
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    const matchesPay = s.pay >= minPay;
    const isOpen = s.status === 'open';
    return matchesRole && matchesPay && isOpen;
  });

  const uniqueRoles = Array.from(new Set(shifts.map(s => s.role)));

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{city} • {industry === 'hospitality' ? 'Ugostiteljstvo' : 'Zdravstvo'}</p>
            <h1 className="text-xl font-bold text-primary uppercase tracking-tighter">POSAO NA DAN</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-700">{user.name}</p>
              <p className="text-[10px] text-slate-400">★ {user.rating}</p>
            </div>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-lg border border-slate-100 object-cover" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {activeTab === 'explore' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4 px-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Kalendar smena</h2>
              </div>
              <Calendar 
                onChange={handleDateChange} 
                value={date}
                className="professional-calendar"
                tileContent={tileContent}
              />
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-4 px-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dostupne smene</h2>
                  <span className="text-[10px] font-bold text-slate-400">{filteredShifts.length} rezultata</span>
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button 
                    onClick={() => setFilterRole('all')}
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
                      filterRole === 'all' ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-slate-400 border border-slate-200"
                    )}
                  >
                    Sve uloge
                  </button>
                  {uniqueRoles.map(role => (
                    <button 
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={cn(
                        "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
                        filterRole === role ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-slate-400 border border-slate-200"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredShifts.length > 0 ? (
                  filteredShifts.map(shift => (
                    <ShiftCard key={shift.id} shift={shift} onApply={() => handleApply(shift.id)} />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <p className="text-slate-400 text-sm">Nema smena koje odgovaraju filterima.</p>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'my-shifts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-2">Moje Rezervacije</h2>
              <div className="space-y-3">
                {myShifts.map(shift => (
                  <ShiftCard key={shift.id} shift={shift} />
                ))}
                {myShifts.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <p className="text-slate-400 text-sm">Nemaš aktivnih smena.</p>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-2xl mx-auto mb-4 border-4 border-slate-50 object-cover" />
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500 text-sm mb-6">{user.city} • {industry === 'hospitality' ? 'Ugostiteljstvo' : 'Zdravstvo'}</p>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-lg font-bold text-primary">{user.rating}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Ocena</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-lg font-bold text-primary">{user.completedShifts}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Smena</p>
                </div>
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                  <p className="text-lg font-bold text-primary">{totalEarnings}€</p>
                  <p className="text-[8px] font-bold text-primary/60 uppercase">Zarada</p>
                </div>
              </div>
            </section>

            <div className="space-y-2">
              <ProfileLink icon={<User className="w-5 h-5" />} label="Lični podaci" />
              <ProfileLink icon={<Briefcase className="w-5 h-5" />} label="Radno iskustvo" />
              <ProfileLink icon={<Star className="w-5 h-5" />} label="Sertifikati i licence" />
              <ProfileLink icon={<Bell className="w-5 h-5" />} label="Obaveštenja" />
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-6 max-h-[80vh] overflow-y-auto shadow-2xl border-t border-slate-100">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-bold text-slate-800 mb-1">Smene za {format(date, 'd. MMMM')}</h3>
              <p className="text-slate-400 text-xs mb-6">{selectedDateShifts.length} dostupnih smena</p>

              <div className="space-y-3">
                {selectedDateShifts.length > 0 ? (
                  selectedDateShifts.map(shift => (
                    <ShiftCard key={shift.id} shift={shift} onApply={() => handleApply(shift.id)} />
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 text-sm">Nema dostupnih smena za ovaj datum.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-3 flex justify-between items-center z-30 shadow-lg">
        <NavIcon icon={<LayoutDashboard className="w-5 h-5" />} label="Pregled" active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} />
        <NavIcon icon={<CalendarIcon className="w-5 h-5" />} label="Moje" active={activeTab === 'my-shifts'} onClick={() => setActiveTab('my-shifts')} />
        <NavIcon icon={<User className="w-5 h-5" />} label="Profil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

const ShiftCard: React.FC<{ shift: Shift, onApply?: () => void | Promise<void> }> = ({ shift, onApply }) => {
  const isPending = shift.status === 'pending';
  const isBooked = shift.status === 'booked';
  
  // Urgent if shift starts in less than 24h
  const isUrgent = new Date(shift.date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 && shift.status === 'open';

  return (
    <motion.div className={cn(
      "bg-white border rounded-xl p-4 transition-all shadow-sm group relative overflow-hidden",
      isUrgent ? "border-red-100 bg-red-50/30" : "border-slate-200 hover:border-primary/30"
    )}>
      {isUrgent && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">
          Hitno
        </div>
      )}
      <div className="flex gap-4">
        <img src={shift.venueAvatar} alt={shift.venueName} className="w-12 h-12 rounded-lg object-cover border border-slate-100" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{shift.venueName}</h4>
              <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5 font-medium">
                <MapPin className="w-3 h-3" />
                <span>{shift.distance}</span>
                {shift.department && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-primary-light">{shift.department}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{shift.pay}€</p>
              <p className="text-[8px] font-bold text-slate-300 uppercase">Po satu</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{shift.startTime} - {shift.endTime}</span>
              </div>
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                {shift.role}
              </span>
            </div>
            
            {isBooked ? (
              <div className="flex items-center gap-1 text-success font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Potvrđeno
              </div>
            ) : isPending ? (
              <div className="bg-warning/10 text-warning px-3 py-1 rounded-lg text-[10px] font-bold">
                Na čekanju
              </div>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); onApply?.(); }}
                className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-light transition-colors shadow-sm"
              >
                Rezerviši
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NavIcon({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 transition-colors", active ? "text-primary" : "text-slate-400")}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-primary rounded-full" />}
    </button>
  );
}

function ProfileLink({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:text-primary transition-colors">
          {icon}
        </div>
        <span className="font-bold text-slate-700">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300" />
    </div>
  );
}
