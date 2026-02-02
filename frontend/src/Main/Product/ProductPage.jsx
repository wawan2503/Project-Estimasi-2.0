import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ChevronDown, ChevronRight, X, Save, Box, Layers } from 'lucide-react';
import { formatRupiah, formatUSD } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';
import ProductMaterialTable from './ProductMaterialTable';
import { api } from '../../lib/api';

const KURS_USD = 16000;

const PanelMaterialsView = ({ panel, calculateRow }) => {
  return (
    <ProductMaterialTable materials={panel.defaultMaterials || []} calculateRow={calculateRow} formatRupiah={formatRupiah} formatUSD={formatUSD} />
  );
};

const ProductPage = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPanels, setExpandedPanels] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const emptyForm = { name: '', price: 0 };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/product-panels?includeMaterials=1');
        setPanels(res.data || []);
      } finally {
        setLoading(false);
      }
    })().catch((e) => alert(e.message));
  }, []);

  const toggleExpand = (id) => setExpandedPanels((prev) => ({ ...prev, [id]: !prev[id] }));

  const openAddModal = () => {
    setEditingPanel(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleEditPanel = (panelId) => navigate(`/product/edit/${panelId}`);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPanel(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      if (editingPanel?.id) {
        const res = await api.patch(`/api/product-panels/${editingPanel.id}`, formData);
        const updated = res.data;
        setPanels((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      } else {
        const res = await api.post('/api/product-panels', formData);
        const created = res.data;
        setPanels((prev) => [{ ...created, defaultMaterials: [] }, ...prev]);
      }
      closeModal();
    })().catch((err) => alert(err.message));
  };

  const handleDeletePanel = (id) => {
    if (!confirm('Delete this panel?')) return;
    api
      .delete(`/api/product-panels/${id}`)
      .then(() => setPanels((prev) => prev.filter((p) => p.id !== id)))
      .catch((err) => alert(err.message));
  };

  const calculateRow = (mat) => {
    const disc = mat.diskon || 0;
    const factor = mat.factor || 1;
    const qty = mat.qty || 1;
    const priceAfterDiscUSD = (mat.internationalPrice || 0) * (1 - disc / 100) * factor;
    const priceBecomeIDR = priceAfterDiscUSD * KURS_USD;
    const priceAfterDiscIDR = (mat.localPrice || 0) * (1 - disc / 100) * factor;
    const basePrice = priceBecomeIDR > 0 ? priceBecomeIDR : priceAfterDiscIDR;
    const priceAfterManHour = basePrice + (mat.manHour || 0);
    const totalPrice = priceAfterManHour * qty;
    return { priceAfterDiscUSD, priceBecomeIDR, priceAfterDiscIDR, priceAfterManHour, totalPrice };
  };

  const calculatePanelPrice = (panel) => {
    const mats = panel.defaultMaterials || [];
    if (!mats.length) return panel.price || 0;
    return mats.reduce((sum, mat) => sum + calculateRow(mat).totalPrice, 0);
  };

  const filteredPanels = useMemo(() => panels.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())), [panels, searchTerm]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Products" />

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <Layers size={28} className="text-purple-600" /> Product Panels
              </h1>
              <p className="text-slate-500 text-sm mt-1">{loading ? 'Loading...' : `${filteredPanels.length} of ${panels.length} panels`}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <div className="relative flex-1 sm:w-[250px]">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={18} /> <span className="sm:inline">Add Panel</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-4 lg:px-6 py-6 space-y-4">
          <div className="max-w-full xl:max-w-7xl mx-auto space-y-4">
            {filteredPanels.map((panel) => (
              <div key={panel.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div
                  className="px-3 sm:px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => toggleExpand(panel.id)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                      <Box size={20} className="text-white sm:hidden" />
                      <Box size={24} className="text-white hidden sm:block" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-white truncate">{panel.name}</h3>
                      <span className="text-xs sm:text-sm text-slate-500">
                        {(panel.defaultMaterials || []).length} items • {formatRupiah(calculatePanelPrice(panel))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPanel(panel.id);
                      }}
                      className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePanel(panel.id);
                      }}
                      className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                    {expandedPanels[panel.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {expandedPanels[panel.id] && <PanelMaterialsView panel={panel} calculateRow={calculateRow} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingPanel ? <Edit2 size={22} className="text-orange-500" /> : <Layers size={22} className="text-purple-600" />}
                {editingPanel ? 'Edit Panel' : 'Add Panel'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Panel Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Base Price (IDR)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"
                />
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 ${
                    editingPanel ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <Save size={18} /> {editingPanel ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;

