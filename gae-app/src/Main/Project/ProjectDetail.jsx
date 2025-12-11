import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// --- IMPORT SESUAI STRUKTUR FOLDER ANDA ---
import ProjectExcel from '../../Pages/ProjectExcel';
import ProjectWord from '../../Pages/ProjectWord';

import { 
  FileEdit, ChevronLeft, Plus, ArrowRight, X, Save, Eye, Trash2, Search, Filter, PlusCircle
} from 'lucide-react';

import { projectsData, masterPanels, formatRupiah, formatUSD } from '../../data/mockData';

// --- CONSTANTS ---
const KURS_USD = 16000; 
const scrollContainerStyle = { 
  scrollbarWidth: 'thin', 
  scrollbarColor: '#94a3b8 #f1f5f9' 
};

// --- COMPONENT: TRANSFORMING HEADER FILTER ---
const ColumnFilter = ({ label, field, currentFilter, onFilterChange, bgColor = "bg-slate-800", textColor="text-white", width="min-w-[100px]", className="", stickyStyle={} }) => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { if (isSearchMode && inputRef.current) inputRef.current.focus(); }, [isSearchMode]);
  const toggleSearch = () => setIsSearchMode(true);
  const closeSearch = (e) => { e.stopPropagation(); setIsSearchMode(false); };

  return (
    <th className={`p-2 border-r border-slate-600 ${bgColor} ${textColor} ${width} align-middle transition-all h-[45px] ${className}`} style={stickyStyle}>
      {!isSearchMode ? (
        <div className="flex items-center justify-between group cursor-pointer gap-1" onClick={toggleSearch}>
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider truncate select-none">{label}</span>
            {currentFilter && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0"></div>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleSearch(); }} className={`p-1 rounded hover:bg-white/20 flex-shrink-0 ${currentFilter ? 'text-yellow-300' : 'text-white/50 hover:text-white'}`}><Filter size={12} strokeWidth={2.5}/></button>
        </div>
      ) : (
        <div className="flex items-center gap-1 w-full animate-in fade-in">
          <input ref={inputRef} type="text" placeholder="Cari..." className="w-full px-1.5 py-1 text-[10px] rounded border-none text-slate-900 focus:ring-1 focus:ring-blue-400 focus:outline-none shadow-inner" value={currentFilter || ''} onChange={(e) => onFilterChange(field, e.target.value)} />
          <button onClick={closeSearch} className="text-white/70 hover:text-red-400 p-0.5"><X size={14} /></button>
        </div>
      )}
    </th>
  );
};

