import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

type UserRole = 'worker' | 'venue';
type Industry = 'hospitality' | 'healthcare';
type City = 'Beograd' | 'Novi Sad' | 'Kragujevac' | 'Niš' | 'Subotica' | 'Trebinje' | 'Banja Luka';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const today = new Date();
  const getISO = (daysOffset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString();
  };

  const venuesData: Record<string, any[]> = {
    'Beograd_hospitality': [
      { id: "bv1", name: "Kafeterija Vračar", avatar: "cafe1" }, { id: "bv2", name: "Red Bar", avatar: "bar1" }, { id: "bv3", name: "Destino", avatar: "destino" },
      { id: "bv4", name: "Smokvica", avatar: "smokvica" }, { id: "bv5", name: "Koffein", avatar: "koffein" }, { id: "bv6", name: "Hotel Moskva", avatar: "moskva" }
    ],
    'Beograd_healthcare': [
      { id: "bhv1", name: "VMA", avatar: "vma" }, { id: "bhv2", name: "Bel Medic", avatar: "belmedic" }, { id: "bhv3", name: "Medigroup", avatar: "medigroup" },
      { id: "bhv4", name: "Euromedik", avatar: "euromedik" }
    ],
    'Novi Sad_hospitality': [
      { id: "nv1", name: "Project 72", avatar: "p72" }, { id: "nv2", name: "Fish & Zelenish", avatar: "fish" }, { id: "nv3", name: "Petrus", avatar: "petrus" },
      { id: "nv4", name: "Trčika", avatar: "trcika" }, { id: "nv5", name: "Absolut", avatar: "absolut" }, { id: "nv6", name: "Loft", avatar: "loft" }
    ],
    'Novi Sad_healthcare': [
      { id: "nhv1", name: "KCV", avatar: "kcv" }, { id: "nhv2", name: "Poliklinika Marić", avatar: "maric" }, { id: "nhv3", name: "MC Poliklinika", avatar: "mc" },
      { id: "nhv4", name: "Global Care", avatar: "global" }
    ],
    'Kragujevac_hospitality': [
      { id: "kv1", name: "Mustang", avatar: "mustang" }, { id: "kv2", name: "Panorama", avatar: "panorama" }, { id: "kv3", name: "Dvorište", avatar: "dvoriste" },
      { id: "kv4", name: "Caffe Cinema", avatar: "cinema" }, { id: "kv5", name: "Oblomov", avatar: "oblomov" }, { id: "kv6", name: "Triptih", avatar: "triptih" }
    ],
    'Kragujevac_healthcare': [
      { id: "khv1", name: "UKC Kragujevac", avatar: "ukck" }, { id: "khv2", name: "Poliklinika Kragujmed", avatar: "kragujmed" }, { id: "khv3", name: "Medikus", avatar: "medikus" },
      { id: "khv4", name: "Sanitas", avatar: "sanitas" }
    ],
    'Trebinje_hospitality': [
      { id: "tv1", name: "Platani", avatar: "platani" }, { id: "tv2", name: "Market", avatar: "market" }, { id: "tv3", name: "Porto Galo", avatar: "porto" },
      { id: "tv4", name: "Klub 089", avatar: "klub" }, { id: "tv5", name: "Azzaro", avatar: "azzaro" }
    ],
    'Trebinje_healthcare': [
      { id: "thv1", name: "Bolnica Trebinje", avatar: "bolnicatb" }, { id: "thv2", name: "Dom zdravlja Trebinje", avatar: "dztb" }
    ],
    'Niš_hospitality': [
      { id: "niv1", name: "Pleasure", avatar: "pleasure" }, { id: "niv2", name: "Hamam", avatar: "hamam" }, { id: "niv3", name: "Stambolijski", avatar: "stambol" }
    ],
    'Niš_healthcare': [
      { id: "nihv1", name: "UKC Niš", avatar: "ukcnis" }, { id: "nihv2", name: "Vojna bolnica Niš", avatar: "vojnanis" }
    ],
    'Subotica_hospitality': [
      { id: "sv1", name: "Boss Cafe", avatar: "boss" }, { id: "sv2", name: "Bates", avatar: "bates" }, { id: "sv3", name: "Bodrog", avatar: "bodrog" }
    ],
    'Subotica_healthcare': [
      { id: "shv1", name: "Opšta bolnica Subotica", avatar: "obsub" }, { id: "shv2", name: "Dom zdravlja Subotica", avatar: "dzsub" }
    ],
    'Banja Luka_hospitality': [
      { id: "blv1", name: "Mala Stanica", avatar: "stanica" }, { id: "blv2", name: "Baza", avatar: "baza" }, { id: "blv3", name: "Kafeterija 5", avatar: "k5" },
      { id: "blv4", name: "Combo", avatar: "combo" }, { id: "blv5", name: "Smuggler", avatar: "smuggler" }
    ],
    'Banja Luka_healthcare': [
      { id: "blhv1", name: "UKC RS", avatar: "ukcrs" }, { id: "blhv2", name: "Zavod Dr Miroslav Zotović", avatar: "zotovic" }, { id: "blhv3", name: "Dom zdravlja BL", avatar: "dzbl" }
    ]
  };

  const workers = [
    { id: "w1", name: "Nikola Petrović", avatar: "https://picsum.photos/seed/worker1/200/200", rating: 4.9, completedShifts: 25 },
    { id: "w2", name: "Milica Jovanović", avatar: "https://picsum.photos/seed/worker2/200/200", rating: 4.8, completedShifts: 18 },
    { id: "w3", name: "Marko Simić", avatar: "https://picsum.photos/seed/worker3/200/200", rating: 4.7, completedShifts: 12 },
    { id: "w4", name: "Jelena Kostić", avatar: "https://picsum.photos/seed/worker4/200/200", rating: 5.0, completedShifts: 30 }
  ];

  // In-memory store for demo purposes
  const generateShifts = () => {
    const cities: City[] = ['Beograd', 'Novi Sad', 'Kragujevac', 'Niš', 'Subotica', 'Trebinje', 'Banja Luka'];
    const industries: Industry[] = ['hospitality', 'healthcare'];
    
    const roles = {
      hospitality: ["Konobar", "Šanker", "Kuvar", "Pomoćni radnik", "Barista", "Hostesa"],
      healthcare: ["Medicinska sestra", "Tehničar", "Babica", "Laborant", "Negovatelj"]
    };

    const allShifts: any[] = [];
    const now = new Date();

    cities.forEach(city => {
      industries.forEach(industry => {
        const key = `${city}_${industry}`;
        const cityVenues = venuesData[key] || [];
        
        // Generate 5 shifts per month for 3 months
        for (let m = 0; m < 3; m++) {
          for (let i = 0; i < 5; i++) {
            const venue = cityVenues[i % cityVenues.length];
            if (!venue) continue;
            const date = new Date(now.getFullYear(), now.getMonth() + m, now.getDate() + (i * 3));
            const role = roles[industry][Math.floor(Math.random() * roles[industry].length)];
            
            allShifts.push({
              id: `${city[0]}${industry[0]}${m}${i}`,
              venueId: venue.id,
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

  // API routes
  app.get("/api/shifts", (req, res) => {
    const { industry, city, venueId } = req.query;
    let filteredShifts = shifts;
    if (industry) filteredShifts = filteredShifts.filter(s => s.industry === industry);
    if (city) filteredShifts = filteredShifts.filter(s => s.city === city);
    if (venueId) filteredShifts = filteredShifts.filter(s => s.venueId === venueId);
    res.json(filteredShifts);
  });

  app.get("/api/venues", (req, res) => {
    const { industry, city } = req.query;
    const key = `${city}_${industry}`;
    res.json(venuesData[key] || []);
  });

  app.get("/api/workers", (req, res) => {
    res.json(workers);
  });

  app.post(["/api/shifts", "/api/shifts/"], (req, res) => {
    const newShift = {
      id: Math.random().toString(36).substr(2, 9),
      ...req.body,
      status: "open"
    };
    shifts.push(newShift);
    res.status(201).json(newShift);
  });

  app.put("/api/shifts/:id", (req, res) => {
    const { id } = req.params;
    const index = shifts.findIndex(s => s.id === id);
    if (index !== -1) {
      shifts[index] = { ...shifts[index], ...req.body };
      res.json(shifts[index]);
    } else {
      res.status(404).json({ error: "Shift not found" });
    }
  });

  app.delete("/api/shifts/:id", (req, res) => {
    const { id } = req.params;
    const index = shifts.findIndex(s => s.id === id);
    if (index !== -1) {
      shifts.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Shift not found" });
    }
  });

  app.post("/api/shifts/:id/apply", (req, res) => {
    const { id } = req.params;
    const shift = shifts.find(s => s.id === id);
    if (shift) {
      shift.status = "pending";
      res.json(shift);
    } else {
      res.status(404).json({ error: "Shift not found" });
    }
  });

  app.post("/api/shifts/:id/approve", (req, res) => {
    const { id } = req.params;
    const shift = shifts.find(s => s.id === id);
    if (shift) {
      shift.status = "booked";
      res.json(shift);
    } else {
      res.status(404).json({ error: "Shift not found" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
