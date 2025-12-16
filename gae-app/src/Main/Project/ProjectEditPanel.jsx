import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Search, Filter, X
} from 'lucide-react';
import { projectsData, masterComponents, formatRupiah, formatUSD } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';

// --- STYLE SCROLLBAR ---
const scrollContainerStyle = {
  scrollbarWidth: 'thin',
  scrollbarColor: '#94a3b8 #f1f5f9',
};

// --- COMPONENT: TRANSFORMING HEADER FILTER ---
const ColumnFilter = ({ label, field, currentFilter, onFilterChange, bgColor = "bg-slate-800", textColor="text-white", width="min-w-[100px]", className="", stickyStyle={} }) => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => { if (isSearchMode && inputRef.current) inputRef.current.focus(); }, [isSearchMode]);
  const toggleSearch = () => setIsSearchMode(true);
  const closeSearch = (e) => { e.stopPropagation(); setIsSearchMode(false); };

  return (
    <th 
      className={`p-2 border-r border-slate-600 ${bgColor} ${textColor} ${width} align-middle transition-all h-[45px] ${className}`}
      style={stickyStyle} 
    >
      {!isSearchMode ? (
        <div className="flex items-center justify-between group cursor-pointer gap-1" onClick={toggleSearch}>
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider truncate select-none">{label}</span>
            {currentFilter && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0"></div>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); toggleSearch(); }} className={`p-1 rounded hover:bg-white/20 flex-shrink-0 ${currentFilter ? 'text-yellow-300' : 'text-white/50 hover:text-white'}`}>
            <Filter size={12} strokeWidth={2.5}/>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 w-full animate-in fade-in">
          <input 
            ref={inputRef} type="text" placeholder="Cari..." 
            className="w-full px-1.5 py-1 text-[10px] rounded border-none text-slate-900 focus:ring-1 focus:ring-blue-400 focus:outline-none shadow-inner" 
            value={currentFilter || ''} onChange={(e) => onFilterChange(field, e.target.value)}
          />
          <button onClick={closeSearch} className="text-white/70 hover:text-red-400 p-0.5"><X size={14} /></button>
        </div>
      )}
    </th>
  );
};

