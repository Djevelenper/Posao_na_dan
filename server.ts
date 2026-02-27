import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

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
  let shifts = [
    // --- BEOGRAD ---
    // Hospitality
    { id: "b1", venueId: "bv1", venueName: "Kafeterija Vračar", venueAvatar: "https://picsum.photos/seed/cafe1/100/100", distance: "1.2 km", date: getISO(0), startTime: "08:00", endTime: "16:00", role: "Bartender", pay: 35, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b2", venueId: "bv2", venueName: "Red Bar", venueAvatar: "https://picsum.photos/seed/bar1/100/100", distance: "0.8 km", date: getISO(1), startTime: "18:00", endTime: "02:00", role: "Waiter", pay: 40, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b3", venueId: "bv3", venueName: "Destino", venueAvatar: "https://picsum.photos/seed/destino/100/100", distance: "1.5 km", date: getISO(2), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 38, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b4", venueId: "bv4", venueName: "Zrno", venueAvatar: "https://picsum.photos/seed/zrno/100/100", distance: "0.5 km", date: getISO(0), startTime: "07:30", endTime: "15:30", role: "Barista", pay: 32, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b5", venueId: "bv5", venueName: "CentralPub", venueAvatar: "https://picsum.photos/seed/centralpub/100/100", distance: "2.1 km", date: getISO(-1), startTime: "19:00", endTime: "03:00", role: "Šanker", pay: 45, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b6", venueId: "bv6", venueName: "PizzaBar", venueAvatar: "https://picsum.photos/seed/pizzabar/100/100", distance: "1.1 km", date: getISO(1), startTime: "11:00", endTime: "19:00", role: "Pomoćni radnik", pay: 30, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b7", venueId: "bv7", venueName: "Venecija", venueAvatar: "https://picsum.photos/seed/venecija/100/100", distance: "3.2 km", date: getISO(3), startTime: "13:00", endTime: "21:00", role: "Konobar", pay: 42, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b8", venueId: "bv8", venueName: "Moonze", venueAvatar: "https://picsum.photos/seed/moonze/100/100", distance: "4.5 km", date: getISO(0), startTime: "20:00", endTime: "04:00", role: "Šanker", pay: 48, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b9", venueId: "bv9", venueName: "Madera", venueAvatar: "https://picsum.photos/seed/madera/100/100", distance: "1.0 km", date: new Date().toISOString(), startTime: "12:00", endTime: "22:00", role: "Konobar", pay: 50, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b10", venueId: "bv10", venueName: "Franš", venueAvatar: "https://picsum.photos/seed/frans/100/100", distance: "2.5 km", date: new Date().toISOString(), startTime: "13:00", endTime: "23:00", role: "Hostesa", pay: 45, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b11", venueId: "bv11", venueName: "Lorenzo & Kakalamba", venueAvatar: "https://picsum.photos/seed/lorenzo/100/100", distance: "1.8 km", date: new Date().toISOString(), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 40, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b12", venueId: "bv12", venueName: "Tri Šešira", venueAvatar: "https://picsum.photos/seed/sesira/100/100", distance: "0.2 km", date: new Date().toISOString(), startTime: "14:00", endTime: "22:00", role: "Konobar", pay: 42, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b13", venueId: "bv13", venueName: "Manufaktura", venueAvatar: "https://picsum.photos/seed/manufaktura/100/100", distance: "0.4 km", date: new Date().toISOString(), startTime: "10:00", endTime: "18:00", role: "Pomoćni radnik", pay: 35, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b14", venueId: "bv14", venueName: "Ambar", venueAvatar: "https://picsum.photos/seed/ambar/100/100", distance: "0.9 km", date: new Date().toISOString(), startTime: "16:00", endTime: "00:00", role: "Šanker", pay: 45, status: "open", industry: "hospitality", city: "Beograd" },
    { id: "b15", venueId: "bv15", venueName: "Toro Latin GastroBar", venueAvatar: "https://picsum.photos/seed/toro/100/100", distance: "0.9 km", date: new Date().toISOString(), startTime: "18:00", endTime: "02:00", role: "Konobar", pay: 48, status: "open", industry: "hospitality", city: "Beograd" },
    // Healthcare
    { id: "bh1", venueId: "bhv1", venueName: "VMA", department: "Neurologija", venueAvatar: "https://picsum.photos/seed/vma/100/100", distance: "2.5 km", date: getISO(0), startTime: "07:00", endTime: "15:00", role: "Medicinska sestra", pay: 50, status: "open", industry: "healthcare", city: "Beograd" },
    { id: "bh2", venueId: "bhv2", venueName: "KBC Bežanijska kosa", department: "Intezivna nega", venueAvatar: "https://picsum.photos/seed/kbc/100/100", distance: "4.1 km", date: getISO(1), startTime: "19:00", endTime: "07:00", role: "Medicinska sestra", pay: 65, status: "open", industry: "healthcare", city: "Beograd" },
    { id: "bh3", venueId: "bhv3", venueName: "Klinički centar", department: "Hitna", venueAvatar: "https://picsum.photos/seed/kc/100/100", distance: "1.5 km", date: getISO(2), startTime: "14:00", endTime: "22:00", role: "Medicinska sestra", pay: 55, status: "open", industry: "healthcare", city: "Beograd" },
    { id: "bh4", venueId: "bhv4", venueName: "GAK Narodni front", department: "Ginekologija", venueAvatar: "https://picsum.photos/seed/gak/100/100", distance: "0.5 km", date: getISO(0), startTime: "07:00", endTime: "19:00", role: "Babica", pay: 60, status: "open", industry: "healthcare", city: "Beograd" },
    { id: "bh5", venueId: "bhv5", venueName: "Institut za majku i dete", department: "Pedijatrija", venueAvatar: "https://picsum.photos/seed/imd/100/100", distance: "3.5 km", date: getISO(-1), startTime: "08:00", endTime: "16:00", role: "Medicinska sestra", pay: 52, status: "open", industry: "healthcare", city: "Beograd" },

    // --- NOVI SAD ---
    // Hospitality
    { id: "n1", venueId: "nv1", venueName: "Project 72", venueAvatar: "https://picsum.photos/seed/p72/100/100", distance: "1.0 km", date: new Date().toISOString(), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 35, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n2", venueId: "nv2", venueName: "Fish & Zelenish", venueAvatar: "https://picsum.photos/seed/fish/100/100", distance: "0.5 km", date: new Date().toISOString(), startTime: "11:00", endTime: "19:00", role: "Kuvar", pay: 55, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n3", venueId: "nv3", venueName: "Petrus", venueAvatar: "https://picsum.photos/seed/petrus/100/100", distance: "0.2 km", date: new Date().toISOString(), startTime: "08:00", endTime: "16:00", role: "Barista", pay: 30, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n4", venueId: "nv4", venueName: "Gondola", venueAvatar: "https://picsum.photos/seed/gondola/100/100", distance: "1.2 km", date: new Date().toISOString(), startTime: "14:00", endTime: "22:00", role: "Konobar", pay: 32, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n5", venueId: "nv5", venueName: "Zak", venueAvatar: "https://picsum.photos/seed/zak/100/100", distance: "0.8 km", date: new Date().toISOString(), startTime: "17:00", endTime: "01:00", role: "Šanker", pay: 40, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n6", venueId: "nv6", venueName: "Veliki", venueAvatar: "https://picsum.photos/seed/veliki/100/100", distance: "0.3 km", date: new Date().toISOString(), startTime: "10:00", endTime: "18:00", role: "Konobar", pay: 33, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n7", venueId: "nv7", venueName: "Lazin Salaš", venueAvatar: "https://picsum.photos/seed/lazin/100/100", distance: "0.4 km", date: new Date().toISOString(), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 35, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n8", venueId: "nv8", venueName: "Garden", venueAvatar: "https://picsum.photos/seed/garden/100/100", distance: "1.5 km", date: new Date().toISOString(), startTime: "09:00", endTime: "17:00", role: "Barista", pay: 30, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n9", venueId: "nv9", venueName: "Piknik", venueAvatar: "https://picsum.photos/seed/piknik/100/100", distance: "3.0 km", date: new Date().toISOString(), startTime: "11:00", endTime: "19:00", role: "Pomoćni radnik", pay: 32, status: "open", industry: "hospitality", city: "Novi Sad" },
    { id: "n10", venueId: "nv10", venueName: "Giardino", venueAvatar: "https://picsum.photos/seed/giardino/100/100", distance: "0.1 km", date: new Date().toISOString(), startTime: "20:00", endTime: "04:00", role: "Šanker", pay: 45, status: "open", industry: "hospitality", city: "Novi Sad" },
    // Healthcare
    { id: "nh1", venueId: "nhv1", venueName: "Klinički centar Vojvodine", department: "Kardiologija", venueAvatar: "https://picsum.photos/seed/kcv/100/100", distance: "2.0 km", date: new Date().toISOString(), startTime: "07:00", endTime: "15:00", role: "Medicinska sestra", pay: 55, status: "open", industry: "healthcare", city: "Novi Sad" },
    { id: "nh2", venueId: "nhv2", venueName: "Institut za KVB Sremska Kamenica", department: "Hirurgija", venueAvatar: "https://picsum.photos/seed/sk/100/100", distance: "5.0 km", date: new Date().toISOString(), startTime: "08:00", endTime: "20:00", role: "Tehničar", pay: 60, status: "open", industry: "healthcare", city: "Novi Sad" },
    { id: "nh3", venueId: "nhv3", venueName: "Dom zdravlja Novi Sad", department: "Opšta praksa", venueAvatar: "https://picsum.photos/seed/dzns/100/100", distance: "1.0 km", date: new Date().toISOString(), startTime: "07:00", endTime: "14:00", role: "Medicinska sestra", pay: 48, status: "open", industry: "healthcare", city: "Novi Sad" },
    { id: "nh4", venueId: "nhv4", venueName: "Betanija", department: "Porođajno", venueAvatar: "https://picsum.photos/seed/betanija/100/100", distance: "2.5 km", date: new Date().toISOString(), startTime: "19:00", endTime: "07:00", role: "Babica", pay: 65, status: "open", industry: "healthcare", city: "Novi Sad" },

    // --- KRAGUJEVAC ---
    // Hospitality
    { id: "k1", venueId: "kv1", venueName: "Mustang", venueAvatar: "https://picsum.photos/seed/mustang/100/100", distance: "1.5 km", date: new Date().toISOString(), startTime: "12:00", endTime: "20:00", role: "Konobar", pay: 30, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k2", venueId: "kv2", venueName: "Panorama", venueAvatar: "https://picsum.photos/seed/panorama/100/100", distance: "2.0 km", date: new Date().toISOString(), startTime: "14:00", endTime: "22:00", role: "Šanker", pay: 35, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k3", venueId: "kv3", venueName: "Dvorište", venueAvatar: "https://picsum.photos/seed/dvoriste/100/100", distance: "0.5 km", date: new Date().toISOString(), startTime: "09:00", endTime: "17:00", role: "Barista", pay: 28, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k4", venueId: "kv4", venueName: "Oranica", venueAvatar: "https://picsum.photos/seed/oranica/100/100", distance: "3.0 km", date: new Date().toISOString(), startTime: "11:00", endTime: "19:00", role: "Kuvar", pay: 50, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k5", venueId: "kv5", venueName: "Biblioteka kod Milutina", venueAvatar: "https://picsum.photos/seed/biblioteka/100/100", distance: "4.0 km", date: new Date().toISOString(), startTime: "13:00", endTime: "21:00", role: "Konobar", pay: 32, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k6", venueId: "kv6", venueName: "Peron", venueAvatar: "https://picsum.photos/seed/peron/100/100", distance: "0.2 km", date: new Date().toISOString(), startTime: "16:00", endTime: "00:00", role: "Konobar", pay: 30, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k7", venueId: "kv7", venueName: "Porta", venueAvatar: "https://picsum.photos/seed/porta/100/100", distance: "0.6 km", date: new Date().toISOString(), startTime: "10:00", endTime: "18:00", role: "Barista", pay: 28, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k8", venueId: "kv8", venueName: "Zeleni Zeleni", venueAvatar: "https://picsum.photos/seed/zeleni/100/100", distance: "1.0 km", date: new Date().toISOString(), startTime: "12:00", endTime: "20:00", role: "Pomoćni radnik", pay: 25, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k9", venueId: "kv9", venueName: "Mademoiselle", venueAvatar: "https://picsum.photos/seed/mademoiselle/100/100", distance: "0.4 km", date: new Date().toISOString(), startTime: "08:00", endTime: "16:00", role: "Hostesa", pay: 30, status: "open", industry: "hospitality", city: "Kragujevac" },
    { id: "k10", venueId: "kv10", venueName: "Taverna", venueAvatar: "https://picsum.photos/seed/taverna/100/100", distance: "0.8 km", date: new Date().toISOString(), startTime: "18:00", endTime: "02:00", role: "Šanker", pay: 38, status: "open", industry: "hospitality", city: "Kragujevac" },
    // Healthcare
    { id: "kh1", venueId: "khv1", venueName: "UKC Kragujevac", department: "Ortopedija", venueAvatar: "https://picsum.photos/seed/ukck/100/100", distance: "1.5 km", date: new Date().toISOString(), startTime: "07:00", endTime: "15:00", role: "Medicinska sestra", pay: 50, status: "open", industry: "healthcare", city: "Kragujevac" },
    { id: "kh2", venueId: "khv2", venueName: "Dom zdravlja Kragujevac", department: "Pedijatrija", venueAvatar: "https://picsum.photos/seed/dzk/100/100", distance: "0.8 km", date: new Date().toISOString(), startTime: "08:00", endTime: "16:00", role: "Tehničar", pay: 45, status: "open", industry: "healthcare", city: "Kragujevac" },
    { id: "kh3", venueId: "khv3", venueName: "Zavod za hitnu medicinsku pomoć KG", department: "Hitna", venueAvatar: "https://picsum.photos/seed/zhmp/100/100", distance: "1.2 km", date: new Date().toISOString(), startTime: "19:00", endTime: "07:00", role: "Medicinska sestra", pay: 60, status: "open", industry: "healthcare", city: "Kragujevac" },
    { id: "kh4", venueId: "khv4", venueName: "Institut za javno zdravlje KG", department: "Laboratorija", venueAvatar: "https://picsum.photos/seed/ijz/100/100", distance: "2.0 km", date: new Date().toISOString(), startTime: "07:30", endTime: "15:30", role: "Laborant", pay: 48, status: "open", industry: "healthcare", city: "Kragujevac" }
  ];

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
