import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectExcel from '../../Pages/ProjectExcel';
import ProjectWord from '../../Pages/ProjectWord';
import ProductMaterialTable from '../Product/ProductMaterialTable';
import MobileHeader from '../../components/MobileHeader';

import { FileEdit, ChevronLeft, Plus, ChevronDown, X, Save, Trash2, PlusCircle } from 'lucide-react';
import { projectsData, masterPanels, formatRupiah, formatUSD, KURS_USD } from '../../data/mockData';

const ProjectDetail = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const projectInfo = projectsData[0];

  const [panels, setPanels] = useState(projectInfo.details);
  const [rowLevels, setRowLevels] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [additionalCosts, setAdditionalCosts] = useState({
    packing: 0, shipping: 0, installation: 0, testing: 0, documentation: 0, other: 0
  });

  const [newPanelForm, setNewPanelForm] = useState({ idMaster: '', jenis: '', jumlah: 1, hargaSatuan: 0, defaultMaterials: [], isCustom: false });

  const filteredMasterPanels = masterPanels.filter(panel => panel.name.toLowerCase().includes(modalSearchTerm.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateRow = (item) => {
    const qty = parseFloat(item.qty) || 0; const factor = parseFloat(item.factor) || 1; const diskon = parseFloat(item.diskon) || 0; const manHour = parseFloat(item.manHour) || 0; const intPrice = parseFloat(item.internationalPrice) || 0; const locPrice = parseFloat(item.localPrice) || 0;
    let priceAfterDiscUSD = intPrice > 0 ? intPrice * factor * ((100 - diskon) / 100) : 0;
    let priceBecomeIDR = priceAfterDiscUSD > 0 ? priceAfterDiscUSD * KURS_USD : 0;
    let priceAfterDiscIDR = locPrice > 0 ? locPrice * factor * ((100 - diskon) / 100) : 0;
    const basePriceIDR = priceBecomeIDR > 0 ? priceBecomeIDR : priceAfterDiscIDR;
    const priceAfterManHour = basePriceIDR + manHour;
    const totalPrice = priceAfterManHour * qty;
    return { priceAfterDiscUSD, priceBecomeIDR, priceAfterDiscIDR, priceAfterManHour, totalPrice };
  };

  const calculatePanelTotal = (panel) => {
    if (!panel.materials || panel.materials.length === 0) return panel.hargaAkhir || (panel.jumlah * panel.hargaSatuan) || 0;
    return panel.materials.reduce((sum, mat) => sum + calculateRow(mat).totalPrice, 0) * panel.jumlah;
  };

  const calculateUnitPrice = (panel) => {
    if (!panel.materials || panel.materials.length === 0) return panel.hargaSatuan || 0;
    return panel.materials.reduce((sum, mat) => sum + calculateRow(mat).totalPrice, 0);
  };

  const subtotalPanels = panels.reduce((sum, panel) => sum + calculatePanelTotal(panel), 0);
  const totalAdditionalCosts = Object.values(additionalCosts).reduce((sum, cost) => sum + (parseFloat(cost) || 0), 0);
  const grandTotal = subtotalPanels + totalAdditionalCosts;

  const handleAdditionalCostChange = (field, value) => setAdditionalCosts(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));

  const handleSelectPanel = (panel) => { setNewPanelForm({ idMaster: panel.id, jenis: panel.name, jumlah: 1, hargaSatuan: panel.price, defaultMaterials: panel.defaultMaterials || [], isCustom: false }); setModalSearchTerm(panel.name); setIsDropdownOpen(false); };
  const handleCreateCustomPanel = () => { setNewPanelForm({ idMaster: `custom-${Date.now()}`, jenis: modalSearchTerm, jumlah: 1, hargaSatuan: 0, defaultMaterials: [], isCustom: true }); setIsDropdownOpen(false); };
  const openModal = () => { setNewPanelForm({ idMaster: '', jenis: '', jumlah: 1, hargaSatuan: 0, defaultMaterials: [], isCustom: false }); setModalSearchTerm(""); setIsDropdownOpen(false); setIsModalOpen(true); };
  const handleAddPanel = (e) => { e.preventDefault(); if (!newPanelForm.jenis) return alert("Nama panel tidak boleh kosong!"); setPanels([...panels, { id: Date.now(), jenis: newPanelForm.jenis, jumlah: parseInt(newPanelForm.jumlah), hargaSatuan: parseInt(newPanelForm.hargaSatuan), hargaAkhir: parseInt(newPanelForm.jumlah) * parseInt(newPanelForm.hargaSatuan), materials: newPanelForm.defaultMaterials.map((mat, i) => ({ ...mat, id: `new-mat-${Date.now()}-${i}` })) }]); setIsModalOpen(false); };
  const handleDeletePanel = (id) => { if (confirm("Hapus panel?")) setPanels(panels.filter(p => p.id !== id)); };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Project Detail" />
      
      {/* Desktop Header */}
      <div className="hidden sm:flex px-4 lg:px-8 py-4 justify-between items-center shadow-sm z-30 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="flex items-center gap-2 font-medium text-slate-500 hover:text-blue-700 dark:text-slate-400">
            <div className="p-1.5 rounded-md border border-slate-200 hover:bg-blue-50 dark:border-slate-700"><ChevronLeft size={18} /></div>
            <span className="text-sm hidden md:inline">Back</span>
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <span className="truncate max-w-[200px] lg:max-w-none">{projectInfo.namaProject}</span>
              <span className="px-2 py-0.5 text-xs rounded-md font-mono border bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 hidden md:inline">{projectInfo.jobNo}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden lg:block">{projectInfo.customer} • {projectInfo.pembuat}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ProjectExcel projectInfo={projectInfo} panels={panels} />
          <ProjectWord projectInfo={projectInfo} panels={panels} />
          <div className="w-px bg-slate-300 mx-1 hidden lg:block"></div>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-3 lg:px-6 py-2 rounded-lg text-sm font-semibold shadow-md flex gap-2 items-center">
            <Save size={18} /> <span className="hidden lg:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Mobile Project Info */}
      <div className="sm:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate('/projects')} className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            <ProjectExcel projectInfo={projectInfo} panels={panels} />
            <ProjectWord projectInfo={projectInfo} panels={panels} />
            <button className="bg-blue-700 text-white p-2 rounded-lg"><Save size={18} /></button>
          </div>
        </div>
        <h1 className="font-bold text-slate-800 dark:text-white">{projectInfo.namaProject}</h1>
        <p className="text-xs text-slate-500">{projectInfo.jobNo} • {projectInfo.customer}</p>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">Panel Breakdown</h2>
              <p className="text-xs sm:text-sm text-slate-500">{panels.length} panels</p>
            </div>
            <button onClick={openModal} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
              <Plus size={18} strokeWidth={3} /> Tambah Panel
            </button>
          </div>

          {/* Panel Table - Fixed width, no scroll */}
          <div className="rounded-xl shadow-sm bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead className="border-b bg-blue-50/50 border-blue-100 dark:bg-slate-800 dark:border-slate-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-left text-blue-800 dark:text-blue-400">Panel</th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center text-blue-800 dark:text-blue-400 w-10 sm:w-16">Qty</th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-right text-blue-800 dark:text-blue-400 hidden sm:table-cell w-28 lg:w-36">Unit Price</th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-right text-blue-800 dark:text-blue-400 w-20 sm:w-28 lg:w-36">Total</th>
                  <th className="px-1 sm:px-4 py-3 sm:py-4 w-14 sm:w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {panels.map((item) => {
                  const isOpen = rowLevels[item.id] || false;
                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        className={`cursor-pointer ${isOpen ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        onClick={() => setRowLevels(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${isOpen ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                              <ChevronDown size={14} className={`text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>
                            <span className={`font-bold text-xs sm:text-base truncate ${isOpen ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.jenis}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-center text-xs sm:text-sm">{item.jumlah}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 text-right hidden sm:table-cell truncate">{formatRupiah(calculateUnitPrice(item))}</td>
                        <td className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-blue-600 text-right text-[10px] sm:text-sm truncate">{formatRupiah(calculatePanelTotal(item))}</td>
                        <td className="px-1 sm:px-4 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center gap-0 sm:gap-1">
                            <button onClick={() => navigate(`/project-detail/edit/${item.id}`)} className="p-1 sm:p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><FileEdit size={14}/></button>
                            <button onClick={() => handleDeletePanel(item.id)} className="p-1 sm:p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan="5" className="p-0">
                            <div className="border-t border-blue-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto">
                              <ProductMaterialTable materials={item.materials || []} calculateRow={calculateRow} formatRupiah={formatRupiah} formatUSD={formatUSD} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-500 mb-2">Biaya Tambahan</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[{key:'packing',label:'Packing'},{key:'shipping',label:'Shipping'},{key:'installation',label:'Installation'},{key:'testing',label:'Testing'},{key:'documentation',label:'Documentation'},{key:'other',label:'Lainnya'}].map(({key,label})=>(
                    <div key={key} className="flex flex-col">
                      <label className="text-[10px] text-slate-500 mb-0.5">{label}</label>
                      <input type="number" value={additionalCosts[key]} onChange={(e)=>handleAdditionalCostChange(key,e.target.value)} className="border rounded px-2 py-1.5 text-right text-xs focus:ring-1 focus:ring-blue-500 outline-none w-full dark:bg-slate-950 dark:border-slate-700" placeholder="0"/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-72 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between text-xs py-1"><span className="text-slate-600">Subtotal Panel</span><span className="font-medium">{formatRupiah(subtotalPanels)}</span></div>
                <div className="flex justify-between text-xs py-1"><span className="text-slate-600">Biaya Tambahan</span><span className="font-medium">{formatRupiah(totalAdditionalCosts)}</span></div>
                <div className="flex justify-between py-2 mt-1 border-t border-blue-200 dark:border-blue-700"><span className="text-sm font-bold text-slate-800 dark:text-slate-200">GRAND TOTAL</span><span className="text-base font-bold text-blue-600 dark:text-blue-400">{formatRupiah(grandTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Pilih atau Buat Panel</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddPanel} className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Panel</label>
                <input type="text" placeholder="Cari atau ketik nama panel baru..." className="w-full border dark:border-slate-700 dark:bg-slate-950 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={modalSearchTerm} onChange={(e) => { setModalSearchTerm(e.target.value); setNewPanelForm(prev => ({...prev, jenis: e.target.value})); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} />
                {isDropdownOpen && modalSearchTerm && (
                  <div className="absolute w-full bg-white dark:bg-slate-900 border dark:border-slate-700 mt-1 max-h-48 overflow-auto z-10 shadow-lg rounded-lg">
                    {filteredMasterPanels.length > 0 && (<div className="border-b border-slate-100 dark:border-slate-800"><div className="px-3 py-1 text-[10px] text-slate-400 uppercase font-bold bg-slate-50 dark:bg-slate-800">Master Panel</div>{filteredMasterPanels.map(mp => (<div key={mp.id} className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer text-sm" onClick={() => handleSelectPanel(mp)}>{mp.name}</div>))}</div>)}
                    <div className="px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-2" onClick={handleCreateCustomPanel}><PlusCircle size={16}/> Buat panel baru: "{modalSearchTerm}"</div>
                  </div>
                )}
              </div>
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Jumlah</label><input type="number" value={newPanelForm.jumlah} onChange={e => setNewPanelForm({...newPanelForm, jumlah: e.target.value})} className="w-full border dark:border-slate-700 dark:bg-slate-950 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="1"/></div>
              <div className="flex gap-2 mt-4 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">Batal</button>
                <button type="submit" disabled={!newPanelForm.jenis} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md disabled:opacity-50">{newPanelForm.idMaster ? "Tambah" : "Buat Baru"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
