import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Box, Package, Briefcase, Users, HelpCircle, 
  LogOut, Moon, Sun, ChevronRight, X
} from 'lucide-react';
import { GAE_LOGO_URL } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Daftar Menu Navigasi
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={19}/>, label: 'Dashboard' },
    { path: '/material', icon: <Box size={19}/>, label: 'Material' },
    { path: '/product', icon: <Package size={19}/>, label: 'Product' },
    { path: '/projects', icon: <Briefcase size={19}/>, label: 'Project' }, // Ini mengarah ke List Project
    { path: '/customers', icon: <Users size={19}/>, label: 'Customers' },
  ];

  // Fungsi untuk mengecek menu mana yang aktif
  const isMenuActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    // Khusus menu Project: Aktif jika di halaman /projects ATAU /project-detail (detail/edit)
    if (path === '/projects' && (location.pathname === '/projects' || location.pathname.includes('/project-detail'))) return true;
    // Default logic
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <>
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen flex flex-col justify-between border-r transition-all duration-300 font-sans
        bg-white border-slate-200 text-slate-600
        dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        
        {/* --- 1. HEADER (LOGO) --- */}
        <div>
          <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded border border-slate-100 dark:border-slate-700">
                 <img src={GAE_LOGO_URL} alt="GAE Logo" className="h-8 w-auto" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">SYSTEM</h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold">Enterprise Resource</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- 2. MENU NAVIGASI --- */}
          <div className="px-3 mt-6">
            <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">Main Menu</p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <div 
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group font-medium text-sm mb-1
                    ${isMenuActive(item.path)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'  // Active State
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200' // Inactive State
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={isMenuActive(item.path) ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isMenuActive(item.path) && <ChevronRight size={16} className="text-blue-400/50"/>}
                </div>
              ))}
            </nav>
          </div>

          {/* --- 3. MENU SUPPORT (STATIC) --- */}
          <div className="px-3 mt-8">
            <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3">System</p>
            <nav className="space-y-1">
               <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 text-sm font-medium">
                  <HelpCircle size={19} className="text-slate-400 group-hover:text-slate-600"/>
                  <span>Help Center</span>
               </div>
            </nav>
          </div>
        </div>

        {/* --- 4. FOOTER (DARK MODE & USER) --- */}
        <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">
          
          {/* Toggle Dark Mode */}
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              {theme === 'light' ? <Sun size={16} className="text-orange-500"/> : <Moon size={16} className="text-blue-400"/>}
              <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            {/* Switch UI */}
            <div className={`w-9 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${theme === 'dark' ? 'left-5' : 'left-1'}`}></div>
            </div>
          </button>

          {/* User Profile */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
            <img src="https://i.pravatar.cc/150?img=60" alt="User" className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-600"/>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-800 dark:text-white truncate">Wawan</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Project Manager</p>
            </div>
            <button className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
              <LogOut size={18}/>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;