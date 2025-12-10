import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronRight, Activity } from 'lucide-react';
import { projectsData, formatRupiah } from '../../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 h-screen overflow-y-auto font-sans transition-colors duration-300
      bg-slate-50 dark:bg-slate-950">
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-10 pb-16 transition-colors">
        <div className="max-w-[1400px] mx-auto flex justify-between items-end">
          <div>
             <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Hello, Wawan 👋</h1>
             <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
               <Activity size={16} className="text-blue-500"/> 
               System Status: <span className="text-green-600 dark:text-green-400 font-bold text-sm bg-green-100 dark:bg-green-900/30 px-2 rounded-full">Optimal</span>
             </p>
          </div>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-700/20 flex items-center gap-2 transition-transform hover:-translate-y-0.5">
            <Plus size={20} strokeWidth={3} /> New Project
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-8 max-w-[1400px] mx-auto -mt-8">
        
        {/* Search Bar Card */}
        <div className="p-5 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors
          bg-white border border-slate-200/80 
          dark:bg-slate-900 dark:border-slate-800">
          
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Projects</h2>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total <strong>{projectsData.length}</strong> active jobs</span>
          </div>
          
          <div className="relative w-full md:w-[400px]">
            <input 
              type="text" 
              placeholder="Search by Job No..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all
                bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20
                dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-xl shadow-sm overflow-hidden mb-10 transition-colors
          bg-white border border-slate-200 
          dark:bg-slate-900 dark:border-slate-800">
          
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b transition-colors
                bg-slate-50/60 border-slate-200
                dark:bg-slate-800/50 dark:border-slate-700">
                {['Job No', 'Project Name', 'Customer', 'Total Value', 'Creator', 'Last Update', 'Action'].map((head) => (
                  <th key={head} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider
                    text-blue-800 dark:text-blue-400">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projectsData.map((project) => (
                <tr key={project.id} className="transition-colors group
                  hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold px-2 py-1 rounded border
                      text-blue-700 bg-blue-50 border-blue-100
                      dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-800">
                      {project.jobNo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-base text-slate-800 dark:text-slate-200">{project.namaProject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                        bg-slate-100 text-slate-600
                        dark:bg-slate-800 dark:text-slate-300">
                        {project.customer.charAt(0)}
                      </div>
                      {project.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{formatRupiah(project.harga)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        {project.pembuat.charAt(0)}
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-slate-700 dark:text-slate-300">{project.pembuat.split(' ')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500">
                    {project.lastEditDate}
                  </td>
                  <td className="px-6 py-4">
                     <button 
                        onClick={() => navigate('/project-detail')}
                        className="p-2 rounded-lg transition-colors border border-transparent
                          text-blue-600 hover:bg-blue-50 hover:border-blue-100
                          dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:border-blue-800"
                     >
                       <ChevronRight size={20} strokeWidth={2.5} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t flex items-center justify-between text-sm font-medium
            border-slate-100 bg-slate-50/30 text-slate-500
            dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
            <span>Showing 1-5 of 68</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded transition-colors
                bg-white border-slate-200 hover:bg-slate-50
                dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">Prev</button>
              <button className="px-3 py-1 bg-blue-700 text-white rounded shadow-sm">1</button>
              <button className="px-3 py-1 border rounded transition-colors
                bg-white border-slate-200 hover:bg-slate-50
                dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">2</button>
              <button className="px-3 py-1 border rounded transition-colors
                bg-white border-slate-200 hover:bg-slate-50
                dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;