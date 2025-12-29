import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Filter, X, Edit2, Trash2, Package, Plus, Save } from 'lucide-react';
import { formatRupiah, formatUSD } from '../../data/mockData';

const FilterHeader = ({ label, field, filters, setFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);
  const hasFilter = filters[field];

  return (
    <th className="p-2 border-r border-slate-600 text-left bg-slate-800 text-white whitespace-nowrap">
      {!isOpen ? (
        <div className="flex items-center justify-between cursor-pointer gap-1" onClick={() => setIsOpen(true)}>
          <span className="text-xs font-bold uppercase">{label}</span>
          {hasFilter && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>}
          <Filter size={12} className={hasFilter ? 'text-yellow-300' : 'text-white/50'} />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <input ref={inputRef} type="text" placeholder="Cari..." className="w-20 px-1.5 py-1 text-xs rounded text-slate-900 outline-none" value={filters[field] || ''} onChange={(e) => setFilters(prev => ({ ...prev, [field]: e.target.value }))} />
          <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-red-400"><X size={14} /></button>
        </div>
      )}
    </th>
  );
};

// Memoized Row Component
const MaterialRow = React.memo(({ m, onEdit, onDelete }) => (
  <tr className="hover:bg-blue-50 dark:hover:bg-slate-800">
    <td className="p-2 border-r font-medium">{m.item}</td>
    <td className="p-2 border-r">{m.brand}</td>
    <td className="p-2 border-r max-w-[200px] truncate">{m.detail}</td>
    <td className="p-2 border-r text-center">{m.unit}</td>
    <td className="p-2 border-r">{m.series || '-'}</td>
    <td className="p-2 border-r text-center">{m.pole || '-'}</td>
    <td className="p-2 border-r text-center">{m.ka || '-'}</td>
    <td className="p-2 border-r text-center">{m.ampere || '-'}</td>
    <td className="p-2 border-r text-center bg-green-50/50">{m.factor || 1}</td>
    <td className="p-2 border-r text-center bg-green-50/50">{m.diskon || 0}%</td>
    <td className="p-2 border-r text-right font-mono">{m.internationalPrice > 0 ? formatUSD(m.internationalPrice) : '-'}</td>
    <td className="p-2 border-r text-right font-mono">{m.localPrice > 0 ? formatRupiah(m.localPrice) : '-'}</td>
    <td className="p-2 border-r text-center">{m.currency || 'IDR'}</td>
    <td className="p-2 border-r text-center">{m.manHour || 0}</td>
    <td className="p-2 text-center">
      <div className="flex justify-center gap-1">
        <button onClick={() => onEdit(m)} className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={14}/></button>
        <button onClick={() => onDelete(m.id)} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
      </div>
    </td>
  </tr>
));

const emptyRow = { item: '', brand: '', detail: '', unit: 'UNIT', series: '', pole: '', ka: '', ampere: '', factor: 1, diskon: 0, internationalPrice: 0, localPrice: 0, currency: 'IDR', manHour: 0, vendor: '' };