const ProjectEditPanel = ({ setSidebarOpen }) => {
  const { panelId } = useParams();
  const navigate = useNavigate();
  const KURS_USD = 16000; 

  const project = projectsData[0];
  const panelInitialData = project.details.find(p => p.id.toString() === (panelId || "").toString());
  
  const [panelData, setPanelData] = useState(panelInitialData || { jenis: 'Unknown', materials: [], jumlah: 1 });
  const [items, setItems] = useState(panelData ? panelData.materials : []);
  // State specifically for panel quantity
  const [panelQty, setPanelQty] = useState(panelData ? panelData.jumlah : 1);

  useEffect(() => { 
    if (panelData) {
        setItems(panelData.materials);
        setPanelQty(panelData.jumlah || 1); // Sync quantity on load
    }
  }, [panelData]);

  const [colFilters, setColFilters] = useState({
    item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: ''
  });

  const handleColFilterChange = (field, value) => setColFilters(prev => ({ ...prev, [field]: value }));

  // --- CALCULATOR ---
  const calculateRow = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const factor = parseFloat(item.factor) || 1;
    const diskon = parseFloat(item.diskon) || 0;
    const manHour = parseFloat(item.manHour) || 0;
    const intPrice = parseFloat(item.internationalPrice) || 0;
    const locPrice = parseFloat(item.localPrice) || 0;

    let priceAfterDiscUSD = 0;
    if (intPrice > 0) priceAfterDiscUSD = intPrice * factor * ((100 - diskon) / 100);

    let priceBecomeIDR = 0;
    if (priceAfterDiscUSD > 0) priceBecomeIDR = priceAfterDiscUSD * KURS_USD;

    let priceAfterDiscIDR = 0;
    if (locPrice > 0) priceAfterDiscIDR = locPrice * factor * ((100 - diskon) / 100);

    const basePriceIDR = priceBecomeIDR > 0 ? priceBecomeIDR : priceAfterDiscIDR;
    const priceAfterManHour = basePriceIDR + manHour;
    const totalPrice = priceAfterManHour * qty;

    return { priceAfterDiscUSD, priceBecomeIDR, priceAfterDiscIDR, priceAfterManHour, totalPrice };
  };

  // --- DROPDOWN OPTIONS ---
  const getItemOptions = () => [...new Set(masterComponents.map(c => c.item))];
  const getDropdownOptions = (row, fieldTarget) => {
    let filtered = masterComponents;
    if (!row.item) return [];
    filtered = filtered.filter(c => c.item === row.item);
    if (fieldTarget === 'brand') return [...new Set(filtered.map(c => c.brand))];
    if (!row.brand) return [];
    filtered = filtered.filter(c => c.brand === row.brand);
    if (fieldTarget === 'series') return [...new Set(filtered.map(c => c.series))];
    if (!row.series) return [];
    filtered = filtered.filter(c => c.series === row.series);
    if (fieldTarget === 'pole') return [...new Set(filtered.map(c => c.pole))];
    if (!row.pole) return [];
    filtered = filtered.filter(c => c.pole === row.pole);
    if (fieldTarget === 'ka') return [...new Set(filtered.map(c => c.ka))];
    if (!row.ka) return [];
    filtered = filtered.filter(c => c.ka === row.ka);
    if (fieldTarget === 'ampere') return [...new Set(filtered.map(c => c.ampere))];
    return [];
  };

  // --- ACTIONS ---
  const handleChange = (id, field, value) => {
    setItems(prev => prev.map(row => {
      if (row.id !== id) return row;
      let updatedRow = { ...row, [field]: value };
      if (field === 'item') updatedRow = { ...updatedRow, brand: '', series: '', pole: '', ka: '', ampere: '', detail: '', internationalPrice: 0, localPrice: 0 };
      else if (field === 'brand') updatedRow = { ...updatedRow, series: '', pole: '', ka: '', ampere: '', detail: '', internationalPrice: 0, localPrice: 0 };
      if (updatedRow.item && updatedRow.brand && updatedRow.series && updatedRow.pole && updatedRow.ka && updatedRow.ampere) {
        const match = masterComponents.find(c => c.item === updatedRow.item && c.brand === updatedRow.brand && c.series === updatedRow.series && c.pole === updatedRow.pole && c.ka === updatedRow.ka && c.ampere === updatedRow.ampere);
        if (match) updatedRow = { ...updatedRow, ...match };
      }
      return updatedRow;
    }));
  };

  const handleAddNewRow = () => {
    setItems([...items, { id: Date.now(), item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: 'New Item', qty: 1, factor: 1, diskon: 0, manHour: 0, localPrice: 0, internationalPrice: 0 }]);
  };

  const handleDeleteRow = (id) => {
    if(window.confirm("Hapus baris ini?")) setItems(items.filter(i => i.id !== id));
  };

  const handleSave = () => { 
      // Include panelQty in saved data
      console.log("Saving data...", { ...panelData, jumlah: panelQty, materials: items });
      alert("Data Tersimpan!"); 
      navigate(-1); 
  };

  const filteredItems = items.filter(item => {
    const check = (dataVal, filterVal) => (dataVal || '').toLowerCase().includes((filterVal || '').toLowerCase());
    return check(item.item, colFilters.item) && check(item.brand, colFilters.brand) && check(item.series, colFilters.series) && check(item.pole, colFilters.pole) && check(item.ka, colFilters.ka) && check(item.ampere, colFilters.ampere) && check(item.detail, colFilters.detail);
  });

  if (!panelInitialData) return <div className="p-10 text-center font-bold text-red-500">Panel Not Found</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Edit Panel" />
      
      {/* HEADER PAGE */}
      <div className="flex-none px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm z-30">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg flex-shrink-0"><ArrowLeft size={18}/></button>
          
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-base lg:text-lg font-bold truncate">Edit: <span className="text-blue-600">{panelData.jenis}</span></h1>
                
                {/* Panel Quantity Input */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5 border border-slate-200 dark:border-slate-700 self-start">
                    <span className="text-xs font-semibold mr-2 text-slate-500">Qty Panel:</span>
                    <input 
                        type="number" 
                        min="1"
                        className="w-12 text-center text-sm font-bold bg-transparent outline-none focus:text-blue-600"
                        value={panelQty}
                        onChange={(e) => setPanelQty(Math.max(1, parseInt(e.target.value) || 0))}
                    />
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Kurs: {formatRupiah(KURS_USD)}</p>
          </div>
        </div>
        <button onClick={handleSave} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex gap-2 items-center justify-center shadow-md"><Save size={16}/> Simpan</button>
      </div>

      {/* MAIN SCROLL CONTAINER */}
      <div className="flex-1 overflow-auto p-4" style={scrollContainerStyle}>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 inline-block min-w-full">
          
          <table className="min-w-[2000px] w-full text-xs border-collapse">
            <thead className="text-white text-[11px]">
              <tr className="sticky top-0 z-20 shadow-md">
                {/* GROUP 1: FILTERABLE COLUMNS */}
                <ColumnFilter label="Name Item" field="item" currentFilter={colFilters.item} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[120px]" />
                <ColumnFilter label="Brand" field="brand" currentFilter={colFilters.brand} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[90px]" />
                <ColumnFilter label="Series" field="series" currentFilter={colFilters.series} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[90px]" />
                <ColumnFilter label="Pole" field="pole" currentFilter={colFilters.pole} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[70px]" />
                <ColumnFilter label="KA" field="ka" currentFilter={colFilters.ka} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[70px]" />
                <ColumnFilter label="Ampere" field="ampere" currentFilter={colFilters.ampere} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[80px]" />
                
                {/* --- MATERIAL DESC (STICKY PINNED) --- 
                    Class 'sticky left-0 z-30' membuat header ini menempel di kiri.
                    Shadow-xl memberikan efek pemisah.
                */}
                <ColumnFilter 
                  label="Material Desc" 
                  field="detail" 
                  currentFilter={colFilters.detail} 
                  onFilterChange={handleColFilterChange} 
                  bgColor="bg-slate-900" 
                  width="min-w-[250px]"
                  className="sticky left-0 z-30 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.5)] border-r-2 border-r-slate-600"
                />
                
                {/* GROUP 2: INPUTS */}
                <th className="p-2 border-r border-slate-600 bg-blue-900 w-14 text-center">Qty</th>
                <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-14 text-center">Unit</th>
                <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-24 text-right">Int. Price</th>
                <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-24 text-right">Loc. Price</th>
                <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-12 text-center">Cur</th>
                
                {/* GROUP 3: VARIABLES */}
                <th className="p-2 border-r border-slate-600 bg-green-900 w-14 text-center">Fctr</th>
                <th className="p-2 border-r border-slate-600 bg-green-900 w-14 text-center">Disc%</th>
                <th className="p-2 border-r border-slate-600 bg-green-900 w-20 text-center">Man Hour</th>

                {/* GROUP 4: RESULTS */}
                <th className="p-2 border-r border-slate-600 bg-slate-700 w-24 text-right">Stl Disc(USD)</th>
                <th className="p-2 border-r border-slate-600 bg-slate-700 w-24 text-right">To IDR</th>
                <th className="p-2 border-r border-slate-600 bg-slate-700 w-24 text-right">Stl Disc(IDR)</th>
                <th className="p-2 border-r border-slate-600 bg-slate-700 w-24 text-right">Price + MH</th>
                <th className="p-2 border-r border-slate-600 bg-blue-800 w-28 text-right font-bold text-yellow-300">TOTAL</th>
                <th className="p-2 bg-slate-800 w-10 text-center">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredItems.map((item) => {
                const calc = calculateRow(item);
                return (
                  <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-slate-800 group transition-colors">
                    
                    {/* DROPDOWNS */}
                    <td className="p-1 border-r"><select className="w-full p-2 bg-transparent outline-none cursor-pointer" value={item.item} onChange={(e) => handleChange(item.id, 'item', e.target.value)}><option value="">-</option>{getItemOptions().map(o=><option key={o}>{o}</option>)}</select></td>
                    <td className="p-1 border-r"><select className="w-full p-2 bg-transparent outline-none cursor-pointer" value={item.brand} onChange={(e) => handleChange(item.id, 'brand', e.target.value)} disabled={!item.item}><option value="">-</option>{getDropdownOptions(item, 'brand').map(o=><option key={o}>{o}</option>)}</select></td>
                    <td className="p-1 border-r"><select className="w-full p-2 bg-transparent outline-none cursor-pointer" value={item.series} onChange={(e) => handleChange(item.id, 'series', e.target.value)} disabled={!item.brand}><option value="">-</option>{getDropdownOptions(item, 'series').map(o=><option key={o}>{o}</option>)}</select></td>
                    <td className="p-1 border-r"><select className="w-full p-2 bg-transparent outline-none cursor-pointer" value={item.pole} onChange={(e) => handleChange(item.id, 'pole', e.target.value)} disabled={!item.series}><option value="">-</option>{getDropdownOptions(item, 'pole').map(o=><option key={o}>{o}</option>)}</select></td>
                    <td className="p-1 border-r"><select className="w-full p-2 bg-transparent outline-none cursor-pointer" value={item.ka} onChange={(e) => handleChange(item.id, 'ka', e.target.value)} disabled={!item.pole}><option value="">-</option>{getDropdownOptions(item, 'ka').map(o=><option key={o}>{o}</option>)}</select></td>
                    <td className="p-1 border-r"><select className="w-full p-2 bg-transparent outline-none cursor-pointer" value={item.ampere} onChange={(e) => handleChange(item.id, 'ampere', e.target.value)} disabled={!item.ka}><option value="">-</option>{getDropdownOptions(item, 'ampere').map(o=><option key={o}>{o}</option>)}</select></td>
                    
                    {/* --- MATERIAL DESC (STICKY PINNED BODY) --- 
                        Bg color wajib ada agar tidak transparan.
                        Left-0 agar menempel. Z-10 agar di atas sel lain (tapi di bawah header z-20).
                    */}
                    <td 
                      className="p-2 border-r bg-slate-100 dark:bg-slate-900 font-medium truncate max-w-[250px] sticky left-0 z-10 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)] border-r-slate-300" 
                      title={item.detail}
                    >
                      {item.detail}
                    </td>

                    {/* INPUTS */}
                    <td className="p-1 border-r"><input type="number" className="w-full p-2 text-center bg-blue-50/50 font-bold focus:bg-white border border-transparent focus:border-blue-400 outline-none rounded" value={item.qty} onChange={(e) => handleChange(item.id, 'qty', e.target.value)}/></td>
                    <td className="p-1 border-r text-center"><input type="text" className="w-full p-2 text-center bg-transparent outline-none" value={item.unit} onChange={(e) => handleChange(item.id, 'unit', e.target.value)}/></td>
                    <td className="p-1 border-r"><input type="number" className="w-full p-2 text-right bg-transparent outline-none focus:bg-white focus:shadow-inner" value={item.internationalPrice} onChange={(e) => handleChange(item.id, 'internationalPrice', e.target.value)}/></td>
                    <td className="p-1 border-r"><input type="number" className="w-full p-2 text-right bg-transparent outline-none focus:bg-white focus:shadow-inner" value={item.localPrice} onChange={(e) => handleChange(item.id, 'localPrice', e.target.value)}/></td>
                    <td className="p-1 border-r text-center text-[10px]">{item.currency}</td>

                    {/* VARIABLES */}
                    <td className="p-1 border-r"><input type="number" className="w-full p-2 text-center bg-green-50/50 focus:bg-white border border-transparent focus:border-green-400 outline-none rounded" value={item.factor} onChange={(e) => handleChange(item.id, 'factor', e.target.value)}/></td>
                    <td className="p-1 border-r"><input type="number" className="w-full p-2 text-center bg-green-50/50 focus:bg-white border border-transparent focus:border-green-400 outline-none rounded" value={item.diskon} onChange={(e) => handleChange(item.id, 'diskon', e.target.value)}/></td>
                    <td className="p-1 border-r"><input type="number" className="w-full p-2 text-center bg-green-50/50 focus:bg-white border border-transparent focus:border-green-400 outline-none rounded" value={item.manHour} onChange={(e) => handleChange(item.id, 'manHour', e.target.value)}/></td>

                    {/* RESULTS */}
                    <td className="p-2 border-r text-right text-slate-500 font-mono bg-slate-50">{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</td>
                    <td className="p-2 border-r text-right text-slate-500 font-mono bg-slate-50">{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</td>
                    <td className="p-2 border-r text-right text-slate-500 font-mono bg-slate-50">{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</td>
                    <td className="p-2 border-r text-right font-medium font-mono bg-slate-50">{formatRupiah(calc.priceAfterManHour)}</td>
                    <td className="p-2 border-r text-right bg-blue-50 text-blue-800 font-bold font-mono border-l-2 border-l-blue-200">{formatRupiah(calc.totalPrice)}</td>

                    <td className="p-1 text-center">
                      <button onClick={() => handleDeleteRow(item.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-center sticky left-0">
           <button onClick={handleAddNewRow} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-blue-100 border border-transparent hover:border-blue-200 transition">
             <Plus size={14}/> Add New Material
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditPanel;