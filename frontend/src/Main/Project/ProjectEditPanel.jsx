import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Filter } from 'lucide-react';
import MobileHeader from '../../components/MobileHeader';
import { formatRupiah, formatUSD } from '../../data/mockData';
import { api } from '../../lib/api';
import { KURS_USD, SearchableSelect, MobileItemCard, FilterHeader } from '../Product/ProductEditPanel';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);

const ProjectEditPanel = ({ setSidebarOpen }) => {
  const { panelId, projectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelData, setPanelData] = useState(null);
  const [items, setItems] = useState([]);
  const [panelQty, setPanelQty] = useState(1);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({ item: '', brand: '', series: '', pole: '', ka: '', ampere: '', detail: '' });

  const originalItemsRef = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [panelRes, matsRes] = await Promise.all([
          api.get(`/api/project-panels/${panelId}`),
          api.get('/api/materials?limit=500&offset=0')
        ]);
        setPanelData(panelRes.data);
        setItems(panelRes.data.materials || []);
        originalItemsRef.current = panelRes.data.materials || [];
        setPanelQty(panelRes.data.jumlah || 1);
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
    const pDiscUSD = intPrice > 0 ? intPrice * factor * ((100 - diskon) / 100) : 0;
    const pIDR = pDiscUSD > 0 ? pDiscUSD * KURS_USD : 0;
    const pDiscIDR = locPrice > 0 ? locPrice * factor * ((100 - diskon) / 100) : 0;
    const baseP = pIDR > 0 ? pIDR : pDiscIDR;
    return { priceAfterDiscUSD: pDiscUSD, priceBecomeIDR: pIDR, priceAfterDiscIDR: pDiscIDR, priceAfterManHour: baseP + manHour, totalPrice: (baseP + manHour) * qty };
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
        if (['qty', 'factor', 'diskon'].includes(field)) return { ...row, [field]: value };

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

  const grandTotalPerPanel = items.reduce((sum, item) => sum + calculateRow(item).totalPrice, 0);
  const grandTotalPanel = grandTotalPerPanel * (panelQty || 1);

  const hasActiveFilters = Object.values(filters).some((f) => f);
  const filteredItems = useMemo(() => {
    const check = (val, filter) => !filter || (val || '').toLowerCase().includes(filter.toLowerCase());
    return items.filter(
      (item) =>
        check(item.item, filters.item) &&
        check(item.brand, filters.brand) &&
        check(item.series, filters.series) &&
        check(item.pole, filters.pole) &&
        check(item.ka, filters.ka) &&
        check(item.ampere, filters.ampere) &&
        check(item.detail, filters.detail)
    );
  }, [items, filters]);

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
      if (items.some((i) => !i.detail)) return alert('Gagal Simpan! Deskripsi material kosong.');

      setSaving(true);
      try {
        await api.patch(`/api/project-panels/${panelData.id}`, { jumlah: panelQty });

        const originalIds = (originalItemsRef.current || []).map((r) => r.id).filter(isUuid);
        const currentIds = items.map((r) => r.id).filter(isUuid);
        const deleted = originalIds.filter((id) => !currentIds.includes(id));
        for (const id of deleted) await api.delete(`/api/project-panel-materials/${id}`);

        const nextItems = [...items];
        for (let i = 0; i < items.length; i++) {
          const row = items[i];
          const payload = toPayload(row, i);
          if (isUuid(row.id)) {
            await api.patch(`/api/project-panel-materials/${row.id}`, payload);
          } else {
            const res = await api.post(`/api/project-panels/${panelData.id}/materials`, payload);
            nextItems[i] = { ...row, id: res.data.id };
          }
        }

        alert('Simpan berhasil');
        navigate(`/projects/${projectId}`);
      } finally {
        setSaving(false);
      }
    })().catch((e) => alert(e.message));
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!panelData) return <div className="h-screen flex items-center justify-center">Panel tidak ditemukan</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Edit Panel" />

      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-full xl:max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate(`/projects/${projectId}`)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h2 className="font-black text-sm sm:text-base truncate">{panelData.jenis}</h2>
              <p className="text-[10px] sm:text-xs text-slate-500">
                Kurs: <span className="text-blue-600 font-bold">{formatRupiah(KURS_USD)}</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right mr-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total ({panelQty} Panel)</p>
            <p className="text-lg font-black text-green-600">{formatRupiah(grandTotalPanel)}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-slate-500">Qty</span>
              <input
                type="number"
                min="1"
                className="w-16 bg-transparent border-none focus:ring-0 text-xs font-bold p-0 text-center"
                value={panelQty}
                onChange={(e) => setPanelQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
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
        </div>
        <div className="sm:hidden px-4 pb-2 flex justify-between items-center border-t pt-2">
          <span className="text-xs text-slate-500">Total ({panelQty} Panel)</span>
          <span className="text-sm font-black text-green-600">{formatRupiah(grandTotalPanel)}</span>
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
              <button onClick={handleAddNewRow} className="w-full py-3 text-blue-600 font-bold text-sm flex items-center justify-center gap-2 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
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
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900">
                  {filteredItems.map((item) => {
                    const calc = calculateRow(item);
                    return (
                      <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-slate-800">
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
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{item.internationalPrice > 0 ? formatUSD(item.internationalPrice) : '-'}</td>
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
                        <td className="p-1 border-r whitespace-nowrap text-right text-xs font-mono">{formatRupiah(calc.priceAfterManHour)}</td>
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
        </div>
      </main>
    </div>
  );
};

export default ProjectEditPanel;

