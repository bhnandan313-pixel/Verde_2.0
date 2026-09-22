# 🌿 Verde 2.0 — Dairy Packaging Recommendation System

Verde 2.0 is a **Smart India Hackathon (SIH)** project that helps dairy manufacturers select the optimal packaging material for their products. It runs a deterministic multi-criteria matching engine on the backend and presents results — best pick, budget pick, premium pick, supplier sourcing, and a failure matrix — through a polished React dashboard on the frontend.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Packaging Engine** | Filters & scores materials against OTR, WVTR, pH, moisture, phase-state, MOQ, and cost constraints |
| **Three-Pick Recommendation** | Returns Best Pick, Budget Choice, and Premium Choice for every product |
| **Failure Matrix** | Explains exactly why each rejected material failed |
| **Supplier Sourcing** | Ranks verified manufacturers by tier, MOQ fit, lead time, and certifications |
| **Advanced Filters** | User can constrain by max MOQ, max cost, and recyclable-only |

---

## 🏗️ Architecture

```
Verde_2.0/
├── backend/                  # Python · Flask REST API
│   ├── app.py                # Route definitions & API entry point
│   ├── requirements.txt      # Python dependencies
│   ├── services/
│   │   ├── engine.py         # Deterministic packaging recommendation engine
│   │   └── sourcing.py       # Supplier matching & ranking logic
│   ├── repository/
│   │   └── json_db.py        # JSON file-based data access layer
│   └── data/
│       ├── dairy_products.json      # Dairy product catalogue
│       ├── packaging_materials.json # Available packaging materials
│       └── manufacturers.json       # Supplier / manufacturer database
│
└── frontend/                 # React · Vite · Tailwind CSS
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           # Root component & routing
        ├── pages/
        │   ├── InputEngine.jsx   # Product selection & filter form
        │   ├── ResultsDash.jsx   # Recommendation results dashboard
        │   ├── SourcingDash.jsx  # Supplier sourcing dashboard
        │   └── AdvancedPage.jsx  # Advanced filter options
        ├── components/ui/    # Reusable UI components (Button, Card, Badge …)
        ├── services/         # Axios API client wrappers
        └── store/            # Zustand global state
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Runtime |
| **Flask 3.0** | REST API framework |
| **Flask-CORS** | Cross-Origin Resource Sharing |
| **JSON files** | Lightweight data store (no DB required) |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router 6** | Client-side routing |
| **Zustand** | Lightweight global state management |
| **Axios** | HTTP client |
| **Framer Motion / GSAP** | Animations |

---

## 🌐 API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Liveness probe |
| `GET` | `/api/products` | List all dairy products |
| `GET` | `/api/products/<id>` | Get a single product by ID |
| `GET` | `/api/materials` | List all packaging materials |
| `POST` | `/api/recommend` | Run the packaging recommendation engine |
| `POST` | `/api/sourcing` | Find & rank suppliers for a material |

### POST `/api/recommend` — Request Body
```json
{
  "product_id":      "whole_milk",
  "max_moq":         10000,
  "max_cost":        0.50,
  "recyclable_only": false
}
```

### POST `/api/sourcing` — Request Body
```json
{
  "material_id": "multilayer_pouch",
  "user_moq":    10000,
  "max_tier":    2
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