const TableViewMaterial = ({ materials, onEdit, onDelete, onAdd }) => {
  const [filters, setFilters] = useState({ item: '', brand: '', detail: '', series: '', pole: '', ka: '', ampere: '' });
  const [newRow, setNewRow] = useState(null);

  // Local filter for table columns
  const filteredMaterials = React.useMemo(() => {
    const check = (val, filter) => !filter || (val || '').toLowerCase().includes(filter.toLowerCase());
    return materials.filter(m =>
      check(m.item, filters.item) && check(m.brand, filters.brand) && check(m.detail, filters.detail) &&
      check(m.series, filters.series) && check(m.pole, filters.pole) && check(m.ka, filters.ka) && check(m.ampere, filters.ampere)
    );
  }, [materials, filters]);

  const hasActiveFilters = Object.values(filters).some(f => f);

  const handleNewRowChange = useCallback((field, value) => setNewRow(prev => ({ ...prev, [field]: value })), []);

  const handleSaveNewRow = useCallback(() => {
    if (!newRow.item || !newRow.brand) return alert('Item dan Brand wajib diisi!');
    onAdd({ ...newRow, id: `c${Date.now()}`, internationalPrice: parseFloat(newRow.internationalPrice) || 0, localPrice: parseFloat(newRow.localPrice) || 0, manHour: parseFloat(newRow.manHour) || 0 });
    setNewRow(null);
  }, [newRow, onAdd]);

  return (
    <div className="rounded-xl shadow-sm overflow-hidden bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      {hasActiveFilters && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-b">
          <Filter size={12} className="text-yellow-600"/>
          <span className="text-xs text-yellow-700">Column filter aktif ({filteredMaterials.length} dari {materials.length})</span>
          <button onClick={() => setFilters({ item: '', brand: '', detail: '', series: '', pole: '', ka: '', ampere: '' })} className="text-xs text-red-500 hover:underline ml-2">Reset</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-white">
            <tr>
              <FilterHeader label="Item" field="item" filters={filters} setFilters={setFilters} />
              <FilterHeader label="Brand" field="brand" filters={filters} setFilters={setFilters} />
              <FilterHeader label="Material Desc" field="detail" filters={filters} setFilters={setFilters} />
              <th className="p-2 border-r border-slate-600 bg-blue-900 text-center">Unit</th>
              <FilterHeader label="Series" field="series" filters={filters} setFilters={setFilters} />
              <FilterHeader label="Pole" field="pole" filters={filters} setFilters={setFilters} />
              <FilterHeader label="KA" field="ka" filters={filters} setFilters={setFilters} />
              <FilterHeader label="Ampere" field="ampere" filters={filters} setFilters={setFilters} />
              <th className="p-2 border-r border-slate-600 bg-green-900 text-center">Fctr</th>
              <th className="p-2 border-r border-slate-600 bg-green-900 text-center">Disc%</th>
              <th className="p-2 border-r border-slate-600 bg-blue-900 text-right">Int.Price</th>
              <th className="p-2 border-r border-slate-600 bg-blue-900 text-right">Loc.Price</th>
              <th className="p-2 border-r border-slate-600 bg-blue-900 text-center">Cur</th>
              <th className="p-2 border-r border-slate-600 bg-green-900 text-center">ManHr</th>
              <th className="p-2 bg-slate-800 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMaterials.map((m) => (
              <MaterialRow key={m.id} m={m} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {filteredMaterials.length === 0 && !newRow && (
              <tr><td colSpan="15" className="p-8 text-center text-slate-400"><Package size={24} className="mx-auto mb-2" />No materials found</td></tr>
            )}
            {/* New Row Input */}
            {newRow && (
              <tr className="bg-blue-50 dark:bg-blue-900/20">
                <td className="p-1 border-r"><input type="text" placeholder="Item*" value={newRow.item} onChange={(e) => handleNewRowChange('item', e.target.value)} className="w-full px-2 py-1 text-xs border rounded" /></td>
                <td className="p-1 border-r"><input type="text" placeholder="Brand*" value={newRow.brand} onChange={(e) => handleNewRowChange('brand', e.target.value)} className="w-full px-2 py-1 text-xs border rounded" /></td>
                <td className="p-1 border-r"><input type="text" placeholder="Detail" value={newRow.detail} onChange={(e) => handleNewRowChange('detail', e.target.value)} className="w-full px-2 py-1 text-xs border rounded" /></td>
                <td className="p-1 border-r"><select value={newRow.unit} onChange={(e) => handleNewRowChange('unit', e.target.value)} className="w-full px-1 py-1 text-xs border rounded"><option>UNIT</option><option>SET</option><option>PCS</option><option>METER</option></select></td>
                <td className="p-1 border-r"><input type="text" placeholder="Series" value={newRow.series} onChange={(e) => handleNewRowChange('series', e.target.value)} className="w-full px-2 py-1 text-xs border rounded" /></td>
                <td className="p-1 border-r"><input type="text" placeholder="Pole" value={newRow.pole} onChange={(e) => handleNewRowChange('pole', e.target.value)} className="w-14 px-2 py-1 text-xs border rounded" /></td>
                <td className="p-1 border-r"><input type="text" placeholder="KA" value={newRow.ka} onChange={(e) => handleNewRowChange('ka', e.target.value)} className="w-14 px-2 py-1 text-xs border rounded" /></td>
                <td className="p-1 border-r"><input type="text" placeholder="Ampere" value={newRow.ampere} onChange={(e) => handleNewRowChange('ampere', e.target.value)} className="w-16 px-2 py-1 text-xs border rounded" /></td>
                <td className="p-1 border-r"><input type="number" value={newRow.factor} onChange={(e) => handleNewRowChange('factor', e.target.value)} className="w-12 px-1 py-1 text-xs border rounded text-center" /></td>
                <td className="p-1 border-r"><input type="number" value={newRow.diskon} onChange={(e) => handleNewRowChange('diskon', e.target.value)} className="w-12 px-1 py-1 text-xs border rounded text-center" /></td>
                <td className="p-1 border-r"><input type="number" placeholder="0" value={newRow.internationalPrice} onChange={(e) => handleNewRowChange('internationalPrice', e.target.value)} className="w-20 px-1 py-1 text-xs border rounded text-right" /></td>
                <td className="p-1 border-r"><input type="number" placeholder="0" value={newRow.localPrice} onChange={(e) => handleNewRowChange('localPrice', e.target.value)} className="w-24 px-1 py-1 text-xs border rounded text-right" /></td>
                <td className="p-1 border-r"><select value={newRow.currency} onChange={(e) => handleNewRowChange('currency', e.target.value)} className="w-14 px-1 py-1 text-xs border rounded"><option>IDR</option><option>USD</option></select></td>
                <td className="p-1 border-r"><input type="number" value={newRow.manHour} onChange={(e) => handleNewRowChange('manHour', e.target.value)} className="w-16 px-1 py-1 text-xs border rounded text-center" /></td>
                <td className="p-1 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={handleSaveNewRow} className="p-1 rounded text-green-600 hover:bg-green-50"><Save size={14}/></button>
                    <button onClick={() => setNewRow(null)} className="p-1 rounded text-red-500 hover:bg-red-50"><X size={14}/></button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Button */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t flex justify-start">
        <button onClick={() => setNewRow({ ...emptyRow })} disabled={newRow} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus size={14}/> Add New Material
        </button>
      </div>
    </div>
  );
};

export default TableViewMaterial;
