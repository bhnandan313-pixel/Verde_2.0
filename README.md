# 🌿 Verde 2.0 — Sustainable Dairy Packaging Recommendation & Sourcing Engine

> **Smart India Hackathon (SIH) Prototype**  
> An intelligent, science-driven decision-support platform helping dairy processors, cooperatives, and artisanal brands replace single-use plastics with certified biodegradable, compostable, edible, and circular packaging materials.

---

## 📖 About The Product

Verde 2.0 tackles one of the dairy industry's most pressing environmental challenges: **eliminating single-use plastic sachets and multi-layer non-recyclable wraps without compromising food safety or shelf life.**

Dairy products are biologically active, chemically delicate foods that spoil rapidly through lipid oxidation, moisture loss/gain, or microbial proliferation. Verde 2.0 pairs deterministic packaging physics (gas barrier analysis, phase containment, food chemistry, thermal regimes) with an intuitive, modern dashboard to deliver actionable recommendations and verified supplier sourcing.

---

## ✨ Key Features & Product Modules

### 1. Deterministic Physics & Chemistry Recommendation Engine
- **Multi-Barrier Screening:** Evaluates candidate materials against strict physical thresholds for **Oxygen Transmission Rate (OTR)** in $\text{cc/m}^2/\text{day}$ and **Water Vapor Transmission Rate (WVTR)** in $\text{g/m}^2/\text{day}$.
- **Strict Phase Containment Rules:** Enforces packaging mechanics. Fluid liquid commodities (such as Liquid Milk) cannot be contained in paper wraps or porous bioplastics; when no material safely meets containment, the system displays an honest **Active R&D Notice** rather than generating unsafe recommendations.
- **Biochemical Compatibility:** Validates product pH tolerances (0–14) and moisture exposure limits (0–100%) against each material's barrier matrix.
- **Dual Environmental Controls:** Independent selectors for **Temperature Regime** (*Chilled, Ambient, Frozen*) and **Storage Purpose** (*Temporary, Long-Term, Transport, Retail Display*).

### 2. Tri-Picks Recommendation System
Every successful analysis yields three curated recommendations:
- 🏆 **Best Pick:** Optimal balance of gas barrier fit, shelf-life extension, cost, and affinity.
- 💸 **Budget Choice:** Lowest cost per unit meeting all mandatory barrier and containment criteria.
- 💎 **Premium Choice:** Maximum barrier protection and longest shelf-life extension.

### 3. Aceternity-Inspired Focus Cards & Technical Modals
- **Visual Presentation:** Fluid 3D hover effects with selective blur on adjacent cards, dynamic gradient borders, and responsive tags.
- **Deep-Dive Specifications Modal:** Click any recommendation card to inspect comprehensive technical specs: OTR/WVTR limits, base bio-source, composting standards (EN 13432, home compostable), and rated temperature limits.
- **Failure Mode Predictions:** Predicts potential physical/microbial spoilage modes if supply-chain instructions (temperature abuse or physical stress) are breached.

### 4. Transparent Material Screening Matrix
- For commodities undergoing active industry development (e.g. liquid milk), the dashboard displays:
  > **"We are researching on more materials / The materials cannot be found"**
- A **collapsible Material Screening Matrix** allows users to view every candidate material evaluated and its exact scientific rejection reason (e.g. *Phase incompatible*, *Moisture limit exceeded*, *Temperature uncertified*).

### 5. Advanced Food Chemistry & Logistics Engine (`AdvancedForm`)
Dairy manufacturers and food technologists can fine-tune or completely customize their product specifications:
- **Product Identification:** Custom Product Name input that automatically brands the output recommendation report.
- **Product Chemistry:** Moisture content (%), Fat/Oil content (%), and pH level (0–14).
- **Shelf Life & Atmosphere:** Target shelf life (days), relative humidity (%), and respiration rate (*None, Low, Medium, High*).
- **Logistics & Supply Chain:** Transportation mode (*Standard, Reefer Cold Chain, Shock-Absorbing*), Maximum MOQ ceiling, Target Unit Cost, and Strictly Recyclable/EPR toggle.

