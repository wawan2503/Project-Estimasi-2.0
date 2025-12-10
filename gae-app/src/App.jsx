import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './Main/Dashboard/Dashboard'; // Dashboard Baru (Statistik)
import ProjectPage from './Main/Project/ProjectPage'; // List Project (Tabel)
import ProjectDetail from './Main/Project/ProjectDetail';
import ProjectEditPanel from './Main/Project/ProjectEditPanel';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex w-full min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-300">
          <Sidebar />
          <Routes>
            {/* Halaman Awal: Dashboard Statistik */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Halaman List Project (Dulu Dashboard) */}
            <Route path="/projects" element={<ProjectPage />} />
            
            {/* Detail Project & Edit Panel */}
            <Route path="/project-detail" element={<ProjectDetail />} />
            <Route path="/project-detail/edit/:panelId" element={<ProjectEditPanel />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;