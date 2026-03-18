import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  let categories = [
    { id: 1, nom: "Antibiotiques", description: "Traitement des infections bactériennes" },
    { id: 2, nom: "Analgésiques", description: "Soulagement de la douleur" },
    { id: 3, nom: "Vitamines", description: "Compléments alimentaires" }
  ];

  let medicaments = [
    {
      id: 1,
      nom: "Amoxicilline",
      dci: "Amoxicilline",
      categorie: 1,
      categorie_nom: "Antibiotiques",
      forme: "Gélule",
      dosage: "500mg",
      prix_achat: 20.0,
      prix_vente: 35.0,
      stock_actuel: 5,
      stock_minimum: 10,
      date_expiration: "2025-12-31",
      ordonnance_requise: true,
      est_en_alerte: true,
      est_actif: true
    },
    {
      id: 2,
      nom: "Doliprane",
      dci: "Paracétamol",
      categorie: 2,
      categorie_nom: "Analgésiques",
      forme: "Comprimé",
      dosage: "1000mg",
      prix_achat: 10.0,
      prix_vente: 15.0,
      stock_actuel: 50,
      stock_minimum: 20,
      date_expiration: "2026-06-30",
      ordonnance_requise: false,
      est_en_alerte: false,
      est_actif: true
    }
  ];

  let ventes = [
    {
      id: 1,
      reference: "VNT-20250115-001",
      date_vente: new Date().toISOString(),
      total_ttc: 15.0,
      statut: "COMPLETEE",
      lignes: [{ medicament_id: 2, quantite: 1 }]
    }
  ];

  // API Routes
  app.get("/api/v1/categories/", (req, res) => res.json(categories));
  
  app.get("/api/v1/medicaments/", (req, res) => {
    const { search, categorie } = req.query;
    let filtered = medicaments.filter(m => m.est_actif);
    if (search) {
      const searchStr = String(search).toLowerCase();
      filtered = filtered.filter(m => 
        m.nom.toLowerCase().includes(searchStr) || 
        m.dci.toLowerCase().includes(searchStr)
      );
    }
    if (categorie) {
      filtered = filtered.filter(m => m.categorie === Number(categorie));
    }
    res.json(filtered);
  });

  app.get("/api/v1/medicaments/alertes/", (req, res) => {
    res.json(medicaments.filter(m => m.est_en_alerte && m.est_actif));
  });

  app.post("/api/v1/medicaments/", (req, res) => {
    const newMed = { ...req.body, id: medicaments.length + 1, est_actif: true, est_en_alerte: req.body.stock_actuel < req.body.stock_minimum };
    const cat = categories.find(c => c.id === Number(newMed.categorie));
    newMed.categorie_nom = cat ? cat.nom : "";
    medicaments.push(newMed);
    res.status(201).json(newMed);
  });

  app.patch("/api/v1/medicaments/:id/", (req, res) => {
    const id = Number(req.params.id);
    const index = medicaments.findIndex(m => m.id === id);
    if (index !== -1) {
      medicaments[index] = { ...medicaments[index], ...req.body };
      medicaments[index].est_en_alerte = medicaments[index].stock_actuel < medicaments[index].stock_minimum;
      const cat = categories.find(c => c.id === Number(medicaments[index].categorie));
      medicaments[index].categorie_nom = cat ? cat.nom : "";
      res.json(medicaments[index]);
    } else {
      res.status(404).json({ detail: "Non trouvé" });
    }
  });

  app.delete("/api/v1/medicaments/:id/", (req, res) => {
    const id = Number(req.params.id);
    const index = medicaments.findIndex(m => m.id === id);
    if (index !== -1) {
      medicaments[index].est_actif = false;
      res.status(204).send();
    } else {
      res.status(404).json({ detail: "Non trouvé" });
    }
  });

  app.get("/api/v1/ventes/", (req, res) => res.json(ventes));

  app.post("/api/v1/ventes/", (req, res) => {
    const { lignes, notes } = req.body;
    let total = 0;
    lignes.forEach(l => {
      const med = medicaments.find(m => m.id === Number(l.medicament_id));
      if (med) {
        med.stock_actuel -= l.quantite;
        med.est_en_alerte = med.stock_actuel < med.stock_minimum;
        total += med.prix_vente * l.quantite;
      }
    });
    const newVente = {
      id: ventes.length + 1,
      reference: `VNT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(ventes.length + 1).padStart(3, "0")}`,
      date_vente: new Date().toISOString(),
      total_ttc: total,
      statut: "COMPLETEE",
      lignes,
      notes
    };
    ventes.unshift(newVente);
    res.status(201).json(newVente);
  });

  app.post("/api/v1/ventes/:id/annuler/", (req, res) => {
    const id = Number(req.params.id);
    const vente = ventes.find(v => v.id === id);
    if (vente && vente.statut !== "ANNULEE") {
      vente.statut = "ANNULEE";
      vente.lignes.forEach(l => {
        const med = medicaments.find(m => m.id === Number(l.medicament_id));
        if (med) {
          med.stock_actuel += l.quantite;
          med.est_en_alerte = med.stock_actuel < med.stock_minimum;
        }
      });
      res.json(vente);
    } else {
      res.status(400).json({ detail: "Impossible d'annuler cette vente" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
