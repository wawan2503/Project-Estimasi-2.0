import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, ChevronUp, X, Trash2, Plus, Filter } from 'lucide-react';
import { masterPanels, masterComponents, formatRupiah, formatUSD } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';

export const KURS_USD = 16000;

// SearchableSelect Component - EXPORTED
export const SearchableSelect = ({ value, options = [], onChange, placeholder = "-" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const ref = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { 
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target) && ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const dropdownHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      setPos({ 
        top: openUp ? null : rect.bottom + 2, 
        bottom: openUp ? window.innerHeight - rect.top + 2 : null,
        left: rect.left, 
        width: Math.max(rect.width, 200),
        openUp 
      });
    }
    setSearchTerm('');
    setIsOpen(true);
  };

  const handleSelect = (o) => { 
    onChange(o); 
    setIsOpen(false); 
  };

  const filteredOptions = options.filter(o => {
    if (!searchTerm) return true;
    return String(o).toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
  });

  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={handleOpen} className="w-full p-2 text-left bg-transparent flex items-center justify-between gap-1 hover:bg-slate-100 rounded">
        <span className={`truncate text-xs ${value ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400'}`}>{value || placeholder}</span>
        <ChevronDown size={12} className="text-slate-400" />
      </button>
      {isOpen && createPortal(
        <div ref={dropdownRef} style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, zIndex: 9999, maxHeight: 280 }} className={`bg-white border rounded-lg shadow-xl flex flex-col ${pos.openUp ? 'flex-col-reverse' : ''}`}>
          <div className={`p-2 bg-slate-50 ${pos.openUp ? 'border-t' : 'border-b'}`}>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Ketik untuk cari..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border rounded outline-none focus:border-blue-400" 
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            <div onClick={() => handleSelect('')} className="px-3 py-2 text-xs cursor-pointer hover:bg-red-50 text-slate-400 italic border-b">— Kosongkan —</div>
            {filteredOptions.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">Tidak ditemukan</div>}
            {filteredOptions.map((o, idx) => (
              <div key={idx} onClick={() => handleSelect(o)} className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${value === o ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}>{o}</div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Mobile Card - EXPORTED
export const MobileItemCard = ({ item, calc, getDropdownOptions, handleChange, handleDeleteRow, formatRupiah, SearchableSelect }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border mb-3">
      <div className="p-3 flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{item.detail || 'Material belum dipilih'}</p>
          <p className="text-xs text-slate-500">{item.item} • {item.brand} • Qty: {item.qty}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-blue-600">{formatRupiah(calc.totalPrice)}</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {['item', 'brand', 'series', 'detail'].map(field => (
              <div key={field}>
                <label className="text-[10px] text-slate-500 uppercase font-bold">{field}</label>
                <SearchableSelect value={item[field] || ''} options={getDropdownOptions(item, field)} onChange={(v) => handleChange(item.id, field, v)} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['pole', 'ka', 'ampere'].map(field => (
              <div key={field}>
                <label className="text-[10px] text-slate-500 uppercase font-bold">{field}</label>
                <SearchableSelect value={item[field] || ''} options={getDropdownOptions(item, field)} onChange={(v) => handleChange(item.id, field, v)} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[{f:'qty',l:'Qty'},{f:'factor',l:'Factor'},{f:'diskon',l:'Disc%'},{f:'manHour',l:'ManHr'}].map(({f,l}) => (
              <div key={f}>
                <label className="text-[10px] text-slate-500 uppercase font-bold">{l}</label>
                <input type="number" className="w-full p-2 text-center bg-slate-50 rounded text-sm" value={item[f]} onChange={(e) => handleChange(item.id, f, e.target.value)}/>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 rounded p-2 text-xs space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Unit Price:</span><span>{item.localPrice ? formatRupiah(item.localPrice) : '-'}</span></div>
            <div className="flex justify-between font-bold text-blue-600"><span>Total:</span><span>{formatRupiah(calc.totalPrice)}</span></div>
          </div>
          <button onClick={() => handleDeleteRow(item.id)} className="w-full py-2 text-red-500 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-50 rounded">
            <Trash2 size={14}/> Hapus Item
          </button>
        </div>
      )}
    </div>
  );
};

// Filter Header Component - EXPORTED
export const FilterHeader = ({ label, field, filters, setFilters }) => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => { 
    if (isSearchMode && inputRef.current) inputRef.current.focus(); 
  }, [isSearchMode]);

  const hasFilter = filters[field];

  return (
    <th className="p-2 border-r border-slate-600 text-left bg-slate-800 whitespace-nowrap">
      {!isSearchMode ? (
        <div className="flex items-center justify-between cursor-pointer gap-1" onClick={() => setIsSearchMode(true)}>
          <span className="text-xs font-bold uppercase">{label}</span>
          {hasFilter && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>}
          <Filter size={12} className={hasFilter ? 'text-yellow-300' : 'text-white/50'} />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <input 
            ref={inputRef} 
            type="text" 
            placeholder="Cari..." 
            className="w-20 px-1.5 py-1 text-xs rounded text-slate-900 outline-none" 
            value={filters[field] || ''} 
            onChange={(e) => setFilters(prev => ({ ...prev, [field]: e.target.value }))} 
          />
          <button onClick={(e) => { e.stopPropagation(); setIsSearchMode(false); }} className="text-white/70 hover:text-red-400">
            <X size={14} />
          </button>
        </div>
      )}
    </th>
  );
};

const ProductEditPanel = ({ setSidebarOpen }) => {
  const { panelId } = useParams();
  const navigate = useNavigate();

  const panelInitialData = masterPanels.find(p => p.id === panelId);
  const [panelData, setPanelData] = useState(panelInitialData || { name: 'Unknown', defaultMaterials: [] });
  const [items, setItems] = useState(panelInitialData?.defaultMaterials || []);
  const [filters, setFilters] = useState({ item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '' });

  const calculateRow = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const factor = parseFloat(item.factor) || 1;
    const diskon = parseFloat(item.diskon) || 0;
    const manHour = parseFloat(item.manHour) || 0;
    const intPrice = parseFloat(item.internationalPrice) || 0;
    const locPrice = parseFloat(item.localPrice) || 0;
    let pDiscUSD = intPrice > 0 ? intPrice * factor * ((100 - diskon) / 100) : 0;
    let pIDR = pDiscUSD > 0 ? pDiscUSD * KURS_USD : 0;
    let pDiscIDR = locPrice > 0 ? locPrice * factor * ((100 - diskon) / 100) : 0;
    const baseP = pIDR > 0 ? pIDR : pDiscIDR;
    return { priceAfterDiscUSD: pDiscUSD, priceBecomeIDR: pIDR, priceAfterDiscIDR: pDiscIDR, priceAfterManHour: baseP + manHour, totalPrice: (baseP + manHour) * qty };
  };

  const getDropdownOptions = (row, field) => {
    const filtered = masterComponents.filter(c => {
      if (field !== 'item' && row.item && c.item !== row.item) return false;
      if (field !== 'brand' && row.brand && c.brand !== row.brand) return false;
      if (field !== 'series' && row.series && c.series !== row.series) return false;
      if (field !== 'pole' && row.pole && c.pole !== row.pole) return false;
      if (field !== 'ka' && row.ka && c.ka !== row.ka) return false;
      if (field !== 'ampere' && row.ampere && c.ampere !== row.ampere) return false;
      if (field !== 'detail' && row.detail && c.detail !== row.detail) return false;
      return true;
    });
    return [...new Set(filtered.map(c => c[field]).filter(Boolean))];
  };

  const handleChange = (id, field, value) => {
    setItems(prev => prev.map(row => {
      if (row.id !== id) return row;
      
      // Untuk field numerik qty, factor, diskon - langsung update tanpa auto-fill
      if (['qty', 'factor', 'diskon'].includes(field)) {
        return { ...row, [field]: value };
      }
      
      let updatedRow = { ...row, [field]: value };
      if (!value) return updatedRow;
      
      // Cari match berdasarkan field yang sudah diisi
      const matches = masterComponents.filter(c => {
        if (updatedRow.item && c.item !== updatedRow.item) return false;
        if (updatedRow.brand && c.brand !== updatedRow.brand) return false;
        if (updatedRow.series && c.series !== updatedRow.series) return false;
        if (updatedRow.pole && c.pole !== updatedRow.pole) return false;
        if (updatedRow.ka && c.ka !== updatedRow.ka) return false;
        if (updatedRow.ampere && c.ampere !== updatedRow.ampere) return false;
        if (updatedRow.detail && c.detail !== updatedRow.detail) return false;
        return true;
      });
      
      // Jika hanya 1 match, auto-fill semua data
      if (matches.length === 1) {
        updatedRow = { ...updatedRow, ...matches[0], id: row.id, qty: row.qty || 1, factor: row.factor || 1, diskon: row.diskon || 0 };
      }
      return updatedRow;
    }));
  };

  const handleAddNewRow = () => {
    setItems(prev => [...prev, { id: Date.now(), item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '', qty: 1, factor: 1, diskon: 0, manHour: 0, localPrice: 0, internationalPrice: 0, unit: 'PCS', currency: 'IDR' }]);
  };

  const handleDeleteRow = (id) => {
    if(window.confirm("Hapus baris ini?")) setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = () => { 
    alert("Data berhasil diperbarui!"); 
    navigate(-1); 
  };

  const grandTotal = items.reduce((sum, item) => sum + calculateRow(item).totalPrice, 0);

  const hasActiveFilters = Object.values(filters).some(f => f);
  const filteredItems = items.filter(item => {
    const check = (val, filter) => !filter || (val || '').toLowerCase().includes(filter.toLowerCase());
    return check(item.item, filters.item) && check(item.brand, filters.brand) && check(item.series, filters.series) && 
           check(item.pole, filters.pole) && check(item.ka, filters.ka) && check(item.ampere, filters.ampere) && check(item.detail, filters.detail);
  });

  if (!panelInitialData) return <div className="h-screen flex items-center justify-center">Panel Tidak Ditemukan</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Edit Product" />
      
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-full xl:max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg border hover:bg-slate-100 shrink-0">
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-black truncate uppercase">{panelData.name}</h1>
              <p className="text-[10px] sm:text-xs text-slate-500">Product Panel Template</p>
            </div>
          </div>
          <div className="hidden sm:block text-right mr-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
            <p className="text-lg font-black text-green-600">{formatRupiah(grandTotal)}</p>
          </div>
          <button onClick={handleSave} className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Save size={18} /><span className="hidden sm:inline">Simpan</span>
          </button>
        </div>
        <div className="sm:hidden px-4 pb-2 flex justify-between items-center border-t pt-2">
          <span className="text-xs text-slate-500">Total</span>
          <span className="text-sm font-black text-green-600">{formatRupiah(grandTotal)}</span>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4 lg:p-6">
        <div className="max-w-full xl:max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border overflow-x-auto">
            {/* Mobile View */}
            <div className="lg:hidden p-3">
              {items.map((item) => (
                <MobileItemCard key={item.id} item={item} calc={calculateRow(item)} getDropdownOptions={getDropdownOptions} handleChange={handleChange} handleDeleteRow={handleDeleteRow} formatRupiah={formatRupiah} SearchableSelect={SearchableSelect} />
              ))}
              <button onClick={handleAddNewRow} className="w-full py-3 text-purple-600 font-bold text-sm flex items-center justify-center gap-2 bg-purple-50 rounded-lg border-2 border-dashed border-purple-200">
                <Plus size={18}/> Tambah Material
              </button>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="text-xs">
                <thead className="text-white text-[11px]">
                  <tr className="bg-slate-800">
                    <th className="p-2 border-r">#</th>
                    <FilterHeader label="Item" field="item" filters={filters} setFilters={setFilters} />
                    <FilterHeader label="Brand" field="brand" filters={filters} setFilters={setFilters} />
                    <FilterHeader label="Series" field="series" filters={filters} setFilters={setFilters} />
                    <FilterHeader label="Pole" field="pole" filters={filters} setFilters={setFilters} />
                    <FilterHeader label="KA" field="ka" filters={filters} setFilters={setFilters} />
                    <FilterHeader label="Ampere" field="ampere" filters={filters} setFilters={setFilters} />
                    <FilterHeader label="Material Desc" field="detail" filters={filters} setFilters={setFilters} />
                    <th className="p-2 border-r bg-blue-900 text-center whitespace-nowrap">Qty</th>
                    <th className="p-2 border-r bg-blue-900 text-center whitespace-nowrap">Unit</th>
                    <th className="p-2 border-r bg-blue-900 text-right whitespace-nowrap">Int.Price</th>
                    <th className="p-2 border-r bg-blue-900 text-right whitespace-nowrap">Loc.Price</th>
                    <th className="p-2 border-r bg-blue-900 text-center whitespace-nowrap">Cur</th>
                    <th className="p-2 border-r bg-green-900 text-center whitespace-nowrap">Fctr</th>
                    <th className="p-2 border-r bg-green-900 text-center whitespace-nowrap">Disc%</th>
                    <th className="p-2 border-r bg-green-900 text-center whitespace-nowrap">ManHr</th>
                    <th className="p-2 border-r bg-slate-700 text-right whitespace-nowrap">Disc(USD)</th>
                    <th className="p-2 border-r bg-slate-700 text-right whitespace-nowrap">To IDR</th>
                    <th className="p-2 border-r bg-slate-700 text-right whitespace-nowrap">Disc(IDR)</th>
                    <th className="p-2 border-r bg-slate-700 text-right whitespace-nowrap">+ManHr</th>
                    <th className="p-2 bg-purple-800 text-right whitespace-nowrap font-bold text-yellow-300">TOTAL</th>
                  </tr>
                </thead>
                {hasActiveFilters && (
                  <caption className="caption-top bg-yellow-50 dark:bg-yellow-900/20 p-2 text-left">
                    <div className="flex items-center gap-2 text-xs">
                      <Filter size={12} className="text-yellow-600"/>
                      <span className="text-yellow-700">Filter aktif ({filteredItems.length} dari {items.length})</span>
                      <button onClick={() => setFilters({ item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '' })} className="text-red-500 hover:underline ml-2">Reset</button>
                    </div>
                  </caption>
                )}
                <tbody className="divide-y">
                  {filteredItems.map((item) => {
                    const calc = calculateRow(item);
                    return (
                      <tr key={item.id} className="hover:bg-blue-50">
                        <td className="p-1 border-r text-center">
                          <button onClick={() => handleDeleteRow(item.id)} className="text-slate-400 hover:text-red-500 p-1 rounded"><Trash2 size={14}/></button>
                        </td>
                        <td className="p-1 border-r"><SearchableSelect value={item.item || ''} options={getDropdownOptions(item, 'item')} onChange={(v) => handleChange(item.id, 'item', v)} /></td>
                        <td className="p-1 border-r"><SearchableSelect value={item.brand || ''} options={getDropdownOptions(item, 'brand')} onChange={(v) => handleChange(item.id, 'brand', v)} /></td>
                        <td className="p-1 border-r"><SearchableSelect value={item.series || ''} options={getDropdownOptions(item, 'series')} onChange={(v) => handleChange(item.id, 'series', v)} /></td>
                        <td className="p-1 border-r"><SearchableSelect value={item.pole || ''} options={getDropdownOptions(item, 'pole')} onChange={(v) => handleChange(item.id, 'pole', v)} /></td>
                        <td className="p-1 border-r"><SearchableSelect value={item.ka || ''} options={getDropdownOptions(item, 'ka')} onChange={(v) => handleChange(item.id, 'ka', v)} /></td>
                        <td className="p-1 border-r"><SearchableSelect value={item.ampere || ''} options={getDropdownOptions(item, 'ampere')} onChange={(v) => handleChange(item.id, 'ampere', v)} /></td>
                        <td className="p-1 border-r"><SearchableSelect value={item.detail || ''} options={getDropdownOptions(item, 'detail')} onChange={(v) => handleChange(item.id, 'detail', v)} /></td>
                        <td className="p-1 border-r whitespace-nowrap"><input type="text" style={{width: `${String(item.qty || '').length + 3}ch`}} className="p-1.5 text-center bg-blue-50 font-bold rounded text-xs border border-blue-200" value={item.qty || ''} onChange={(e) => handleChange(item.id, 'qty', e.target.value)}/></td>
                        <td className="p-1 border-r whitespace-nowrap text-center text-xs">{item.unit || '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{item.internationalPrice > 0 ? formatUSD(item.internationalPrice) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{item.localPrice ? formatRupiah(item.localPrice) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-center text-xs">{item.currency || 'IDR'}</td>
                        <td className="p-1 border-r whitespace-nowrap"><input type="text" style={{width: `${String(item.factor || '').length + 3}ch`}} className="p-1.5 text-center bg-green-50 rounded text-xs border border-green-200" value={item.factor || ''} onChange={(e) => handleChange(item.id, 'factor', e.target.value)}/></td>
                        <td className="p-1 border-r whitespace-nowrap"><input type="text" style={{width: `${String(item.diskon || '').length + 3}ch`}} className="p-1.5 text-center bg-green-50 rounded text-xs border border-green-200" value={item.diskon || ''} onChange={(e) => handleChange(item.id, 'diskon', e.target.value)}/></td>
                        <td className="p-1 border-r whitespace-nowrap text-center text-xs">{item.manHour || '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{formatRupiah(calc.priceAfterManHour)}</td>
                        <td className="p-1 whitespace-nowrap text-right text-xs font-mono font-bold text-purple-800 bg-purple-50">{formatRupiah(calc.totalPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t flex justify-center">
                <button onClick={handleAddNewRow} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-purple-100">
                  <Plus size={14}/> Add New Material
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end px-1 text-[10px] text-slate-400 font-bold uppercase">
            <p>Items: {items.length}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductEditPanel;