### 6. Direct Supplier Sourcing Directory
- **Verified Manufacturer Database:** Matches recommended materials with verified producers ranked by reliability score, supplier tier (Tier 1 Primary Converters, Tier 2 Regional Converters), lead time, and ISO/EPR certifications.
- **Volume Scale Detection:** Automatically identifies **Startup Scale** (directs to low-MOQ regional distributors) versus **Enterprise Scale** (directs to bulk primary converters).

### 7. Multilingual AI Packaging Assistant
- Persistent floating chat assistant fluent in 4 Indian languages:
  - 🇬🇧 **English**
  - 🇮🇳 **हिंदी (Hindi)**
  - 🇮🇳 **मराठी (Marathi)**
  - 🇮🇳 **ಕನ್ನಡ (Kannada)**
- Provides instant guidance on FSSAI packaging norms, barrier comparisons, and machinery troubleshooting.

---

## 📦 Materials in the Catalog

Verde 2.0 indexes 10 eco-friendly packaging materials formulated for dairy applications:

| ID | Material Name | Category | Base Bio-Source | OTR ($\text{cc/m}^2/\text{day}$) | WVTR ($\text{g/m}^2/\text{day}$) | Typical Applications |
|---|---|---|---|---|---|---|
| **M001** | Kraft Paper | Eco-Friendly | Kraft pulp + natural bio-wax | 250.0 | 35.0 | Butter, paneer, khoa, firm cheese |
| **M002** | Moulded Bagasse Pulp | Biodegradable | Sugarcane bagasse fibre | 2000.0 | 600.0 | Paneer trays, cheese cube trays |
| **M003** | PLA Film | Compostable Plastic | Fermented plant starch | 600.0 | 22.0 | Cheese wrap, yogurt cups, curd |
| **M004** | Metallized PLA Film | Compostable Plastic | Vacuum-metallized PLA | 40.0 | 4.0 | Ghee sachets, milk powder, paneer pouch |
| **M005** | PBAT/PLA Blend Film | Compostable Plastic | PLA + PBAT copolymer | 2500.0 | 100.0 | Curd pouches, fresh cheese wraps |
| **M006** | Cellulose Film | Biodegradable | Regenerated plant cellulose | 5.0 | 95.0 | Cheese aging wraps, table butter |
| **M007** | Whey Protein Edible Film | Edible | Dairy whey protein isolate | 18.5 | 865.8 | Cheese blocks, paneer slice interleaves |
| **M008** | Chitosan Edible Film | Edible | Chitin-derived chitosan | 4.5 | 550.0 | Antimicrobial paneer and cheese coating |
| **M009** | Rice Starch-Beeswax Film | Edible | Rice starch + beeswax bilayer | 30.0 | 180.0 | Paneer, khoa, butter wrapping |
| **M010** | Zein Coating | Edible | Corn gluten prolamine | 8.0 | 240.0 | Hard cheese protective rinds |

---

## 🥛 Supported Dairy Commodities

| ID | Product Name | Phase State | Moisture (%) | pH | Shelf Life | Barrier Class Required |
|---|---|---|---|---|---|---|
| **liquid_milk** | Liquid Milk | Liquid | 87.5% | 6.7 | 14 days | High (Fluid hermetic containment) |
| **paneer** | Paneer | Solid | 55.0% | 6.4 | 7 days | High |
| **ghee** | Ghee | Liquid (Oil) | 0.5% | 6.5 | 270 days | Very High |
| **cheddar_cheese** | Cheddar Cheese | Solid | 37.0% | 5.2 | 180 days | Very High |
| **greek_yogurt** | Greek Yogurt | Paste | 80.0% | 4.0 | 21 days | High |
| **dahi_curd** | Dahi / Curd | Paste | 85.0% | 4.2 | 10 days | High |
| **table_butter** | Table Butter | Solid | 16.0% | 6.3 | 90 days | Very High |
| **mozzarella_cheese** | Mozzarella Cheese | Solid | 52.0% | 5.3 | 30 days | Very High |
| **uht_cream** | UHT Cream | Liquid | 65.0% | 6.6 | 180 days | Very High |
| **whole_milk_powder** | Whole Milk Powder | Solid (Powder) | 3.5% | 6.8 | 365 days | Ultra High |

