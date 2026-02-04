import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, ChevronUp, Trash2, Plus, Filter, X } from 'lucide-react';
import { formatRupiah, formatUSD } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';
import { api } from '../../lib/api';

export const KURS_USD = 16000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);

export const SearchableSelect = ({ value, options = [], onChange, placeholder = '-' }) => {
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
    if (isOpen && inputRef.current) inputRef.current.focus();
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

  const filteredOptions = options.filter((o) => {
    if (!searchTerm) return true;
    return String(o).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full p-2 text-left bg-transparent flex items-center justify-between gap-1 hover:bg-slate-100 rounded"
      >
        <span className={`truncate text-xs ${value ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400'}`}>{value || placeholder}</span>
        <ChevronDown size={12} className="text-slate-400" />
      </button>
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, zIndex: 9999, maxHeight: 280 }}
            className={`bg-white border rounded-lg shadow-xl flex flex-col ${pos.openUp ? 'flex-col-reverse' : ''}`}
          >
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
              <div onClick={() => handleSelect('')} className="px-3 py-2 text-xs cursor-pointer hover:bg-red-50 text-slate-400 italic border-b">
                — Kosongkan —
              </div>
              {filteredOptions.length === 0 && <div className="px-3 py-2 text-xs text-slate-400">Tidak ditemukan</div>}
              {filteredOptions.map((o, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelect(o)}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${value === o ? 'bg-blue-100 text-blue-700 font-bold' : ''}`}
                >
                  {o}
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export const MobileItemCard = ({ item, calc, getDropdownOptions, handleChange, handleDeleteRow, formatRupiah }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border mb-3">
      <div className="p-3 flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{item.detail || 'Material belum dipilih'}</p>
          <p className="text-xs text-slate-500">
            {item.item} • {item.brand} • Qty: {item.qty}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-blue-600">{formatRupiah(calc.totalPrice)}</span>
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </div>
      {expanded && (
        <div className="p-3 pt-0 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Item</div>
              <SearchableSelect value={item.item || ''} options={getDropdownOptions(item, 'item')} onChange={(v) => handleChange(item.id, 'item', v)} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Brand</div>
              <SearchableSelect value={item.brand || ''} options={getDropdownOptions(item, 'brand')} onChange={(v) => handleChange(item.id, 'brand', v)} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Series</div>
              <SearchableSelect value={item.series || ''} options={getDropdownOptions(item, 'series')} onChange={(v) => handleChange(item.id, 'series', v)} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Detail</div>
              <SearchableSelect value={item.detail || ''} options={getDropdownOptions(item, 'detail')} onChange={(v) => handleChange(item.id, 'detail', v)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDeleteRow(item.id)}
              className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
            onChange={(e) => setFilters((prev) => ({ ...prev, [field]: e.target.value }))}
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelData, setPanelData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '' });

  const originalItemsRef = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [panelRes, matsRes] = await Promise.all([
          api.get(`/api/product-panels/${panelId}`),
          api.get('/api/materials?limit=500&offset=0')
        ]);
        setPanelData(panelRes.data);
        setItems(panelRes.data.defaultMaterials || []);
        originalItemsRef.current = panelRes.data.defaultMaterials || [];
        setMaterials(matsRes.data || []);
      } finally {
        setLoading(false);
      }
    })().catch((e) => alert(e.message));
  }, [panelId]);

  const calculateRow = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const factor = parseFloat(item.factor) || 1;
    const diskon = parseFloat(item.diskon) || 0;
    const manHour = parseFloat(item.manHour) || 0;
    const intPrice = parseFloat(item.internationalPrice) || 0;
    const locPrice = parseFloat(item.localPrice) || 0;
    const discRate = (100 - diskon) / 100;
    const pDiscUSD = intPrice > 0 ? (intPrice * discRate) / factor : 0;
    const pIDR = pDiscUSD > 0 ? pDiscUSD * KURS_USD : 0;
    const sumPriceIDR = locPrice + (intPrice > 0 ? intPrice * KURS_USD : 0);
    const pDiscIDR = sumPriceIDR > 0 ? (sumPriceIDR * discRate) / factor : 0;
    return {
      priceAfterDiscUSD: pDiscUSD,
      priceBecomeIDR: pIDR,
      priceAfterDiscIDR: pDiscIDR,
      priceAfterManHour: pDiscIDR + manHour / factor,
      totalPrice: (pDiscIDR + manHour / factor) * qty
    };
  };

  const getDropdownOptions = (row, field) => {
    const filtered = materials.filter((c) => {
      if (field !== 'item' && row.item && c.item !== row.item) return false;
      if (field !== 'brand' && row.brand && c.brand !== row.brand) return false;
      if (field !== 'series' && row.series && c.series !== row.series) return false;
      if (field !== 'pole' && row.pole && c.pole !== row.pole) return false;
      if (field !== 'ka' && row.ka && c.ka !== row.ka) return false;
      if (field !== 'ampere' && row.ampere && c.ampere !== row.ampere) return false;
      if (field !== 'detail' && row.detail && c.detail !== row.detail) return false;
      return true;
    });
    return [...new Set(filtered.map((c) => c[field]).filter(Boolean))];
  };

  const handleChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        if (['qty', 'factor', 'diskon'].includes(field)) {
          return { ...row, [field]: value };
        }

        let updatedRow = { ...row, [field]: value };
        if (!value) return updatedRow;

        const matches = materials.filter((c) => {
          if (updatedRow.item && c.item !== updatedRow.item) return false;
          if (updatedRow.brand && c.brand !== updatedRow.brand) return false;
          if (updatedRow.series && c.series !== updatedRow.series) return false;
          if (updatedRow.pole && c.pole !== updatedRow.pole) return false;
          if (updatedRow.ka && c.ka !== updatedRow.ka) return false;
          if (updatedRow.ampere && c.ampere !== updatedRow.ampere) return false;
          if (updatedRow.detail && c.detail !== updatedRow.detail) return false;
          return true;
        });

        if (matches.length === 1) {
          const m = matches[0];
          updatedRow = {
            ...updatedRow,
            item: m.item,
            brand: m.brand,
            series: m.series,
            pole: m.pole,
            ka: m.ka,
            ampere: m.ampere,
            detail: m.detail,
            unit: m.unit,
            internationalPrice: m.internationalPrice,
            localPrice: m.localPrice,
            currency: m.currency,
            manHour: m.manHour,
            vendor: m.vendor,
            qty: row.qty || 1,
            factor: row.factor || 1,
            diskon: row.diskon || 0
          };
        }
        return updatedRow;
      })
    );
  };

  const handleAddNewRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        item: '',
        brand: '',
        series: '',
        pole: '',
        ka: '',
        ampere: '',
        detail: '',
        qty: 1,
        factor: 1,
        diskon: 0,
        manHour: 0,
        localPrice: 0,
        internationalPrice: 0,
        unit: 'PCS',
        currency: 'IDR'
      }
    ]);
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('Hapus baris ini?')) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toPayload = (row, sortOrder) => ({
    sortOrder,
    qty: row.qty ?? 1,
    factor: row.factor ?? 1,
    diskon: row.diskon ?? 0,
    item: row.item ?? null,
    brand: row.brand ?? null,
    series: row.series ?? null,
    pole: row.pole ?? null,
    ka: row.ka ?? null,
    ampere: row.ampere ?? null,
    detail: row.detail ?? null,
    unit: row.unit ?? null,
    internationalPrice: row.internationalPrice ?? 0,
    localPrice: row.localPrice ?? 0,
    currency: row.currency ?? 'IDR',
    manHour: row.manHour ?? 0,
    vendor: row.vendor ?? null
  });

  const handleSave = () => {
    (async () => {
      if (!panelData) return;
      setSaving(true);
      try {
        const originalIds = (originalItemsRef.current || []).map((r) => r.id).filter(isUuid);
        const currentIds = items.map((r) => r.id).filter(isUuid);
        const deleted = originalIds.filter((id) => !currentIds.includes(id));

        for (const id of deleted) {
          await api.delete(`/api/product-panel-materials/${id}`);
        }

        const nextItems = [...items];
        for (let i = 0; i < items.length; i++) {
          const row = items[i];
          const payload = toPayload(row, i);
          if (isUuid(row.id)) {
            await api.patch(`/api/product-panel-materials/${row.id}`, payload);
          } else {
            const res = await api.post(`/api/product-panels/${panelData.id}/materials`, payload);
            nextItems[i] = { ...row, id: res.data.id };
          }
        }

        const refreshed = await api.get(`/api/product-panels/${panelData.id}`);
        setPanelData(refreshed.data);
        setItems(refreshed.data.defaultMaterials || []);
        originalItemsRef.current = refreshed.data.defaultMaterials || [];

        alert('Data berhasil diperbarui!');
        navigate(-1);
      } finally {
        setSaving(false);
      }
    })().catch((e) => alert(e.message));
  };

  const grandTotal = items.reduce((sum, item) => sum + calculateRow(item).totalPrice, 0);

  const hasActiveFilters = Object.values(filters).some((f) => f);
  const filteredItems = items.filter((item) => {
    const check = (val, filter) => !filter || (val || '').toLowerCase().includes(filter.toLowerCase());
    return (
      check(item.item, filters.item) &&
      check(item.brand, filters.brand) &&
      check(item.series, filters.series) &&
      check(item.pole, filters.pole) &&
      check(item.ka, filters.ka) &&
      check(item.ampere, filters.ampere) &&
      check(item.detail, filters.detail)
    );
  });

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!panelData) return <div className="h-screen flex items-center justify-center">Panel Tidak Ditemukan</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Edit Product" />

      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-full xl:max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-base truncate">{panelData.name}</h2>
              <p className="text-[10px] text-slate-500">
                Total material: <span className="font-bold text-blue-600">{formatRupiah(grandTotal)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
          >
            <Save size={18} />
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Simpan'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4 lg:p-6">
        <div className="max-w-full xl:max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border overflow-x-auto">
            <div className="lg:hidden p-3">
              {filteredItems.map((item) => (
                <MobileItemCard
                  key={item.id}
                  item={item}
                  calc={calculateRow(item)}
                  getDropdownOptions={getDropdownOptions}
                  handleChange={handleChange}
                  handleDeleteRow={handleDeleteRow}
                  formatRupiah={formatRupiah}
                  SearchableSelect={SearchableSelect}
                />
              ))}
              <button
                onClick={handleAddNewRow}
                className="w-full py-3 text-blue-600 font-bold text-sm flex items-center justify-center gap-2 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200"
              >
                <Plus size={18} /> Tambah Material
              </button>
            </div>

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
                    <th className="p-2 bg-blue-800 text-right whitespace-nowrap font-bold text-yellow-300">TOTAL</th>
                  </tr>
                </thead>
                {hasActiveFilters && (
                  <caption className="caption-top bg-yellow-50 p-2 text-left">
                    <div className="flex items-center gap-2 text-xs">
                      <Filter size={12} className="text-yellow-600" />
                      <span className="text-yellow-700 font-bold">Filter aktif ({filteredItems.length} dari {items.length})</span>
                      <button onClick={() => setFilters({ item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '' })} className="ml-auto text-xs text-red-600 font-bold">
                        Clear
                      </button>
                    </div>
                  </caption>
                )}
                <tbody className="divide-y bg-white">
                  {filteredItems.map((item) => {
                    const calc = calculateRow(item);
                    return (
                      <tr key={item.id} className="hover:bg-blue-50">
                        <td className="p-1 border-r text-center">
                          <button onClick={() => handleDeleteRow(item.id)} className="text-slate-400 hover:text-red-500 p-1 rounded">
                            <Trash2 size={14} />
                          </button>
                        </td>
                        <td className="p-1 border-r">
                          <SearchableSelect value={item.item || ''} options={getDropdownOptions(item, 'item')} onChange={(v) => handleChange(item.id, 'item', v)} />
                        </td>
                        <td className="p-1 border-r">
                          <SearchableSelect value={item.brand || ''} options={getDropdownOptions(item, 'brand')} onChange={(v) => handleChange(item.id, 'brand', v)} />
                        </td>
                        <td className="p-1 border-r">
                          <SearchableSelect value={item.series || ''} options={getDropdownOptions(item, 'series')} onChange={(v) => handleChange(item.id, 'series', v)} />
                        </td>
                        <td className="p-1 border-r">
                          <SearchableSelect value={item.pole || ''} options={getDropdownOptions(item, 'pole')} onChange={(v) => handleChange(item.id, 'pole', v)} />
                        </td>
                        <td className="p-1 border-r">
                          <SearchableSelect value={item.ka || ''} options={getDropdownOptions(item, 'ka')} onChange={(v) => handleChange(item.id, 'ka', v)} />
                        </td>
                        <td className="p-1 border-r">
                          <SearchableSelect value={item.ampere || ''} options={getDropdownOptions(item, 'ampere')} onChange={(v) => handleChange(item.id, 'ampere', v)} />
                        </td>
                        <td className="p-1 border-r">
                          <SearchableSelect value={item.detail || ''} options={getDropdownOptions(item, 'detail')} onChange={(v) => handleChange(item.id, 'detail', v)} />
                        </td>
                        <td className="p-1 border-r whitespace-nowrap">
                          <input
                            type="text"
                            style={{ width: `${String(item.qty || '').length + 3}ch` }}
                            className="p-1.5 text-center bg-blue-50 font-bold rounded text-xs border border-blue-200"
                            value={item.qty || ''}
                            onChange={(e) => handleChange(item.id, 'qty', e.target.value)}
                          />
                        </td>
                        <td className="p-1 border-r whitespace-nowrap text-center text-xs">{item.unit || '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">
                          {item.internationalPrice > 0 ? formatUSD(item.internationalPrice) : '-'}
                        </td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{item.localPrice ? formatRupiah(item.localPrice) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-center text-xs">{item.currency || 'IDR'}</td>
                        <td className="p-1 border-r whitespace-nowrap">
                          <input
                            type="text"
                            style={{ width: `${String(item.factor || '').length + 3}ch` }}
                            className="p-1.5 text-center bg-green-50 rounded text-xs border border-green-200"
                            value={item.factor || ''}
                            onChange={(e) => handleChange(item.id, 'factor', e.target.value)}
                          />
                        </td>
                        <td className="p-1 border-r whitespace-nowrap">
                          <input
                            type="text"
                            style={{ width: `${String(item.diskon || '').length + 3}ch` }}
                            className="p-1.5 text-center bg-green-50 rounded text-xs border border-green-200"
                            value={item.diskon || ''}
                            onChange={(e) => handleChange(item.id, 'diskon', e.target.value)}
                          />
                        </td>
                        <td className="p-1 border-r whitespace-nowrap text-center text-xs">{item.manHour || '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</td>
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">
                          {formatRupiah((parseFloat(item.manHour) || 0) / (parseFloat(item.factor) || 1))}
                        </td>
                        <td className="p-1 whitespace-nowrap text-right text-xs font-mono font-bold text-purple-800 bg-purple-50">{formatRupiah(calc.totalPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-3 bg-slate-50 border-t flex justify-center">
                <button onClick={handleAddNewRow} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-bold text-xs py-1.5 px-4 rounded-lg hover:bg-purple-100">
                  <Plus size={14} /> Add New Material
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
