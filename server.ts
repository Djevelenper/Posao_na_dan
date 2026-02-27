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

  // In-memory store for demo purposes
  const generateShifts = () => {
    const cities: City[] = ['Beograd', 'Novi Sad', 'Kragujevac', 'Trebinje', 'Banja Luka'];
    const industries: Industry[] = ['hospitality', 'healthcare'];
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
      ],
      'Trebinje_hospitality': [
        { name: "Platani", avatar: "platani" }, { name: "Market", avatar: "market" }, { name: "Porto Galo", avatar: "porto" },
        { name: "Klub 089", avatar: "klub" }, { name: "Azzaro", avatar: "azzaro" }
      ],
      'Trebinje_healthcare': [
        { name: "Bolnica Trebinje", avatar: "bolnicatb" }, { name: "Dom zdravlja Trebinje", avatar: "dztb" }
      ],
      'Banja Luka_hospitality': [
        { name: "Mala Stanica", avatar: "stanica" }, { name: "Baza", avatar: "baza" }, { name: "Kafeterija 5", avatar: "k5" },
        { name: "Combo", avatar: "combo" }, { name: "Smuggler", avatar: "smuggler" }
      ],
      'Banja Luka_healthcare': [
        { name: "UKC RS", avatar: "ukcrs" }, { name: "Zavod Dr Miroslav Zotović", avatar: "zotovic" }, { name: "Dom zdravlja BL", avatar: "dzbl" }
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
        
        // Generate 5 shifts per month for 3 months
        for (let m = 0; m < 3; m++) {
          for (let i = 0; i < 5; i++) {
            const venue = cityVenues[i % cityVenues.length];
            const date = new Date(now.getFullYear(), now.getMonth() + m, now.getDate() + (i * 3));
            const role = roles[industry][Math.floor(Math.random() * roles[industry].length)];
            
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

  // API routes
  app.get(["/api/shifts", "/api/shifts/"], (req, res) => {
    console.log("GET /api/shifts", req.query);
    const { industry, city } = req.query;
    let filteredShifts = shifts;
    if (industry) {
      filteredShifts = filteredShifts.filter(s => s.industry === industry);
    }
    if (city) {
      filteredShifts = filteredShifts.filter(s => s.city === city);
    }
    res.json(filteredShifts);
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