const ProjectDetail = () => {
  const navigate = useNavigate();
  const projectInfo = projectsData[0]; 

  const [panels, setPanels] = useState(projectInfo.details); 
  const [rowLevels, setRowLevels] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [newPanelForm, setNewPanelForm] = useState({ idMaster: '', jenis: '', jumlah: 1, hargaSatuan: 0, defaultMaterials: [], isCustom: false });
  const [colFilters, setColFilters] = useState({ detail: '', brand: '', series: '', qty: '', unit: '' });

  const handleColFilterChange = (field, value) => { setColFilters(prev => ({ ...prev, [field]: value })); };
  const filteredMasterPanels = masterPanels.filter(panel => panel.name.toLowerCase().includes(modalSearchTerm.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMaterialPrice = (mat) => mat.currency === 'USD' ? mat.internationalPrice : mat.localPrice;
  const renderPrice = (price, currency) => currency === 'USD' ? formatUSD(price) : formatRupiah(price);
  
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

  const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return text;
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return <span>{parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? <span key={i} className="bg-yellow-300 text-black font-bold px-0.5 rounded">{part}</span> : part)}</span>;
  };

  // --- ACTIONS ---
  const changeLevel = (id, action) => {
    setRowLevels((prev) => {
      const current = prev[id] || 0;
      if (action === 'NEXT') return { ...prev, [id]: current >= 4 ? 4 : current + 1 };
      if (action === 'CLOSE') return { ...prev, [id]: 0 };
      return prev;
    });
  };
  const handleSelectPanel = (panel) => { setNewPanelForm({ idMaster: panel.id, jenis: panel.name, jumlah: 1, hargaSatuan: panel.price, defaultMaterials: panel.defaultMaterials || [], isCustom: false }); setModalSearchTerm(panel.name); setIsDropdownOpen(false); };
  const handleCreateCustomPanel = () => { setNewPanelForm({ idMaster: `custom-${Date.now()}`, jenis: modalSearchTerm, jumlah: 1, hargaSatuan: 0, defaultMaterials: [], isCustom: true }); setIsDropdownOpen(false); };
  const openModal = () => { setNewPanelForm({ idMaster: '', jenis: '', jumlah: 1, hargaSatuan: 0, defaultMaterials: [], isCustom: false }); setModalSearchTerm(""); setIsDropdownOpen(false); setIsModalOpen(true); };
  const handleAddPanel = (e) => { e.preventDefault(); if (!newPanelForm.jenis) return alert("Nama panel tidak boleh kosong!"); setPanels([...panels, { id: Date.now(), jenis: newPanelForm.jenis, jumlah: parseInt(newPanelForm.jumlah), hargaSatuan: parseInt(newPanelForm.hargaSatuan), hargaAkhir: parseInt(newPanelForm.jumlah) * parseInt(newPanelForm.hargaSatuan), materials: newPanelForm.defaultMaterials.map((mat, i) => ({ ...mat, id: `new-mat-${Date.now()}-${i}` })) }]); setIsModalOpen(false); };
  const handleDeletePanel = (id) => { if (confirm("Hapus panel?")) setPanels(panels.filter(p => p.id !== id)); };

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden font-sans transition-colors duration-300 bg-slate-50/50 dark:bg-slate-950">
      
      {/* HEADER */}
      <div className="px-8 py-4 flex justify-between items-center shadow-sm z-30 sticky top-0 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/')} className="flex items-center gap-2 font-medium text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400">
             <div className="p-1.5 rounded-md border border-slate-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"><ChevronLeft size={18} /></div>
             <span className="text-sm">Back</span>
           </button>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
           <div>
             <h1 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">{projectInfo.namaProject} <span className="px-2.5 py-0.5 text-sm rounded-md font-mono border bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">{projectInfo.jobNo}</span></h1>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Customer: {projectInfo.customer} • By: {projectInfo.pembuat}</p>
           </div>
        </div>
        <div className="flex gap-2">
          {/* IMPORTED EXPORT BUTTONS */}
          <ProjectExcel projectInfo={projectInfo} panels={panels} />
          <ProjectWord projectInfo={projectInfo} panels={panels} />

          <div className="w-px bg-slate-300 mx-2"></div>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md active:scale-95 transition flex gap-2 items-center"><Save size={18} /> Save Changes</button>
        </div>
      </div>

      {/* CONTENT - CONTAINER UTAMA */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
             <div>
               <h2 className="text-lg font-bold text-slate-800 dark:text-white">Panel Breakdown</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400">Manage components and pricing details.</p>
             </div>
             <button onClick={openModal} className="ml-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm transition">
               <Plus size={18} strokeWidth={3} /> Tambah Panel
             </button>
           </div>
           {(colFilters.detail || colFilters.brand || colFilters.qty || colFilters.unit) && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs animate-in fade-in">
               <Filter size={12} /><span>Filters Active</span><button onClick={() => setColFilters({detail:'', brand:'', series:'', qty:'', unit:''})} className="ml-2 p-1 hover:bg-yellow-200 rounded-full font-bold text-red-500"><X size={12}/></button>
             </div>
           )}
        </div>

        {/* --- TABEL UTAMA (PANEL LIST) --- */}
        <div className="rounded-xl shadow-sm bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className="border-b bg-blue-50/50 border-blue-100 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left text-blue-800 dark:text-blue-400 w-[48%]">Panel Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left text-blue-800 dark:text-blue-400 w-[8%]">Qty</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left text-blue-800 dark:text-blue-400 w-[18%] whitespace-nowrap">Unit Price (Est)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-left text-blue-800 dark:text-blue-400 w-[18%] whitespace-nowrap">Total Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center text-blue-800 dark:text-blue-400 w-[8%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {panels.map((item) => {
                const level = rowLevels[item.id] || 0; 
                const isOpen = level > 0;
                const filteredMaterials = item.materials ? item.materials.filter(mat => {
                  const check = (val, filter) => (val || '').toString().toLowerCase().includes((filter || '').toLowerCase());
                  return check(mat.detail, colFilters.detail) && check(mat.brand, colFilters.brand) && check(mat.series, colFilters.series) && check(mat.qty, colFilters.qty) && check(mat.unit, colFilters.unit);
                }) : [];

                // --- DYNAMIC MIN-WIDTH RULES ---
                // level 0-1: try to fit container (no horizontal scroll)
                // level 2: moderate width (may or may not scroll)
                // level 3-4: large width -> force scroll
                let innerTableMinClass = 'min-w-full';
                if (level === 2) innerTableMinClass = 'min-w-[1200px]';
                if (level === 3) innerTableMinClass = 'min-w-[1700px]';
                if (level >= 4) innerTableMinClass = 'min-w-[2200px]';

                return (
                  <React.Fragment key={item.id}>
                    {/* Baris Panel Utama */}
                    <tr className={`transition-all duration-200 border-l-4 ${isOpen ? 'bg-blue-50/30 border-l-blue-600 dark:bg-blue-900/10 dark:border-l-blue-500' : 'hover:bg-slate-50 border-l-transparent'}`}>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`text-base font-bold transition-colors ${isOpen ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.jenis}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => changeLevel(item.id, 'NEXT')} disabled={level >= 4} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-sm ${level >= 4 ? 'bg-slate-100 text-slate-400' : 'bg-white text-blue-700 hover:bg-blue-50'} whitespace-nowrap`}>{level === 0 ? <Eye size={14}/> : <ArrowRight size={14}/>} {level === 0 ? "View Details" : `Show Level ${level + 1}`}</button>
                            {isOpen && <button onClick={() => changeLevel(item.id, 'CLOSE')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm border bg-white text-red-600 hover:bg-red-50 whitespace-nowrap"><X size={14} /> Close</button>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-center">{item.jumlah}</td>
                      <td className="px-6 py-5 text-sm text-slate-600 whitespace-nowrap">{formatRupiah(item.hargaSatuan)}</td>
                      <td className="px-6 py-5 font-bold whitespace-nowrap">{formatRupiah(item.hargaAkhir)}</td>
                      <td className="px-6 py-5 text-center flex justify-center gap-2">
                         <button onClick={() => navigate(`/project-detail/edit/${item.id}`)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><FileEdit size={18}/></button>
                         <button onClick={() => handleDeletePanel(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                    
                    {/* === DETAIL ROW (NESTED) === */}
                    {isOpen && (
                      <tr>
                        <td colSpan="5" className="p-0 border-t border-blue-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50">
                          {/* CONTAINER SCROLL KHUSUS UNTUK TABEL DALAM */}
                          <div className="w-full overflow-x-auto p-4 mx-auto" style={scrollContainerStyle}>
                             
                             <div className="border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg shadow-sm inline-block">
                               {/* TABEL DALAM: min-width dikendalikan oleh innerTableMinClass */}
                               <table className={`${innerTableMinClass} w-full text-xs border-collapse`}>
                                 <thead>
                                   <tr className="bg-slate-800 text-white border-b border-slate-700 h-[45px]">
                                     
                                     {/* 1. Material Desc (Pinned Sticky) */}
                                     <ColumnFilter 
                                        label="Material Description" 
                                        field="detail" 
                                        currentFilter={colFilters.detail} 
                                        onFilterChange={handleColFilterChange} 
                                        bgColor="bg-slate-900" 
                                        width="min-w-[280px]"
                                        className="sticky left-0 z-30 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.5)] border-r-2 border-r-slate-600"
                                     />

                                     {/* 2 - 3 */}
                                     <ColumnFilter label="Brand" field="brand" currentFilter={colFilters.brand} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[100px]" />
                                     <ColumnFilter label="Series" field="series" currentFilter={colFilters.series} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[100px]" />
                                     
                                     {/* 4 - 5 */}
                                     <ColumnFilter label="Qty" field="qty" currentFilter={colFilters.qty} onFilterChange={handleColFilterChange} bgColor="bg-blue-900" width="min-w-[70px]" />
                                     <ColumnFilter label="Unit" field="unit" currentFilter={colFilters.unit} onFilterChange={handleColFilterChange} bgColor="bg-blue-900" width="min-w-[70px]" />

                                     {/* 6 - 8 (Level 2) */}
                                     {level >= 2 && (<>
                                        <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-28 text-right align-middle">Int. Price</th>
                                        <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-28 text-right align-middle">Loc. Price</th>
                                        <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-12 text-center align-middle">Cur</th>
                                     </>)}

                                     {/* 9 - 11 (Level 3) */}
                                     {level >= 3 && (<>
                                        <th className="p-2 border-r border-slate-600 bg-green-900 w-16 text-center align-middle">Fctr</th>
                                        <th className="p-2 border-r border-slate-600 bg-green-900 w-16 text-center align-middle">Disc%</th>
                                        <th className="p-2 border-r border-slate-600 bg-green-900 w-20 text-center align-middle">Man Hour</th>
                                     </>)}

                                     {/* 12 - 16 (Level 4) */}
                                     {level >= 4 && (<>
                                        <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">Stl Disc(USD)</th>
                                        <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">To IDR</th>
                                        <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">Stl Disc(IDR)</th>
                                        <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">Price + MH</th>
                                        <th className="p-2 border-r border-slate-600 bg-blue-800 w-40 text-right align-middle font-bold text-yellow-300">TOTAL</th>
                                     </>)}
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                   {filteredMaterials.length > 0 ? (
                                      filteredMaterials.map((mat) => {
                                          const calc = calculateRow(mat);
                                          return (
                                            <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                              
                                              {/* 1. Material Desc (Pinned Sticky) */}
                                              <td className="p-2 pl-4 border-r bg-slate-100 dark:bg-slate-900 font-medium truncate max-w-[280px] sticky left-0 z-10 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)] border-r-slate-300">
                                                <HighlightText text={mat.detail || mat.item} highlight={colFilters.detail} />
                                              </td>

                                              {/* 2 - 3 */}
                                              <td className="p-2 border-r"><HighlightText text={mat.brand} highlight={colFilters.brand} /></td>
                                              <td className="p-2 border-r"><HighlightText text={mat.series} highlight={colFilters.series} /></td>

                                              {/* 4 - 5 */}
                                              <td className="p-2 text-center border-r font-bold bg-blue-50/30"><HighlightText text={mat.qty} highlight={colFilters.qty} /></td>
                                              <td className="p-2 text-center border-r text-slate-500 bg-blue-50/30"><HighlightText text={mat.unit} highlight={colFilters.unit} /></td>

                                              {/* 6 - 8 */}
                                              {level >= 2 && (<>
                                                 <td className="p-2 text-right border-r font-mono bg-blue-50/30">{mat.internationalPrice > 0 ? formatUSD(mat.internationalPrice) : '-'}</td>
                                                 <td className="p-2 text-right border-r font-mono bg-blue-50/30">{formatRupiah(mat.localPrice)}</td>
                                                 <td className="p-2 text-center border-r text-xs bg-blue-50/30">{mat.currency}</td>
                                              </>)}

                                              {/* 9 - 11 */}
                                              {level >= 3 && (<>
                                                 <td className="p-2 text-center border-r bg-green-50/30">{mat.factor}</td>
                                                 <td className="p-2 text-center border-r bg-green-50/30">{mat.diskon}</td>
                                                 <td className="p-2 text-center border-r bg-green-50/30">{mat.manHour}</td>
                                              </>)}

                                              {/* 12 - 16 */}
                                              {level >= 4 && (<>
                                                 <td className="p-2 text-right border-r font-mono bg-slate-50/50">{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</td>
                                                 <td className="p-2 text-right border-r font-mono bg-slate-50/50">{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</td>
                                                 <td className="p-2 text-right border-r font-mono bg-slate-50/50">{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</td>
                                                 <td className="p-2 text-right border-r font-mono font-medium bg-slate-50/50">{formatRupiah(calc.priceAfterManHour)}</td>
                                                 <td className="p-2 text-right border-r font-mono font-bold text-blue-700 bg-blue-50/50">{formatRupiah(calc.totalPrice)}</td>
                                              </>)}
                                            </tr>
                                          );
                                      })
                                    ) : (
                                      <tr><td colSpan={16} className="p-6 text-center italic text-slate-400">No items match.</td></tr>
                                    )}
                                 </tbody>
                               </table>
                             </div>
                             
                             <div className="p-2 border-t text-center bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                {level < 4 ? (<button onClick={() => changeLevel(item.id, 'NEXT')} className="text-xs font-bold hover:underline text-blue-600">Show Full Detail View (Level {level + 1})</button>) : (<span className="text-xs font-medium text-slate-400">All columns visible (Max Level)</span>)}
                             </div>
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
      </div>
      
      {/* MODAL (TIDAK BERUBAH) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 p-6">
             <h3 className="text-lg font-bold mb-4">Pilih atau Buat Panel</h3>
             <form onSubmit={handleAddPanel} className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Panel</label>
                  <input type="text" placeholder="Cari atau ketik nama panel baru..." className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={modalSearchTerm} onChange={(e) => { setModalSearchTerm(e.target.value); setNewPanelForm(prev => ({...prev, jenis: e.target.value})); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} />
                  {isDropdownOpen && modalSearchTerm && (
                    <div className="absolute w-full bg-white border mt-1 max-h-48 overflow-auto z-10 shadow-lg rounded-lg">
                      {filteredMasterPanels.length > 0 && (<div className="border-b border-slate-100"><div className="px-3 py-1 text-[10px] text-slate-400 uppercase font-bold bg-slate-50">Master Panel</div>{filteredMasterPanels.map(mp => (<div key={mp.id} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700" onClick={() => handleSelectPanel(mp)}>{mp.name}</div>))}</div>)}
                      <div className="px-4 py-3 hover:bg-green-50 cursor-pointer text-sm text-green-700 font-medium flex items-center gap-2" onClick={handleCreateCustomPanel}><PlusCircle size={16}/> Buat panel baru: "{modalSearchTerm}"</div>
                    </div>
                  )}
                </div>
                <div><label className="text-xs font-bold text-slate-500 mb-1 block">Jumlah</label><input type="number" value={newPanelForm.jumlah} onChange={e => setNewPanelForm({...newPanelForm, jumlah: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" min="1"/></div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-100 text-sm font-bold text-slate-600">Batal</button><button type="submit" disabled={!newPanelForm.jenis} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow-md disabled:opacity-50">{newPanelForm.idMaster ? "Tambah Panel" : "Buat Panel Baru"}</button></div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
