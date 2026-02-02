import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, FileEdit, X, Save } from 'lucide-react';
import MobileHeader from '../../components/MobileHeader';
import ProjectExcel from '../../Pages/ProjectExcel';
import ProjectWord from '../../Pages/ProjectWord';
import { formatRupiah, formatUSD, KURS_USD } from '../../data/mockData';
import { api } from '../../lib/api';

const DEFAULT_ADDITIONAL_COSTS = {
  packing: 0,
  shipping: 0,
  installation: 0,
  testing: 0,
  documentation: 0,
  other: 0
};

const ProjectDetail = ({ setSidebarOpen }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingCosts, setSavingCosts] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  const [panels, setPanels] = useState([]);
  const [additionalCosts, setAdditionalCosts] = useState(DEFAULT_ADDITIONAL_COSTS);

  const [masterPanels, setMasterPanels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ masterPanelId: '', jenis: '', jumlah: 1, hargaSatuan: 0, isCustom: false });

  const load = async () => {
    setLoading(true);
    try {
      const [projectRes, panelsRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get('/api/product-panels?includeMaterials=1')
      ]);
      setProjectInfo(projectRes.data);
      setPanels(projectRes.data.details || []);
      setAdditionalCosts({ ...DEFAULT_ADDITIONAL_COSTS, ...(projectRes.data.additionalCosts || {}) });
      setMasterPanels(panelsRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch((e) => alert(e.message));
  }, [projectId]);

  const calculateRow = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const factor = parseFloat(item.factor) || 1;
    const diskon = parseFloat(item.diskon) || 0;
    const manHour = parseFloat(item.manHour) || 0;
    const intPrice = parseFloat(item.internationalPrice) || 0;
    const locPrice = parseFloat(item.localPrice) || 0;
    const priceAfterDiscUSD = intPrice > 0 ? intPrice * factor * ((100 - diskon) / 100) : 0;
    const priceBecomeIDR = priceAfterDiscUSD > 0 ? priceAfterDiscUSD * KURS_USD : 0;
    const priceAfterDiscIDR = locPrice > 0 ? locPrice * factor * ((100 - diskon) / 100) : 0;
    const basePriceIDR = priceBecomeIDR > 0 ? priceBecomeIDR : priceAfterDiscIDR;
    const priceAfterManHour = basePriceIDR + manHour;
    const totalPrice = priceAfterManHour * qty;
    return { priceAfterDiscUSD, priceBecomeIDR, priceAfterDiscIDR, priceAfterManHour, totalPrice };
  };

  const calculatePanelTotal = (panel) => {
    if (!panel.materials || panel.materials.length === 0) return panel.hargaAkhir || panel.jumlah * panel.hargaSatuan || 0;
    return panel.materials.reduce((sum, mat) => sum + calculateRow(mat).totalPrice, 0) * (panel.jumlah || 1);
  };

  const subtotalPanels = useMemo(() => panels.reduce((sum, panel) => sum + calculatePanelTotal(panel), 0), [panels]);
  const totalAdditionalCosts = useMemo(
    () => Object.values(additionalCosts).reduce((sum, cost) => sum + (parseFloat(cost) || 0), 0),
    [additionalCosts]
  );
  const grandTotal = subtotalPanels + totalAdditionalCosts;

  const openModal = () => {
    setForm({ masterPanelId: '', jenis: '', jumlah: 1, hargaSatuan: 0, isCustom: false });
    setIsModalOpen(true);
  };

  const handleSelectMasterPanel = (id) => {
    const mp = masterPanels.find((p) => p.id === id);
    if (!mp) {
      setForm((prev) => ({ ...prev, masterPanelId: '', isCustom: true }));
      return;
    }
    setForm({
      masterPanelId: mp.id,
      jenis: mp.name,
      jumlah: 1,
      hargaSatuan: mp.price || 0,
      isCustom: false
    });
  };

  const handleAddPanel = (e) => {
    e.preventDefault();
    (async () => {
      if (!form.jenis) return alert('Nama panel tidak boleh kosong!');
      const payload = {
        masterPanelId: form.masterPanelId || null,
        jenis: form.jenis,
        jumlah: parseInt(form.jumlah, 10) || 1,
        hargaSatuan: parseFloat(form.hargaSatuan) || 0,
        hargaAkhir: (parseInt(form.jumlah, 10) || 1) * (parseFloat(form.hargaSatuan) || 0),
        isCustom: !!form.isCustom
      };
      const created = await api.post(`/api/projects/${projectId}/panels`, payload);

      const mp = form.masterPanelId ? masterPanels.find((p) => p.id === form.masterPanelId) : null;
      if (mp?.defaultMaterials?.length) {
        for (let i = 0; i < mp.defaultMaterials.length; i++) {
          await api.post(`/api/project-panels/${created.data.id}/materials`, { ...mp.defaultMaterials[i], sortOrder: i });
        }
      }

      setIsModalOpen(false);
      await load();
    })().catch((err) => alert(err.message));
  };

  const handleDeletePanel = (id) => {
    if (!confirm('Hapus panel?')) return;
    api
      .delete(`/api/project-panels/${id}`)
      .then(() => setPanels((prev) => prev.filter((p) => p.id !== id)))
      .catch((e) => alert(e.message));
  };

  const saveAdditionalCosts = () => {
    (async () => {
      setSavingCosts(true);
      try {
        await api.patch(`/api/projects/${projectId}`, { additionalCosts });
        alert('Biaya tambahan tersimpan');
      } finally {
        setSavingCosts(false);
      }
    })().catch((e) => alert(e.message));
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!projectInfo) return <div className="h-screen flex items-center justify-center">Project tidak ditemukan</div>;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Project Detail" />

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <button onClick={() => navigate('/projects')} className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-2">
                <ChevronLeft size={18} /> Back
              </button>
              <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white truncate">
                {projectInfo.jobNo} • {projectInfo.namaProject}
              </h1>
              <p className="text-xs text-slate-500">{projectInfo.customer || '-'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ProjectExcel projectInfo={projectInfo} panels={panels} />
              <ProjectWord projectInfo={projectInfo} panels={panels} />
              <button onClick={openModal} className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <Plus size={16} /> Panel
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-black text-slate-800 dark:text-white">Panels</h2>
              <div className="text-sm font-bold text-blue-600">{formatRupiah(subtotalPanels)}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500 bg-slate-50 dark:bg-slate-800 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Panel</th>
                    <th className="px-4 py-3 text-center font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">Unit Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {panels.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.jenis}</td>
                      <td className="px-4 py-3 text-center font-bold">{p.jumlah}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatRupiah(p.hargaSatuan || 0)}</td>
                      <td className="px-4 py-3 text-right font-black text-blue-600">{formatRupiah(calculatePanelTotal(p))}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/projects/${projectId}/panels/${p.id}/edit`)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <FileEdit size={16} />
                          </button>
                          <button onClick={() => handleDeletePanel(p.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {panels.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-slate-400">
                        Belum ada panel
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-500 mb-2">Biaya Tambahan</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'packing', label: 'Packing' },
                    { key: 'shipping', label: 'Shipping' },
                    { key: 'installation', label: 'Installation' },
                    { key: 'testing', label: 'Testing' },
                    { key: 'documentation', label: 'Documentation' },
                    { key: 'other', label: 'Lainnya' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-[10px] text-slate-500 mb-0.5">{label}</label>
                      <input
                        type="number"
                        value={additionalCosts[key]}
                        onChange={(e) => setAdditionalCosts((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                        className="border rounded px-2 py-1.5 text-right text-xs focus:ring-1 focus:ring-blue-500 outline-none w-full dark:bg-slate-950 dark:border-slate-700"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={saveAdditionalCosts}
                    disabled={savingCosts}
                    className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                  >
                    <Save size={16} /> {savingCosts ? 'Saving...' : 'Save Costs'}
                  </button>
                </div>
              </div>

              <div className="lg:w-72 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-600">Subtotal Panel</span>
                  <span className="font-medium">{formatRupiah(subtotalPanels)}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-slate-600">Biaya Tambahan</span>
                  <span className="font-medium">{formatRupiah(totalAdditionalCosts)}</span>
                </div>
                <div className="flex justify-between py-2 mt-1 border-t border-blue-200 dark:border-blue-700">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">GRAND TOTAL</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Tambah Panel</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPanel} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Master Panel (optional)</label>
                <select
                  value={form.masterPanelId}
                  onChange={(e) => handleSelectMasterPanel(e.target.value)}
                  className="w-full border dark:border-slate-700 dark:bg-slate-950 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">-- Custom --</option>
                  {masterPanels.map((mp) => (
                    <option key={mp.id} value={mp.id}>
                      {mp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Panel</label>
                <input
                  type="text"
                  value={form.jenis}
                  onChange={(e) => setForm((prev) => ({ ...prev, jenis: e.target.value, isCustom: !prev.masterPanelId }))}
                  className="w-full border dark:border-slate-700 dark:bg-slate-950 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    value={form.jumlah}
                    onChange={(e) => setForm((prev) => ({ ...prev, jumlah: e.target.value }))}
                    className="w-full border dark:border-slate-700 dark:bg-slate-950 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Harga Satuan</label>
                  <input
                    type="number"
                    min="0"
                    value={form.hargaSatuan}
                    onChange={(e) => setForm((prev) => ({ ...prev, hargaSatuan: e.target.value }))}
                    className="w-full border dark:border-slate-700 dark:bg-slate-950 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold">
                  Batal
                </button>
                <button type="submit" disabled={!form.jenis} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md disabled:opacity-50">
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

