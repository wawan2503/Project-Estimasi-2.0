import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Clock, Package, Layers, Briefcase, Box, Trash2, PlusCircle } from 'lucide-react';
import { projectsData, masterComponents, masterPanels, formatRupiah, calculateProjectTotal } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';

const Dashboard = ({ setSidebarOpen }) => {
  const navigate = useNavigate();

  const totalProjects = projectsData.length;
  const totalMaterials = masterComponents.length;
  const totalPanels = masterPanels.length;
  const totalProjectValue = projectsData.reduce((sum, p) => sum + calculateProjectTotal(p), 0);

  // Recent Activities (sample data)
  const recentActivities = [
    { id: 1, user: 'Wawan', action: 'Created', type: 'project', target: 'Ehouse', detail: 'Job No: E6-2117', time: '2 hours ago', color: 'green' },
    { id: 2, user: 'Admin', action: 'Updated', type: 'material', target: 'MCCB', detail: 'Price changed', time: '3 hours ago', color: 'blue' },
    { id: 3, user: 'Admin', action: 'Added', type: 'panel', target: 'PHB TM OUTGOING', detail: '2 materials added', time: '5 hours ago', color: 'purple' },
    { id: 4, user: 'Wawan', action: 'Deleted', type: 'material', target: 'Old Component', detail: 'Removed from database', time: '1 day ago', color: 'red' },
    { id: 5, user: 'Admin', action: 'Updated', type: 'project', target: 'Ehouse', detail: 'Panel qty changed', time: '1 day ago', color: 'blue' },
  ];

  const getActionIcon = (action) => {
    switch (action) {
      case 'Created': return <PlusCircle size={14} />;
      case 'Updated': return <Edit2 size={14} />;
      case 'Added': return <PlusCircle size={14} />;
      case 'Deleted': return <Trash2 size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getActionColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Dashboard" />
      
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Hello Wawan 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back to your dashboard.</p>
          </div>
          <button onClick={() => navigate('/projects')}
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg">
            <Plus size={18} /> New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalProjects}</p>
                <p className="text-xs text-slate-500">Projects</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Package size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalMaterials}</p>
                <p className="text-xs text-slate-500">Materials</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Layers size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalPanels}</p>
                <p className="text-xs text-slate-500">Panels</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Box size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{formatRupiah(totalProjectValue)}</p>
                <p className="text-xs text-slate-500">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 mb-6">
          
          {/* Recent Projects */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Recent Projects</h3>
              <button onClick={() => navigate('/projects')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50 dark:bg-slate-800 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Job No</th>
                    <th className="px-4 py-3 text-left font-semibold">Project</th>
                    <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Customer</th>
                    <th className="px-4 py-3 text-right font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {projectsData.slice(0, 5).map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate('/project-detail')}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{project.jobNo}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{project.namaProject}</td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{project.customer}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatRupiah(calculateProjectTotal(project))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-slate-400" /> Recent Activities
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(activity.color)}`}>
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-white">
                      <span className="font-semibold">{activity.user}</span>
                      <span className="text-slate-500"> {activity.action.toLowerCase()} </span>
                      <span className="font-semibold">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Panels & Materials */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          
          {/* Product Panels */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Product Panels</h3>
              <button onClick={() => navigate('/product')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50 dark:bg-slate-800 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Panel Name</th>
                    <th className="px-4 py-3 text-center font-semibold">Items</th>
                    <th className="px-4 py-3 text-right font-semibold">Base Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {masterPanels.map((panel) => (
                    <tr key={panel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate('/product')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Layers size={16} className="text-purple-600" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white">{panel.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium">{panel.defaultMaterials.length}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatRupiah(panel.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Material Database</h3>
              <button onClick={() => navigate('/material')} className="text-xs font-semibold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50 dark:bg-slate-800 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Item</th>
                    <th className="px-4 py-3 text-left font-semibold">Brand</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {masterComponents.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate('/material')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Package size={16} className="text-blue-600" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-white">{mat.item}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{mat.brand}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {mat.currency === 'USD' && mat.internationalPrice > 0 ? `$${mat.internationalPrice}` : formatRupiah(mat.localPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
