import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Package, ChevronDown, ChevronRight, X, Save, Box, Layers } from 'lucide-react';
import { masterPanels, masterComponents, formatRupiah, formatUSD } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';

const KURS_USD = 16000;

const ProductPage = ({ setSidebarOpen }) => {
  const [panels, setPanels] = useState(masterPanels);
  const [expandedPanels, setExpandedPanels] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const emptyForm = { name: '', price: 0 };
  const [formData, setFormData] = useState(emptyForm);

  const toggleExpand = (id) => setExpandedPanels(prev => ({ ...prev, [id]: !prev[id] }));

  const openAddModal = () => { setEditingPanel(null); setFormData(emptyForm); setIsModalOpen(true); };
  const openEditModal = (panel) => { setEditingPanel(panel); setFormData({ name: panel.name, price: panel.price }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingPanel(null); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPanel) {
      setPanels(panels.map(p => p.id === editingPanel.id ? { ...p, ...formData } : p));
    } else {
      setPanels([...panels, { ...formData, id: `mp${Date.now()}`, defaultMaterials: [] }]);
    }
    closeModal();
  };

  const handleDeletePanel = (id) => {
    if (confirm('Delete this panel?')) setPanels(panels.filter(p => p.id !== id));
  };

  // Material row functions
  const getItemOptions = () => [...new Set(masterComponents.map(c => c.item))];
  
  const getDropdownOptions = (mat, field) => {
    let filtered = masterComponents;
    if (mat.item) filtered = filtered.filter(c => c.item === mat.item);
    if (field !== 'brand' && mat.brand) filtered = filtered.filter(c => c.brand === mat.brand);
    if (field !== 'series' && mat.series) filtered = filtered.filter(c => c.series === mat.series);
    return [...new Set(filtered.map(c => c[field]).filter(Boolean))];
  };

  const handleMaterialChange = (panelId, matId, field, value) => {
    setPanels(panels.map(p => {
      if (p.id !== panelId) return p;
      return {
        ...p,
        defaultMaterials: p.defaultMaterials.map(mat => {
          if (mat.id !== matId) return mat;
          
          let updated = { ...mat, [field]: value };
          
          // Auto-fill from masterComponents when selecting item/brand/series
          if (['item', 'brand', 'series', 'pole', 'ka', 'ampere'].includes(field)) {
            const match = masterComponents.find(c => 
              c.item === (field === 'item' ? value : updated.item) &&
              c.brand === (field === 'brand' ? value : updated.brand) &&
              c.series === (field === 'series' ? value : updated.series) &&
              c.pole === (field === 'pole' ? value : updated.pole) &&
              c.ka === (field === 'ka' ? value : updated.ka) &&
              c.ampere === (field === 'ampere' ? value : updated.ampere)
            );
            if (match) {
              updated = { ...updated, ...match, id: mat.id, qty: mat.qty || 1, factor: mat.factor || 1, diskon: mat.diskon || 0 };
            }
          }
          return updated;
        })
      };
    }));
  };

  const handleAddMaterialRow = (panelId) => {
    setPanels(panels.map(p => {
      if (p.id !== panelId) return p;
      return {
        ...p,
        defaultMaterials: [...p.defaultMaterials, {
          id: `dm${Date.now()}`, item: '', brand: '', series: '', pole: '', ka: '', ampere: '',
          detail: '', unit: 'UNIT', qty: 1, factor: 1, diskon: 0, manHour: 0,
          localPrice: 0, internationalPrice: 0, currency: 'IDR'
        }]
      };
    }));
  };

  const handleDeleteMaterial = (panelId, matId) => {
    setPanels(panels.map(p => p.id === panelId ? { ...p, defaultMaterials: p.defaultMaterials.filter(m => m.id !== matId) } : p));
  };

  const calculateRow = (mat) => {
    const disc = mat.diskon || 0;
    const factor = mat.factor || 1;
    const qty = mat.qty || 1;
    const priceAfterDiscUSD = mat.internationalPrice * (1 - disc / 100) * factor;
    const priceBecomeIDR = priceAfterDiscUSD * KURS_USD;
    const priceAfterDiscIDR = mat.localPrice * (1 - disc / 100) * factor;
    const basePriceIDR = priceBecomeIDR > 0 ? priceBecomeIDR : priceAfterDiscIDR;
    const priceAfterManHour = basePriceIDR + (mat.manHour || 0);
    const totalPrice = priceAfterManHour * qty;
    return { priceAfterDiscUSD, priceBecomeIDR, priceAfterDiscIDR, priceAfterManHour, totalPrice };
  };

  // Calculate panel price from materials
  const calculatePanelPrice = (panel) => {
    if (!panel.defaultMaterials || panel.defaultMaterials.length === 0) return panel.price || 0;
    return panel.defaultMaterials.reduce((sum, mat) => sum + calculateRow(mat).totalPrice, 0);
  };

  const filteredPanels = panels.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Products" />
      
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <Layers size={28} className="text-purple-600" /> Product Panels
              </h1>
              <p className="text-slate-500 text-sm mt-1">{filteredPanels.length} panels</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[250px]">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950" />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button onClick={openAddModal} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2">
                <Plus size={18} /> Add Panel
              </button>
            </div>
          </div>
        </div>

        {/* Panels */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto py-6 space-y-4">
          {filteredPanels.map((panel) => (
            <div key={panel.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => toggleExpand(panel.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Box size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{panel.name}</h3>
                    <span className="text-sm text-slate-500">{panel.defaultMaterials.length} items • {formatRupiah(calculatePanelPrice(panel))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(panel); }} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={18} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePanel(panel.id); }} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>
                  {expandedPanels[panel.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>

              {expandedPanels[panel.id] && (
                <div className="border-t border-slate-200 dark:border-slate-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[1800px]">
                      <thead className="text-white text-[11px]">
                        <tr className="bg-slate-800">
                          <th className="p-2 border-r border-slate-600 text-left w-24">Item</th>
                          <th className="p-2 border-r border-slate-600 text-left w-24">Brand</th>
                          <th className="p-2 border-r border-slate-600 text-left w-24">Series</th>
                          <th className="p-2 border-r border-slate-600 text-left w-16">Pole</th>
                          <th className="p-2 border-r border-slate-600 text-left w-16">KA</th>
                          <th className="p-2 border-r border-slate-600 text-left w-20">Ampere</th>
                          <th className="p-2 border-r border-slate-600 bg-slate-900 text-left min-w-[180px]">Material Desc</th>
                          <th className="p-2 border-r border-slate-600 bg-blue-900 text-center w-14">Qty</th>
                          <th className="p-2 border-r border-slate-600 bg-blue-900 text-center w-14">Unit</th>
                          <th className="p-2 border-r border-slate-600 bg-blue-900 text-right w-24">Int.Price</th>
                          <th className="p-2 border-r border-slate-600 bg-blue-900 text-right w-24">Loc.Price</th>
                          <th className="p-2 border-r border-slate-600 bg-blue-900 text-center w-12">Cur</th>
                          <th className="p-2 border-r border-slate-600 bg-green-900 text-center w-14">Fctr</th>
                          <th className="p-2 border-r border-slate-600 bg-green-900 text-center w-14">Disc%</th>
                          <th className="p-2 border-r border-slate-600 bg-green-900 text-center w-20">ManHour</th>
                          <th className="p-2 border-r border-slate-600 bg-slate-700 text-right w-24">Stl Disc(USD)</th>
                          <th className="p-2 border-r border-slate-600 bg-slate-700 text-right w-24">To IDR</th>
                          <th className="p-2 border-r border-slate-600 bg-slate-700 text-right w-24">Stl Disc(IDR)</th>
                          <th className="p-2 border-r border-slate-600 bg-slate-700 text-right w-24">Price+MH</th>
                          <th className="p-2 border-r border-slate-600 bg-blue-800 text-right w-28 font-bold text-yellow-300">TOTAL</th>
                          <th className="p-2 bg-slate-800 w-10 text-center">#</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {panel.defaultMaterials.map((mat) => {
                          const calc = calculateRow(mat);
                          return (
                            <tr key={mat.id} className="hover:bg-blue-50 dark:hover:bg-slate-800">
                              <td className="p-1 border-r">
                                <select className="w-full p-1.5 bg-transparent outline-none cursor-pointer text-xs" value={mat.item} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'item', e.target.value)}>
                                  <option value="">-</option>
                                  {getItemOptions().map(o => <option key={o}>{o}</option>)}
                                </select>
                              </td>
                              <td className="p-1 border-r">
                                <select className="w-full p-1.5 bg-transparent outline-none cursor-pointer text-xs" value={mat.brand} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'brand', e.target.value)} disabled={!mat.item}>
                                  <option value="">-</option>
                                  {getDropdownOptions(mat, 'brand').map(o => <option key={o}>{o}</option>)}
                                </select>
                              </td>
                              <td className="p-1 border-r">
                                <select className="w-full p-1.5 bg-transparent outline-none cursor-pointer text-xs" value={mat.series} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'series', e.target.value)} disabled={!mat.brand}>
                                  <option value="">-</option>
                                  {getDropdownOptions(mat, 'series').map(o => <option key={o}>{o}</option>)}
                                </select>
                              </td>
                              <td className="p-1 border-r">
                                <select className="w-full p-1.5 bg-transparent outline-none cursor-pointer text-xs" value={mat.pole} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'pole', e.target.value)} disabled={!mat.series}>
                                  <option value="">-</option>
                                  {getDropdownOptions(mat, 'pole').map(o => <option key={o}>{o}</option>)}
                                </select>
                              </td>
                              <td className="p-1 border-r">
                                <select className="w-full p-1.5 bg-transparent outline-none cursor-pointer text-xs" value={mat.ka} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'ka', e.target.value)} disabled={!mat.pole}>
                                  <option value="">-</option>
                                  {getDropdownOptions(mat, 'ka').map(o => <option key={o}>{o}</option>)}
                                </select>
                              </td>
                              <td className="p-1 border-r">
                                <select className="w-full p-1.5 bg-transparent outline-none cursor-pointer text-xs" value={mat.ampere} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'ampere', e.target.value)} disabled={!mat.ka}>
                                  <option value="">-</option>
                                  {getDropdownOptions(mat, 'ampere').map(o => <option key={o}>{o}</option>)}
                                </select>
                              </td>
                              <td className="p-2 border-r bg-slate-100 dark:bg-slate-900 font-medium truncate">{mat.detail || '-'}</td>
                              <td className="p-1 border-r">
                                <input type="number" className="w-full p-1.5 text-center bg-blue-50/50 font-bold outline-none rounded text-xs" value={mat.qty} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'qty', parseFloat(e.target.value) || 1)} />
                              </td>
                              <td className="p-1 border-r text-center text-xs">{mat.unit}</td>
                              <td className="p-2 border-r text-right font-mono">{mat.internationalPrice > 0 ? formatUSD(mat.internationalPrice) : '-'}</td>
                              <td className="p-2 border-r text-right font-mono">{formatRupiah(mat.localPrice)}</td>
                              <td className="p-1 border-r text-center text-[10px]">{mat.currency || 'IDR'}</td>
                              <td className="p-1 border-r">
                                <input type="number" className="w-full p-1.5 text-center bg-green-50/50 outline-none rounded text-xs" value={mat.factor} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'factor', parseFloat(e.target.value) || 1)} />
                              </td>
                              <td className="p-1 border-r">
                                <input type="number" className="w-full p-1.5 text-center bg-green-50/50 outline-none rounded text-xs" value={mat.diskon} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'diskon', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td className="p-1 border-r">
                                <input type="number" className="w-full p-1.5 text-center bg-green-50/50 outline-none rounded text-xs" value={mat.manHour} onChange={(e) => handleMaterialChange(panel.id, mat.id, 'manHour', parseFloat(e.target.value) || 0)} />
                              </td>
                              <td className="p-2 border-r text-right text-slate-500 font-mono bg-slate-50">{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</td>
                              <td className="p-2 border-r text-right text-slate-500 font-mono bg-slate-50">{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</td>
                              <td className="p-2 border-r text-right text-slate-500 font-mono bg-slate-50">{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</td>
                              <td className="p-2 border-r text-right font-medium font-mono bg-slate-50">{formatRupiah(calc.priceAfterManHour)}</td>
                              <td className="p-2 border-r text-right bg-blue-50 text-blue-800 font-bold font-mono">{formatRupiah(calc.totalPrice)}</td>
                              <td className="p-1 text-center">
                                <button onClick={() => handleDeleteMaterial(panel.id, mat.id)} className="text-slate-400 hover:text-red-500 p-1 rounded"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                    <button onClick={() => handleAddMaterialRow(panel.id)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-blue-100 border border-transparent hover:border-blue-200">
                      <Plus size={14} /> Add New Material
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {editingPanel ? <Edit2 size={22} className="text-orange-500" /> : <Layers size={22} className="text-purple-600" />}
                {editingPanel ? 'Edit Panel' : 'Add Panel'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-200 text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Panel Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Base Price (IDR)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950" />
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className={`px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 ${editingPanel ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
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
