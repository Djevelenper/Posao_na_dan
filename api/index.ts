import express from "express";
import path from "path";

const app = express();
app.use(express.json());

const today = new Date();
const getISO = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
};

// In-memory store (Napomena: Na Vercelu se ovo resetuje pri svakom novom zahtevu jer je serverless)
let shifts = [
  // --- BEOGRAD ---
  { id: "b1", venueId: "bv1", venueName: "Kafeterija Vračar", venueAvatar: "https://picsum.photos/seed/cafe1/100/100", distance: "1.2 km", date: getISO(0), startTime: "08:00", endTime: "16:00", role: "Bartender", pay: 35, status: "open", industry: "hospitality", city: "Beograd" },
  { id: "b2", venueId: "bv2", venueName: "Red Bar", venueAvatar: "https://picsum.photos/seed/bar1/100/100", distance: "0.8 km", date: getISO(1), startTime: "18:00", endTime: "02:00", role: "Waiter", pay: 40, status: "open", industry: "hospitality", city: "Beograd" },
  { id: "b3", venueId: "bv3", venueName: "Destino", venueAvatar: "https://picsum.photos/seed/destino/100/100", distance: "1.5 km", date: getISO(2), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 38, status: "open", industry: "hospitality", city: "Beograd" },
  { id: "b9", venueId: "bv9", venueName: "Madera", venueAvatar: "https://picsum.photos/seed/madera/100/100", distance: "1.0 km", date: new Date().toISOString(), startTime: "12:00", endTime: "22:00", role: "Konobar", pay: 50, status: "open", industry: "hospitality", city: "Beograd" },
  { id: "bh1", venueId: "bhv1", venueName: "VMA", department: "Neurologija", venueAvatar: "https://picsum.photos/seed/vma/100/100", distance: "2.5 km", date: getISO(0), startTime: "07:00", endTime: "15:00", role: "Medicinska sestra", pay: 50, status: "open", industry: "healthcare", city: "Beograd" },
  
  // --- NOVI SAD ---
  { id: "n1", venueId: "nv1", venueName: "Project 72", venueAvatar: "https://picsum.photos/seed/p72/100/100", distance: "1.0 km", date: new Date().toISOString(), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 35, status: "open", industry: "hospitality", city: "Novi Sad" },
  { id: "nh1", venueId: "nhv1", venueName: "Klinički centar Vojvodine", department: "Kardiologija", venueAvatar: "https://picsum.photos/seed/kcv/100/100", distance: "2.0 km", date: new Date().toISOString(), startTime: "07:00", endTime: "15:00", role: "Medicinska sestra", pay: 55, status: "open", industry: "healthcare", city: "Novi Sad" },
  
  // --- KRAGUJEVAC ---
  { id: "k1", venueId: "kv1", venueName: "Mustang", venueAvatar: "https://picsum.photos/seed/mustang/100/100", distance: "1.5 km", date: new Date().toISOString(), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 30, status: "open", industry: "hospitality", city: "Kragujevac" },
  { id: "kh1", venueId: "khv1", venueName: "UKC Kragujevac", department: "Ortopedija", venueAvatar: "https://picsum.photos/seed/ukck/100/100", distance: "1.5 km", date: new Date().toISOString(), startTime: "07:00", endTime: "15:00", role: "Medicinska sestra", pay: 50, status: "open", industry: "healthcare", city: "Kragujevac" }
];

// API rute
app.get("/api/shifts", (req, res) => {
  const { industry, city } = req.query;
  let filteredShifts = shifts;
  if (industry) filteredShifts = filteredShifts.filter(s => s.industry === industry);
  if (city) filteredShifts = filteredShifts.filter(s => s.city === city);
  res.json(filteredShifts);
});

app.post("/api/shifts", (req, res) => {
  const newShift = { id: Math.random().toString(36).substr(2, 9), ...req.body, status: "open" };
  shifts.push(newShift);
  res.status(201).json(newShift);
});

app.post("/api/shifts/:id/apply", (req, res) => {
  const { id } = req.params;
  const shift = shifts.find(s => s.id === id);
  if (shift) { shift.status = "pending"; res.json(shift); }
  else res.status(404).json({ error: "Shift not found" });
});

app.post("/api/shifts/:id/approve", (req, res) => {
  const { id } = req.params;
  const shift = shifts.find(s => s.id === id);
  if (shift) { shift.status = "booked"; res.json(shift); }
  else res.status(404).json({ error: "Shift not found" });
});

// Export za Vercel
export default app;
