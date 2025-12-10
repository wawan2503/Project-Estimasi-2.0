import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, FileEdit, ChevronLeft, ChevronDown,
  Plus, ArrowRight, X, Download, Save, Eye, Trash2, CheckCircle, Check
} from 'lucide-react';
// Import Data Dummy
import { projectsData, masterPanels, formatRupiah } from '../../data/mockData';

const ProjectDetail = () => {
  const navigate = useNavigate();
  
  // Ambil Data Project (Header)
  const projectInfo = projectsData[0]; 

  // --- STATE MANAGEMENT ---
  const [panels, setPanels] = useState(projectInfo.details); // Data Panel di Tabel
  const [rowLevels, setRowLevels] = useState({}); // Status Buka/Tutup Detail (0=Tutup, 1-4=Level)
  const [isModalOpen, setIsModalOpen] = useState(false); // Status Modal Tambah Panel

  // State untuk Dropdown Pencarian di Modal
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State Form Tambah Panel
  const [newPanelForm, setNewPanelForm] = useState({
    idMaster: '', 
    jenis: '',
    jumlah: 1,
    hargaSatuan: 0,
    defaultMaterials: []
  });

  // Filter Master Panel berdasarkan ketikan user
  const filteredMasterPanels = masterPanels.filter(panel => 
    panel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Efek untuk menutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC: EXPAND / COLLAPSE DETAIL ---
  const changeLevel = (id, action) => {
    setRowLevels((prev) => {
      const current = prev[id] || 0;
      // NEXT: Tambah level (0 -> 1 -> 2 -> 3 -> 4)
      if (action === 'NEXT') return { ...prev, [id]: current >= 4 ? 4 : current + 1 };
      // CLOSE: Reset ke 0
      if (action === 'CLOSE') return { ...prev, [id]: 0 };
      return prev;
    });
  };

  // --- LOGIC: PILIH PANEL DARI DROPDOWN ---
  const handleSelectPanel = (panel) => {
    setNewPanelForm({
      ...newPanelForm,
      idMaster: panel.id,
      jenis: panel.name,
      hargaSatuan: panel.price,
      defaultMaterials: panel.defaultMaterials || []
    });
    setSearchTerm(panel.name); // Isi input dengan nama yg dipilih
    setIsDropdownOpen(false); // Tutup dropdown
  };

  // --- LOGIC: BUKA MODAL ---
  const openModal = () => {
    setNewPanelForm({ idMaster: '', jenis: '', jumlah: 1, hargaSatuan: 0, defaultMaterials: [] });
    setSearchTerm("");
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  // --- LOGIC: SIMPAN PANEL BARU ---
  const handleAddPanel = (e) => {
    e.preventDefault();
    if (!newPanelForm.jenis) return alert("Silakan pilih jenis panel dari daftar!");

    const newPanelData = {
      id: Date.now(), // ID Unik
      jenis: newPanelForm.jenis,
      jumlah: parseInt(newPanelForm.jumlah),
      hargaSatuan: parseInt(newPanelForm.hargaSatuan),
      hargaAkhir: parseInt(newPanelForm.jumlah) * parseInt(newPanelForm.hargaSatuan),
      // Masukkan material bawaan (jika ada)
      materials: newPanelForm.defaultMaterials.map((mat, index) => ({
        ...mat,
        id: `new-mat-${Date.now()}-${index}`
      }))
    };

    setPanels([...panels, newPanelData]); 
    setIsModalOpen(false); 
  };

  // --- LOGIC: HAPUS PANEL ---
  const handleDeletePanel = (id) => {
    if (confirm("Yakin ingin menghapus panel ini beserta seluruh isinya?")) {
      setPanels(panels.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden font-sans transition-colors duration-300
      bg-slate-50/50 dark:bg-slate-950">
      
      {/* === HEADER BAR === */}
      <div className="px-8 py-4 flex justify-between items-center shadow-sm z-30 sticky top-0 transition-colors
        bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/')} className="flex items-center gap-2 font-medium transition-colors
             text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400">
             <div className="p-1.5 rounded-md border transition-colors border-slate-200 hover:bg-blue-50 hover:border-blue-200
               dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-blue-500">
               <ChevronLeft size={18} />
             </div>
             <span className="text-sm">Back</span>
           </button>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
           <div>
             <h1 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
               {projectInfo.namaProject} 
               <span className="px-2.5 py-0.5 text-sm rounded-md font-mono border bg-blue-50 text-blue-700 border-blue-100
                 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">{projectInfo.jobNo}</span>
             </h1>
           </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm border
            text-slate-600 bg-white border-slate-300 hover:bg-slate-50
            dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
             <Download size={16} strokeWidth={2.5}/> Export
          </button>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md shadow-blue-700/20 transition flex items-center gap-2 active:scale-95">
             <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      {/* === CONTENT AREA === */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Panel Breakdown</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">List of all panels and components.</p>
              </div>
              <button 
                onClick={openModal} 
                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all
                bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95"
              >
                <Plus size={18} strokeWidth={3} /> Tambah Panel
              </button>
           </div>
           
           <div className="relative">
             <input type="text" placeholder="Search panel..." className="pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none w-[320px] shadow-sm transition-all
               bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500
               dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50"/>
             <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={18}/>
           </div>
        </div>

        {/* === TABEL UTAMA PANEL === */}
        <div className="rounded-xl shadow-sm overflow-hidden mb-20 transition-colors
          bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          
          <table className="w-full min-w-[1000px]">
            <thead className="border-b transition-colors bg-blue-50/50 border-blue-100 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                {['Panel Type', 'Qty', 'Unit Price', 'Total Price', 'Actions'].map((h, i) => (
                   <th key={i} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${i===4?'text-center':'text-left'}
                     text-blue-800 dark:text-blue-400`}>
                     {h}
                   </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {panels.map((item) => {
                const level = rowLevels[item.id] || 0; 
                const isOpen = level > 0;

                return (
                  <React.Fragment key={item.id}>
                    {/* BARIS DATA PANEL */}
                    <tr className={`transition-all duration-200 border-l-4 
                      ${isOpen 
                        ? 'bg-blue-50/30 border-l-blue-600 dark:bg-blue-900/10 dark:border-l-blue-500' 
                        : 'hover:bg-slate-50 border-l-transparent dark:hover:bg-slate-800/50'}`}>
                      
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`text-base font-bold transition-colors ${isOpen ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {item.jenis}
                          </span>
                          
                          {/* TOMBOL KONTROL LEVEL (VIEW DETAILS) */}
                          <div className="flex items-center gap-2 mt-1">
                            <button 
                              onClick={() => changeLevel(item.id, 'NEXT')} 
                              disabled={level >= 4}
                              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-sm
                                ${level >= 4 
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700' 
                                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-600 dark:hover:bg-slate-700'
                                }
                              `}
                            >
                              {level === 0 ? <Eye size={14}/> : <ArrowRight size={14}/>}
                              {level === 0 ? "View Details" : `Show Level ${level + 1}`}
                            </button>

                            {isOpen && (
                              <button 
                                onClick={() => changeLevel(item.id, 'CLOSE')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm border
                                  bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400
                                  dark:bg-slate-800 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20"
                              >
                                <X size={14} /> Close
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className="font-bold text-base text-slate-700 dark:text-slate-300">{item.jumlah}</span></td>
                      <td className="px-6 py-5 font-medium text-sm text-slate-600 dark:text-slate-400">{formatRupiah(item.hargaSatuan)}</td>
                      <td className="px-6 py-5 font-bold text-base text-slate-800 dark:text-slate-200">{formatRupiah(item.hargaAkhir)}</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-2">
                           
                           {/* --- TOMBOL EDIT (Pindah ke Halaman Edit Panel) --- */}
                           <button 
                             onClick={() => navigate(`/project-detail/edit/${item.id}`)}
                             className="p-2 rounded-lg transition-colors text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
                             title="Edit Detail Panel"
                           >
                             <FileEdit size={18} strokeWidth={2}/>
                           </button>

                           {/* TOMBOL DELETE */}
                           <button 
                             onClick={() => handleDeletePanel(item.id)} 
                             className="p-2 rounded-lg transition-colors text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                             title="Hapus Panel"
                           >
                             <Trash2 size={18} strokeWidth={2}/>
                           </button>
                        </div>
                      </td>
                    </tr>

                    {/* === NESTED TABLE (MATERIAL DETAILS) === */}
                    {isOpen && (
                      <tr>
                        <td colSpan="6" className="p-0 border-t border-blue-100 dark:border-slate-700">
                          <div className="p-6 shadow-inner transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                             <div className="rounded-lg shadow-sm overflow-hidden border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                               <div className="overflow-x-auto">
                                 <table className="w-full text-sm">
                                   <thead>
                                     <tr className="bg-slate-800 text-slate-200 dark:bg-black dark:text-slate-400">
                                       {/* LEVEL 1 HEADER */}
                                       <th className="p-3 font-semibold text-left min-w-[200px] pl-6 border-r border-slate-700">Material Name</th>
                                       <th className="p-3 font-semibold text-left border-r border-slate-700">Brand</th>
                                       <th className="p-3 font-semibold text-center border-r border-slate-700">Qty</th>
                                       <th className="p-3 font-semibold text-center border-r border-slate-700">Unit</th>

                                       {/* LEVEL 2 HEADER */}
                                       {level >= 2 && (
                                         <>
                                          <th className="p-3 font-semibold text-center border-t-2 border-t-blue-400 bg-slate-700 dark:bg-slate-800">Factor</th>
                                          <th className="p-3 font-semibold text-center border-t-2 border-t-blue-400 bg-slate-700 dark:bg-slate-800">Disc %</th>
                                          <th className="p-3 font-semibold text-right border-t-2 border-t-blue-400 bg-slate-700 dark:bg-slate-800">Unit Price</th>
                                          <th className="p-3 font-semibold text-right border-t-2 border-t-blue-400 bg-slate-700 dark:bg-slate-800 border-r border-slate-600">Total</th>
                                         </>
                                       )}

                                       {/* LEVEL 3 HEADER */}
                                       {level >= 3 && (
                                         <>
                                          <th className="p-3 font-semibold border-t-2 border-t-purple-400 bg-slate-700/80 dark:bg-slate-800/80">Vendor</th>
                                          <th className="p-3 font-semibold text-center border-t-2 border-t-purple-400 bg-slate-700/80 dark:bg-slate-800/80 border-r border-slate-600">PO No</th>
                                         </>
                                       )}

                                       {/* LEVEL 4 HEADER */}
                                       {level >= 4 && (
                                         <th className="p-3 font-semibold border-t-2 border-t-orange-400 bg-slate-700/60 dark:bg-slate-800/60">Status</th>
                                       )}
                                     </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                     {item.materials && item.materials.length > 0 ? (
                                        item.materials.map((mat) => (
                                          <tr key={mat.id} className="transition-colors hover:bg-slate-50 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300">
                                            {/* DATA LEVEL 1 */}
                                            <td className="p-3 pl-6 font-medium border-r border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-200">{mat.name}</td>
                                            <td className="p-3 border-r border-slate-100 dark:border-slate-800"><span className="text-xs px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">{mat.brand}</span></td>
                                            <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800">{mat.qty}</td>
                                            <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-500">{mat.unit}</td>

                                            {/* DATA LEVEL 2 */}
                                            {level >= 2 && (
                                              <>
                                                <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-900/10">{mat.factor}</td>
                                                <td className="p-3 text-center font-bold text-slate-500 border-r border-slate-100 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-900/10">{mat.diskon}</td>
                                                <td className="p-3 text-right border-r border-slate-100 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-900/10">{formatRupiah(mat.price)}</td>
                                                <td className="p-3 text-right font-bold text-blue-700 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-900/10">{formatRupiah(mat.price * mat.qty)}</td>
                                              </>
                                            )}

                                            {/* DATA LEVEL 3 */}
                                            {level >= 3 && (
                                              <>
                                                <td className="p-3 border-r border-slate-100 dark:border-slate-800 bg-purple-50/20 dark:bg-purple-900/10">Graha El</td>
                                                <td className="p-3 text-center border-r border-slate-100 dark:border-slate-800 bg-purple-50/20 dark:bg-purple-900/10"><span className="text-xs font-mono text-purple-700 dark:text-purple-400">PO-212</span></td>
                                              </>
                                            )}

                                            {/* DATA LEVEL 4 */}
                                            {level >= 4 && (
                                              <td className="p-3 bg-orange-50/20 dark:bg-orange-900/10">
                                                <span className="text-[10px] font-bold uppercase text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 px-2 py-0.5 rounded-full">Ready</span>
                                              </td>
                                            )}
                                          </tr>
                                        ))
                                     ) : (
                                        <tr><td colSpan={12} className="p-4 text-center text-slate-400 text-sm italic">Tidak ada material bawaan. Klik tombol Edit untuk menambah material.</td></tr>
                                     )}
                                   </tbody>
                                 </table>
                               </div>
                               
                               <div className="p-2 border-t text-center transition-colors bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                  {level < 4 ? (
                                    <button onClick={() => changeLevel(item.id, 'NEXT')} className="text-xs font-bold hover:underline text-blue-600 dark:text-blue-400">
                                      Show More Columns (Level {level + 1})
                                    </button>
                                  ) : (
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">All columns visible</span>
                                  )}
                               </div>
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

      {/* === MODAL TAMBAH PANEL (SEARCHABLE) === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-visible">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <CheckCircle size={20} className="text-blue-600"/> Pilih Panel (Master)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddPanel} className="p-6 space-y-5">
              
              {/* DROPDOWN PENCARIAN */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cari Jenis Panel</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ketik nama panel..." 
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <Search className="absolute left-3 top-3 text-slate-400" size={16}/>
                  <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>

                {/* HASIL PENCARIAN */}
                {isDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {filteredMasterPanels.length > 0 ? (
                      filteredMasterPanels.map((mp) => (
                        <div 
                          key={mp.id} 
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center group"
                          onClick={() => handleSelectPanel(mp)}
                        >
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                            {mp.name}
                          </span>
                          {newPanelForm.idMaster === mp.id && <Check size={16} className="text-blue-600"/>}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-400 italic text-center">
                        Panel tidak ditemukan.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jumlah</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPanelForm.jumlah} 
                    onChange={(e) => setNewPanelForm({...newPanelForm, jumlah: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Harga Satuan</label>
                  <input 
                    type="text" 
                    disabled 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed font-medium"
                    value={formatRupiah(newPanelForm.hargaSatuan)}
                  />
                </div>
              </div>

              <div className="pt-2">
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Total Estimasi:</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">
                      {formatRupiah(newPanelForm.jumlah * newPanelForm.hargaSatuan)}
                    </span>
                 </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">Batal</button>
                <button type="submit" disabled={!newPanelForm.idMaster} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed">Tambahkan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;