import express from "express";
import path from "path";

type Industry = 'hospitality' | 'healthcare';
type City = 'Beograd' | 'Novi Sad' | 'Kragujevac' | 'Niš' | 'Subotica';

const app = express();
app.use(express.json());

const today = new Date();
const getISO = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
};

// In-memory store (Napomena: Na Vercelu se ovo resetuje pri svakom novom zahtevu jer je serverless)
const generateShifts = () => {
  const cities = ['Beograd', 'Novi Sad', 'Kragujevac'];
  const industries = ['hospitality', 'healthcare'];
  const venues: Record<string, any[]> = {
    'Beograd_hospitality': [
      { name: "Kafeterija Vračar", avatar: "cafe1" }, { name: "Red Bar", avatar: "bar1" }, { name: "Destino", avatar: "destino" },
      { name: "Smokvica", avatar: "smokvica" }, { name: "Koffein", avatar: "koffein" }, { name: "Hotel Moskva", avatar: "moskva" }
    ],
    'Beograd_healthcare': [
      { name: "VMA", avatar: "vma" }, { name: "Bel Medic", avatar: "belmedic" }, { name: "Medigroup", avatar: "medigroup" },
      { name: "Euromedik", avatar: "euromedik" }
    ],
    'Novi Sad_hospitality': [
      { name: "Project 72", avatar: "p72" }, { name: "Fish & Zelenish", avatar: "fish" }, { name: "Petrus", avatar: "petrus" },
      { name: "Trčika", avatar: "trcika" }, { name: "Absolut", avatar: "absolut" }, { name: "Loft", avatar: "loft" }
    ],
    'Novi Sad_healthcare': [
      { name: "KCV", avatar: "kcv" }, { name: "Poliklinika Marić", avatar: "maric" }, { name: "MC Poliklinika", avatar: "mc" },
      { name: "Global Care", avatar: "global" }
    ],
    'Kragujevac_hospitality': [
      { name: "Mustang", avatar: "mustang" }, { name: "Panorama", avatar: "panorama" }, { name: "Dvorište", avatar: "dvoriste" },
      { name: "Caffe Cinema", avatar: "cinema" }, { name: "Oblomov", avatar: "oblomov" }, { name: "Triptih", avatar: "triptih" }
    ],
    'Kragujevac_healthcare': [
      { name: "UKC Kragujevac", avatar: "ukck" }, { name: "Poliklinika Kragujmed", avatar: "kragujmed" }, { name: "Medikus", avatar: "medikus" },
      { name: "Sanitas", avatar: "sanitas" }
    ]
  };

  const roles = {
    hospitality: ["Konobar", "Šanker", "Kuvar", "Pomoćni radnik", "Barista", "Hostesa"],
    healthcare: ["Medicinska sestra", "Tehničar", "Babica", "Laborant", "Negovatelj"]
  };

  const allShifts: any[] = [];
  const now = new Date();

  cities.forEach(city => {
    industries.forEach(industry => {
      const key = `${city}_${industry}`;
      const cityVenues = venues[key] || [];
      
      for (let m = 0; m < 3; m++) {
        for (let i = 0; i < 5; i++) {
          const venue = cityVenues[i % cityVenues.length];
          const date = new Date(now.getFullYear(), now.getMonth() + m, now.getDate() + (i * 3));
          const role = roles[industry as keyof typeof roles][Math.floor(Math.random() * roles[industry as keyof typeof roles].length)];
          
          allShifts.push({
            id: `${city[0]}${industry[0]}${m}${i}`,
            venueId: `v_${city[0]}${i}`,
            venueName: venue.name,
            venueAvatar: `https://picsum.photos/seed/${venue.avatar}/100/100`,
            distance: `${(Math.random() * 5).toFixed(1)} km`,
            date: date.toISOString(),
            startTime: "08:00",
            endTime: "16:00",
            role: role,
            pay: Math.floor(Math.random() * 30) + 30,
            status: "open",
            industry: industry,
            city: city
          });
        }
      }
    });
  });
  return allShifts;
};

let shifts = generateShifts();

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
