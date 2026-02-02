# GAE Enterprise System (ERP Dashboard)

A modern, responsive Enterprise Resource Planning (ERP) dashboard designed for managing electrical engineering projects, panel breakdowns, and material components. Built with **React**, **Vite**, and **Tailwind CSS**.

![Dashboard Preview](./public/dashboard-preview.jpg)
*(Note: Upload screenshot of your dashboard here)*

## 🚀 Features

### 1. Interactive Dashboard
- Real-time statistics (Customers, Members, Active Status).
- Recent project and activity feeds.
- Modern card-based layout with hover effects.

### 2. Project Management
- List view of all ongoing projects with status and value indicators.
- **Search & Filter:** Real-time filtering by project attributes.
- **Dark/Light Mode:** Fully supported theme toggling via Context API.

### 3. Advanced Panel Editor (The Core Feature)
- **Cascading Dropdown Filters:** Smart filtering logic for components (Item → Brand → Series → Spec).
  - *Example:* Selecting "MCB" only shows Brands that sell MCBs. Selecting "Schneider" only shows Series belonging to Schneider.
- **Auto-Fill Specifications:** Automatically retrieves detail specs, prices, and units from Master Data upon selection.
- **Searchable Master Data:** Add new items by searching the master database with keywords.
- **Nested & Progressive Tables:** View panel details in levels (Summary → Pricing → Logistics → Status).

## 🛠️ Tech Stack

- **Frontend Framework:** [React.js](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)

## 📂 Project Structure

```bash
src/
├── components/          # Reusable UI components
│   └── Sidebar.jsx      # Responsive Navigation Sidebar
├── context/
│   └── ThemeContext.jsx # Dark/Light mode logic
├── data/
│   └── mockData.js      # Simulated Database (Projects, Master Components)
├── Main/
│   ├── Dashboard/       # Dashboard Analytics View
│   │   └── Dashboard.jsx
│   └── Project/         # Project Management Modules
│       ├── ProjectPage.jsx      # Project List Table
│       ├── ProjectDetail.jsx    # Panel Breakdown View
│       └── ProjectEditPanel.jsx # Advanced Item Editor with Filtering
├── App.jsx              # Main Router Setup
└── index.css            # Tailwind Imports