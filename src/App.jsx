import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './Main/Dashboard/Dashboard';
import ProjectPage from './Main/Project/ProjectPage';
import ProjectDetail from './Main/Project/ProjectDetail';
import ProjectEditPanel from './Main/Project/ProjectEditPanel';
import MaterialPage from './Main/Material/MaterialPage';
import ProductPage from './Main/Product/ProductPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex w-full min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex-1 lg:ml-0">
            <Routes>
              <Route path="/" element={<Dashboard setSidebarOpen={setSidebarOpen} />} />
              <Route path="/material" element={<MaterialPage setSidebarOpen={setSidebarOpen} />} />
              <Route path="/product" element={<ProductPage setSidebarOpen={setSidebarOpen} />} />
              <Route path="/projects" element={<ProjectPage setSidebarOpen={setSidebarOpen} />} />
              <Route path="/project-detail" element={<ProjectDetail setSidebarOpen={setSidebarOpen} />} />
              <Route path="/project-detail/edit/:panelId" element={<ProjectEditPanel setSidebarOpen={setSidebarOpen} />} />
            </Routes>
          </div>
          
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;