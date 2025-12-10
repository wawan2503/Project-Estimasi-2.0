import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, ChevronRight, Edit2, Clock, Users, UserCheck, Monitor,
  MoreHorizontal, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
// Import Data dari MockData
import { projectsData, formatRupiah } from '../../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();

  // --- DATA DUMMY KHUSUS DASHBOARD (Agar sesuai gambar referensi) ---
  
  // 1. Data Recent Panels (Sesuai gambar kanan atas)
  const recentPanels = [
    { id: 1, name: 'PHT TM', spec: '20kv', price: 1200200000 },
    { id: 2, name: 'PHT TM', spec: '20kv', price: 1200200000 },
    { id: 3, name: 'PHT TM', spec: '20kv', price: 1200200000 },
    { id: 4, name: 'PHT TM', spec: '20kv', price: 1200200000 },
    { id: 5, name: 'LVMDP', spec: '380v', price: 450000000 },
  ];

  // 2. Data Recent Activities (Sesuai gambar tengah)
  const recentActivities = [
    { id: 1, user: 'Admin', action: 'Has Edit', target: 'Template', item: 'PHT TM', detail: 'Harga jadi', value: '1.200.200.000', time: '24 Nov 2025 14:23' },
    { id: 2, user: 'Admin', action: 'Menghapus', target: 'Template', item: 'PHT TM', detail: '-', value: '-', time: '24 Nov 2025 14:20' },
    { id: 3, user: 'Admin', action: 'Mengedit', target: 'Template', item: 'PHT TM', detail: 'Harga jadi', value: '1.200.200.000', time: '24 Nov 2025 14:15' },
    { id: 4, user: 'Wawan', action: 'Created', target: 'Project', item: 'Ehouse', detail: 'New Job', value: 'E6-2117', time: '24 Nov 2025 10:00' },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Hello Wawan <span className="text-2xl">👋,</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back to your dashboard.</p>
        </div>
        <button 
          onClick={() => navigate('/projects')}
          className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-800/20 transition active:scale-95"
        >
          New Projects <Plus size={18} className="bg-white/20 rounded-full p-0.5" />
        </button>
      </div>

      {/* --- ROW 1: SPLIT TABLES (PROJECTS & PANELS) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        
        {/* LEFT CARD: RECENT PROJECTS (Data Real dari mockData) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Recent Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 bg-slate-100/50 dark:bg-slate-800 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">Job No</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projectsData.slice(0, 5).map((project) => ( // Ambil 5 project teratas
                  <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors cursor-pointer" onClick={() => navigate('/project-detail')}>
                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">{project.jobNo}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-white">{project.namaProject}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{project.customer}</td>
                    <td className="px-5 py-3.5 text-right">
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors"/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT CARD: RECENT PANELS (Sesuai Desain Gambar) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Recent Panels</h3>
            <MoreHorizontal size={18} className="text-slate-400 cursor-pointer hover:text-slate-600"/>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 bg-slate-100/50 dark:bg-slate-800 dark:text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">Spesifikasi</th>
                  <th className="px-5 py-3 font-semibold">Harga</th>
                  <th className="px-5 py-3 font-semibold text-center">Act</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentPanels.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{p.spec}</td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-mono text-xs">{formatRupiah(p.price)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 mx-auto cursor-pointer hover:bg-orange-100 transition-colors">
                        <Edit2 size={14} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ROW 2: RECENT ACTIVITIES --- */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Recent Activities</h3>
          <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
             <Clock size={16} className="text-slate-400"/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium w-24">{act.user}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 w-32">
                    <span className={`px-2 py-1 rounded text-xs ${act.action === 'Menghapus' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {act.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 w-32">{act.target}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-bold w-40">{act.item}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{act.detail}</td>
                  <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300 font-medium">{act.value}</td>
                  <td className="px-6 py-4 text-right text-slate-400 text-xs">{act.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ROW 3: STATISTICS CARDS (Modern Style) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <Users size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Customers</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">5,423</h3>
            <p className="text-green-600 text-xs font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight size={14}/> 16% <span className="text-slate-400 font-normal">this month</span>
            </p>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Members</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">1,893</h3>
            <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1">
              <ArrowDownRight size={14}/> 1% <span className="text-slate-400 font-normal">this month</span>
            </p>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
            <Monitor size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Now</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">189</h3>
            <div className="flex -space-x-2">
               {[1,2,3,4].map(i => (
                 <img key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800" src={`https://i.pravatar.cc/150?img=${i+12}`} alt="user"/>
               ))}
               <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 text-[10px] flex items-center justify-center font-bold text-slate-500">+5</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;