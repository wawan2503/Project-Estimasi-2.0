import React, { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, Eye } from 'lucide-react';

// Filterable Column Header
const FilterHeader = ({ label, field, filters, setFilters }) => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const inputRef = useRef(null);
  
  useEffect(() => { 
    if (isSearchMode && inputRef.current) inputRef.current.focus(); 
  }, [isSearchMode]);

  const hasFilter = filters[field];

  return (
    <th className="p-2 border-r border-slate-600 text-left bg-slate-800">
      {!isSearchMode ? (
        <div className="flex items-center justify-between cursor-pointer gap-1 whitespace-nowrap" onClick={() => setIsSearchMode(true)}>
          <span className="text-xs font-bold uppercase">{label}</span>
          {hasFilter && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>}
          <Filter size={12} className={hasFilter ? 'text-yellow-300' : 'text-white/50'} />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <input ref={inputRef} type="text" placeholder="Cari..." className="w-20 px-1.5 py-1 text-xs rounded text-slate-900 outline-none" value={filters[field] || ''} onChange={(e) => setFilters(prev => ({ ...prev, [field]: e.target.value }))} />
          <button onClick={(e) => { e.stopPropagation(); setIsSearchMode(false); }} className="text-white/70 hover:text-red-400"><X size={14} /></button>
        </div>
      )}
    </th>
  );
};

