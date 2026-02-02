import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Layers, Briefcase } from 'lucide-react';
import MobileHeader from '../../components/MobileHeader';
import { api } from '../../lib/api';
import { calculateProjectTotal, formatRupiah } from '../../data/mockData';

const Dashboard = ({ setSidebarOpen }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [productPanels, setProductPanels] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [projectsRes, materialsRes, panelsRes] = await Promise.all([
          api.get('/api/projects?includeDetails=1'),
          api.get('/api/materials?limit=50&offset=0'),
          api.get('/api/product-panels?includeMaterials=1')
        ]);
        setProjects(projectsRes.data || []);
        setMaterials(materialsRes.data || []);
        setProductPanels(panelsRes.data || []);
      } finally {
        setLoading(false);
      }
    })().catch((e) => alert(e.message));
  }, []);

  const totalProjects = projects.length;
  const totalMaterials = materials.length;
  const totalPanels = productPanels.length;
  const totalProjectValue = useMemo(() => projects.reduce((sum, p) => sum + calculateProjectTotal(p), 0), [projects]);

  const recentProjects = projects.slice(0, 5);
  const recentMaterials = materials.slice(0, 5);
  const recentPanels = productPanels.slice(0, 5);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Dashboard" />

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">{loading ? 'Loading...' : 'Data from Supabase'}</p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Briefcase size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '…' : totalProjects}</p>
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
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '…' : totalMaterials}</p>
                <p className="text-xs text-slate-500">Materials (sample)</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Layers size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '…' : totalPanels}</p>
                <p className="text-xs text-slate-500">Product Panels</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Briefcase size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{loading ? '…' : formatRupiah(totalProjectValue)}</p>
                <p className="text-xs text-slate-500">Total Project Value</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-white">Recent Projects</h3>
              <button onClick={() => navigate('/projects')} className="text-xs font-semibold text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50 dark:bg-slate-800 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Project</th>
                    <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Customer</th>
                    <th className="px-4 py-3 text-right font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{project.namaProject}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{project.customer || '-'}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">{formatRupiah(calculateProjectTotal(project))}</td>
                    </tr>
                  ))}
                  {!loading && recentProjects.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-10 text-center text-slate-400">
                        No projects
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white">Product Panels</h3>
                <button onClick={() => navigate('/product')} className="text-xs font-semibold text-blue-600 hover:underline">
                  View All
                </button>
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
                    {recentPanels.map((panel) => (
                      <tr key={panel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate('/product')}>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{panel.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium">{(panel.defaultMaterials || []).length}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatRupiah(panel.price || 0)}</td>
                      </tr>
                    ))}
                    {!loading && recentPanels.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-10 text-center text-slate-400">
                          No panels
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white">Material Database</h3>
                <button onClick={() => navigate('/material')} className="text-xs font-semibold text-blue-600 hover:underline">
                  View All
                </button>
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
                    {recentMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate('/material')}>
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{mat.item}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{mat.brand}</td>
                        <td className="px-4 py-3 text-right font-medium">{mat.currency === 'USD' && mat.internationalPrice > 0 ? formatRupiah(mat.internationalPrice * 16000) : formatRupiah(mat.localPrice || 0)}</td>
                      </tr>
                    ))}
                    {!loading && recentMaterials.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-10 text-center text-slate-400">
                          No materials
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