---

## 🏗️ Architecture

```
Verde_2.0/
├── backend/                  # Python · Flask REST API
│   ├── app.py                # REST endpoints, parameter validation & response formatting
│   ├── requirements.txt      # Python dependencies
│   ├── services/
│   │   ├── engine.py         # Multi-criteria packaging recommendation & failure evaluation
│   │   └── sourcing.py       # Supplier matching, tier ranking & volume scoring
│   ├── repository/
│   │   └── json_db.py        # High-performance JSON-based repository
│   └── data/
│       ├── dairy_products.json      # Dairy product chemistry & baseline thresholds
│       ├── packaging_materials.json # 10 eco-friendly packaging materials with full specs
│       └── manufacturers.json       # Verified supplier & converter directory
│
└── frontend/                 # React · Vite · Tailwind CSS
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           # Client-side routing & ChatDock inclusion
        ├── pages/
        │   ├── InputEngine.jsx   # Product gallery, thermal/storage selectors, advanced drawer
        │   ├── ResultsDash.jsx   # Aceternity focus cards, modal specs, screening matrix
        │   ├── SourcingDash.jsx  # Supplier directory with volume tiering & direct RFQ
        │   └── AdvancedPage.jsx  # Standalone advanced chemistry specification form
        ├── components/
        │   ├── ui/           # Buttons, ExpandOnHover, Aceternity focus cards, ChatDock
        │   └── dashboard/    # Reusable dashboard panels & risk matrices
        ├── services/
        │   └── api.js        # Axios API client connecting to Flask
        └── store/
            └── useEngineStore.js # Zustand store persisting selections & API results
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Fast, reliable computational backend |
| **Flask 3.0** | Lightweight RESTful microframework |
| **Flask-CORS** | Cross-Origin Resource Sharing for seamless Vite integration |
| **JSON Flat Database** | Zero-dependency, portable dataset architecture |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Declarative component framework |
| **Vite 5** | Lightning-fast build tool and HMR dev server |
| **Tailwind CSS 3** | Utility-first styling with custom dark-mode aesthetics |
| **Framer Motion** | Physics-based animations, modal transitions, and focus effects |
| **Zustand** | Centralized, persisted application state |
| **Axios** | HTTP communication with backend API |
| **React Router 6** | SPA routing between Input, Results, Advanced, and Sourcing pages |

---

## 🌐 API Reference

All backend endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & liveness probe |
| `GET` | `/api/products` | Retrieve all 10 baseline dairy products |
| `GET` | `/api/products/<id>` | Retrieve single product chemistry details |
| `GET` | `/api/materials` | Retrieve all indexed packaging materials |
| `POST` | `/api/recommend` | Execute deterministic packaging recommendation |
| `POST` | `/api/sourcing` | Find and rank verified suppliers for a material |

### `POST /api/recommend` — Request Body
```json
{
  "product_id": "paneer",
  "product_name": "Artisanal Buffalo Paneer",
  "storage_type": "Transport",
  "temperature_condition": "Chilled Storage",
  "moisture_content": 52.0,
  "fat_content": 22.0,
  "ph_level": 6.3,
  "desired_shelf_life": 14,
  "relative_humidity": 80,
  "respiration_rate": "none",
  "transportation_conditions": "reefer",
  "max_moq": 10000,
  "max_cost": 0.50,
  "recyclable_only": true
}
```

### `POST /api/recommend` — Sample Success Response Shape
```json
{
  "product": {
    "id": "paneer",
    "name": "Artisanal Buffalo Paneer",
    "moisture_content": 52.0,
    "pH": 6.3,
    "phase_state": "solid"
  },
  "best_pick": {
    "id": "M004",
    "name": "Metallized PLA Film",
    "badge": "Best Pick",
    "score": 0.942,
    "cost_per_kg": 0.48,
    "otr": 40.0,
    "wvtr": 4.0,
    "is_recyclable": true
  },
  "budget_pick": { "id": "M001", "name": "Kraft Paper", "badge": "Budget Choice" },
  "premium_pick": { "id": "M004", "name": "Metallized PLA Film", "badge": "Premium Choice" },
  "suppliers": [ ... ],
  "failure_matrix": [ ... ]
}
```

---

## ⚙️ Setup Guide (VS Code)

### Prerequisites

Make sure the following are installed on your machine:

- [Node.js 18+](https://nodejs.org/) (includes `npm`)
- [Python 3.10+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

---

### Recommended VS Code Extensions

Install these for the best development experience:

| Extension | ID |
|---|---|
| **Python** | `ms-python.python` |
| **Pylance** | `ms-python.vscode-pylance` |
| **ES7+ React/Redux Snippets** | `dsznajder.es7-react-js-snippets` |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` |
| **Prettier** | `esbenp.prettier-vscode` |
| **GitLens** | `eamodio.gitlens` |