// Level Selector
const LevelSelector = ({ level, setLevel }) => (
  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
    <Eye size={14} className="text-slate-500 ml-1" />
    {[1, 2, 3, 4].map(l => (
      <button key={l} onClick={() => setLevel(l)} className={`px-2 py-1 text-xs font-bold rounded ${level === l ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
        L{l}
      </button>
    ))}
  </div>
);

// Mobile Card for Material
const MobileMatCard = ({ mat, calc, formatRupiah, formatUSD, level }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border mb-2 shadow-sm">
      <div className="p-3 flex justify-between items-center cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{mat.detail || mat.item || '-'}</p>
          <p className="text-xs text-slate-500 truncate">{mat.brand} • Qty: {mat.qty} {mat.unit}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="font-bold text-blue-600 text-sm whitespace-nowrap">{formatRupiah(calc.totalPrice)}</span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
        </div>
      </div>
      {open && (
        <div className="px-3 pb-3 border-t pt-2 space-y-2 text-xs">
          {level >= 2 && (
            <div className="grid grid-cols-3 gap-2">
              <div><span className="text-slate-500">Series:</span> {mat.series || '-'}</div>
              <div><span className="text-slate-500">Pole:</span> {mat.pole || '-'}</div>
              <div><span className="text-slate-500">KA:</span> {mat.ka || '-'}</div>
              <div><span className="text-slate-500">Ampere:</span> {mat.ampere || '-'}</div>
              <div><span className="text-slate-500">Factor:</span> {mat.factor}</div>
              <div><span className="text-slate-500">Disc:</span> {mat.diskon}%</div>
            </div>
          )}
          {level >= 3 && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t">
              <div><span className="text-slate-500">Int.Price:</span> {mat.internationalPrice > 0 ? formatUSD(mat.internationalPrice) : '-'}</div>
              <div><span className="text-slate-500">Loc.Price:</span> {formatRupiah(mat.localPrice)}</div>
              <div><span className="text-slate-500">Currency:</span> {mat.currency || 'IDR'}</div>
              <div><span className="text-slate-500">ManHour:</span> {mat.manHour}</div>
            </div>
          )}
          {level >= 4 && (
            <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Disc(USD):</span><span>{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">To IDR:</span><span>{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Disc(IDR):</span><span>{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">+ManHr:</span><span>{formatRupiah(calc.priceAfterManHour)}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProductMaterialTable = ({ materials, calculateRow, formatRupiah, formatUSD, initialLevel = 1 }) => {
  const [filters, setFilters] = useState({ item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '' });
  const [level, setLevel] = useState(initialLevel);
  
  const filteredMaterials = materials.filter(mat => {
    const check = (val, filter) => !filter || (val || '').toLowerCase().includes(filter.toLowerCase());
    return check(mat.item, filters.item) && check(mat.brand, filters.brand) && check(mat.series, filters.series) && 
           check(mat.pole, filters.pole) && check(mat.ka, filters.ka) && check(mat.ampere, filters.ampere) && check(mat.detail, filters.detail);
  });

  const hasActiveFilters = Object.values(filters).some(f => f);

  // Column visibility by level
  const showCol = {
    // Level 1: Basic
    item: true, brand: true, detail: true, qty: true, unit: true, total: true,
    // Level 2: + Specs
    series: level >= 2, pole: level >= 2, ka: level >= 2, ampere: level >= 2, factor: level >= 2, disc: level >= 2,
    // Level 3: + Pricing
    intPrice: level >= 3, locPrice: level >= 3, currency: level >= 3, manHr: level >= 3,
    // Level 4: + Calculations
    discUSD: level >= 4, toIDR: level >= 4, discIDR: level >= 4, plusManHr: level >= 4
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 w-full">
      {/* Header with Level Selector */}
      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">View Detail:</span>
          <LevelSelector level={level} setLevel={setLevel} />
        </div>
        <span className="text-xs text-slate-400">{filteredMaterials.length} items</span>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-b">
          <Filter size={12} className="text-yellow-600"/>
          <span className="text-xs text-yellow-700">Filter aktif ({filteredMaterials.length} dari {materials.length})</span>
          <button onClick={() => setFilters({ item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '' })} className="text-xs text-red-500 hover:underline ml-2">Reset</button>
        </div>
      )}
      
      {/* Mobile View */}
      <div className="md:hidden p-3">
        {filteredMaterials.map((mat) => (
          <MobileMatCard key={mat.id} mat={mat} calc={calculateRow(mat)} formatRupiah={formatRupiah} formatUSD={formatUSD} level={level} />
        ))}
        {filteredMaterials.length === 0 && <p className="text-center text-slate-400 py-4">Tidak ada data</p>}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-white sticky top-0 z-10">
            <tr>
              {/* Level 1: Basic */}
              <FilterHeader label="Item" field="item" filters={filters} setFilters={setFilters} />
              <FilterHeader label="Brand" field="brand" filters={filters} setFilters={setFilters} />
              <FilterHeader label="Material Desc" field="detail" filters={filters} setFilters={setFilters} />
              <th className="p-2 border-r border-slate-600 bg-blue-900 text-center whitespace-nowrap">Qty</th>
              <th className="p-2 border-r border-slate-600 bg-blue-900 text-center whitespace-nowrap">Unit</th>
              
              {/* Level 2: Specs */}
              {showCol.series && <FilterHeader label="Series" field="series" filters={filters} setFilters={setFilters} />}
              {showCol.pole && <FilterHeader label="Pole" field="pole" filters={filters} setFilters={setFilters} />}
              {showCol.ka && <FilterHeader label="KA" field="ka" filters={filters} setFilters={setFilters} />}
              {showCol.ampere && <FilterHeader label="Ampere" field="ampere" filters={filters} setFilters={setFilters} />}
              {showCol.factor && <th className="p-2 border-r border-slate-600 bg-green-900 text-center whitespace-nowrap">Fctr</th>}
              {showCol.disc && <th className="p-2 border-r border-slate-600 bg-green-900 text-center whitespace-nowrap">Disc%</th>}
              
              {/* Level 3: Pricing */}
              {showCol.intPrice && <th className="p-2 border-r border-slate-600 bg-blue-900 text-right whitespace-nowrap">Int.Price</th>}
              {showCol.locPrice && <th className="p-2 border-r border-slate-600 bg-blue-900 text-right whitespace-nowrap">Loc.Price</th>}
              {showCol.currency && <th className="p-2 border-r border-slate-600 bg-blue-900 text-center whitespace-nowrap">Cur</th>}
              {showCol.manHr && <th className="p-2 border-r border-slate-600 bg-green-900 text-center whitespace-nowrap">ManHr</th>}
              
              {/* Level 4: Calculations */}
              {showCol.discUSD && <th className="p-2 border-r border-slate-600 bg-slate-700 text-right whitespace-nowrap">Disc(USD)</th>}
              {showCol.toIDR && <th className="p-2 border-r border-slate-600 bg-slate-700 text-right whitespace-nowrap">To IDR</th>}
              {showCol.discIDR && <th className="p-2 border-r border-slate-600 bg-slate-700 text-right whitespace-nowrap">Disc(IDR)</th>}
              {showCol.plusManHr && <th className="p-2 border-r border-slate-600 bg-slate-700 text-right whitespace-nowrap">+ManHr</th>}
              
              <th className="p-2 bg-blue-800 text-right font-bold text-yellow-300 whitespace-nowrap">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
            {filteredMaterials.map((mat) => {
              const calc = calculateRow(mat);
              return (
                <tr key={mat.id} className="hover:bg-blue-50 dark:hover:bg-slate-800">
                  {/* Level 1 */}
                  <td className="p-2 border-r whitespace-nowrap">{mat.item || '-'}</td>
                  <td className="p-2 border-r whitespace-nowrap">{mat.brand || '-'}</td>
                  <td className="p-2 border-r bg-slate-50 dark:bg-slate-800 whitespace-nowrap">{mat.detail || '-'}</td>
                  <td className="p-2 border-r text-center font-bold whitespace-nowrap">{mat.qty}</td>
                  <td className="p-2 border-r text-center whitespace-nowrap">{mat.unit}</td>
                  
                  {/* Level 2 */}
                  {showCol.series && <td className="p-2 border-r whitespace-nowrap">{mat.series || '-'}</td>}
                  {showCol.pole && <td className="p-2 border-r whitespace-nowrap">{mat.pole || '-'}</td>}
                  {showCol.ka && <td className="p-2 border-r whitespace-nowrap">{mat.ka || '-'}</td>}
                  {showCol.ampere && <td className="p-2 border-r whitespace-nowrap">{mat.ampere || '-'}</td>}
                  {showCol.factor && <td className="p-2 border-r text-center whitespace-nowrap">{mat.factor}</td>}
                  {showCol.disc && <td className="p-2 border-r text-center whitespace-nowrap">{mat.diskon}%</td>}
                  
                  {/* Level 3 */}
                  {showCol.intPrice && <td className="p-2 border-r text-right font-mono whitespace-nowrap">{mat.internationalPrice > 0 ? formatUSD(mat.internationalPrice) : '-'}</td>}
                  {showCol.locPrice && <td className="p-2 border-r text-right font-mono whitespace-nowrap">{formatRupiah(mat.localPrice)}</td>}
                  {showCol.currency && <td className="p-2 border-r text-center whitespace-nowrap">{mat.currency || 'IDR'}</td>}
                  {showCol.manHr && <td className="p-2 border-r text-center whitespace-nowrap">{mat.manHour}</td>}
                  
                  {/* Level 4 */}
                  {showCol.discUSD && <td className="p-2 border-r text-right font-mono bg-slate-50 dark:bg-slate-800 whitespace-nowrap">{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</td>}
                  {showCol.toIDR && <td className="p-2 border-r text-right font-mono bg-slate-50 dark:bg-slate-800 whitespace-nowrap">{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</td>}
                  {showCol.discIDR && <td className="p-2 border-r text-right font-mono bg-slate-50 dark:bg-slate-800 whitespace-nowrap">{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</td>}
                  {showCol.plusManHr && <td className="p-2 border-r text-right font-mono bg-slate-50 dark:bg-slate-800 whitespace-nowrap">{formatRupiah(calc.priceAfterManHour)}</td>}
                  
                  <td className="p-2 text-right bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold font-mono whitespace-nowrap">{formatRupiah(calc.totalPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductMaterialTable;