> **Tip:** Open the Extensions panel with `Ctrl+Shift+X` and search by name or ID.

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Verde_2.0
```

---

### 2. Open in VS Code

```bash
code .
```

Or: **File → Open Folder** and select the `Verde_2.0` folder.

---

### 3. Set Up the Backend (Python / Flask)

Open a **new terminal** in VS Code (`Ctrl+` ` `) and run:

```bash
# Navigate to backend
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (CMD):
.\venv\Scripts\activate.bat

# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend will start at: **`http://localhost:5000`**

> **Note:** If you get an execution policy error on PowerShell, run:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

### 4. Set Up the Frontend (React / Vite)

Open a **second terminal** in VS Code (`Ctrl+Shift+` `) and run:

```bash
# Navigate to frontend
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite dev server
npm run dev
```

The frontend will start at: **`http://localhost:5173`**

> **Important:** The backend **must be running** before you use the frontend — all recommendation and sourcing calls go to `http://localhost:5000/api/...`.

---

### 5. Verify Everything Works

1. Open your browser and visit `http://localhost:5173`
2. You should see the Verde 2.0 input form.
3. Select a dairy product and click **Recommend** — results should load from the backend.
4. You can also test the API directly:
   ```
   http://localhost:5000/api/health    → { "status": "ok" }
   http://localhost:5000/api/products  → [ ... list of products ... ]
   ```

---

### 6. VS Code Workspace Tips

**Split terminals** — run both servers side-by-side:
- Click the **Split Terminal** icon in the terminal panel to run backend and frontend in parallel.

**Configure Python interpreter:**
1. Press `Ctrl+Shift+P` → **Python: Select Interpreter**
2. Choose the interpreter inside `backend/venv/`

**Auto-format on save:**
Add to your VS Code `settings.json` (`Ctrl+Shift+P` → *Open User Settings JSON*):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  }
}
```

---

## 🚨 Troubleshooting

| Problem | Fix |
|---|---|
| `'vite' is not recognized` | Run `npm install` inside the `frontend/` folder first |
| `ModuleNotFoundError: flask` | Activate the virtual environment before running `python app.py` |
| CORS errors in browser | Ensure the Flask server is running on port `5000` |
| Port `5173` already in use | Stop other Vite processes or change the port in `vite.config.js` |
| PowerShell `activate` blocked | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |

---

## 📄 License

This project was built for the **Smart India Hackathon (SIH)**. All rights reserved.
