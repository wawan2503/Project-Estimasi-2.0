import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, Save, Search, Filter
} from 'lucide-react';
// Import Data Master yang baru
import { projectsData, masterComponents, formatRupiah } from '../../data/mockData';

const ProjectEditPanel = () => {
  const { panelId } = useParams();
  const navigate = useNavigate();

  // 1. Ambil Data Panel yang sedang diedit
  const project = projectsData[0];
  const panelData = project.details.find(p => p.id.toString() === panelId);

  // 2. State untuk menampung item/material di tabel
  const [items, setItems] = useState(panelData ? panelData.materials : []);

  // --- LOGIKA FILTER BERTINGKAT (CASCADING) ---

  // Ambil daftar Item unik untuk dropdown pertama (MCB, MCCB, Kabel, dll)
  const getItemOptions = () => [...new Set(masterComponents.map(c => c.item))];

  // Fungsi Cerdas: Mengambil opsi dropdown berdasarkan pilihan di sebelah kirinya
  const getDropdownOptions = (row, fieldTarget) => {
    // Mulai dari seluruh data master
    let filtered = masterComponents;

    // Tahap 1: Filter berdasarkan ITEM yang dipilih
    if (!row.name) return [];
    filtered = filtered.filter(c => c.item === row.name);

    // Jika targetnya BRAND, kembalikan daftar brand yang tersedia untuk item tsb
    if (fieldTarget === 'brand') {
       return [...new Set(filtered.map(c => c.brand))];
    }

    // Tahap 2: Filter berdasarkan BRAND yang dipilih
    if (!row.brand) return [];
    filtered = filtered.filter(c => c.brand === row.brand);

    if (fieldTarget === 'series') {
       return [...new Set(filtered.map(c => c.series))];
    }

    // Tahap 3: Filter berdasarkan SERIES
    if (!row.series) return [];
    filtered = filtered.filter(c => c.series === row.series);

    if (fieldTarget === 'pole') {
       return [...new Set(filtered.map(c => c.pole))];
    }

    // Tahap 4: Filter berdasarkan POLE
    if (!row.pole) return [];
    filtered = filtered.filter(c => c.pole === row.pole);

    if (fieldTarget === 'ka') {
       return [...new Set(filtered.map(c => c.ka))];
    }

    // Tahap 5: Filter berdasarkan KA
    if (!row.ka) return [];
    filtered = filtered.filter(c => c.ka === row.ka);

    if (fieldTarget === 'ampere') {
       return [...new Set(filtered.map(c => c.ampere))];
    }

    return [];
  };

  // --- LOGIKA PERUBAHAN DATA (HANDLE CHANGE) ---
  const handleChange = (id, field, value) => {
    setItems(prevItems => prevItems.map(row => {
      if (row.id !== id) return row; // Bukan baris yang diedit, abaikan

      // Salin data lama & update field yang berubah
      let updatedRow = { ...row, [field]: value };

      // --- RESET LOGIC: Jika kolom kiri berubah, kolom kanannya harus di-reset ---
      if (field === 'name') {
        updatedRow = { ...updatedRow, brand: '', series: '', pole: '', ka: '', ampere: '', detail: '', price: 0, unit: '-', vendor: '-' };
      } else if (field === 'brand') {
        updatedRow = { ...updatedRow, series: '', pole: '', ka: '', ampere: '', detail: '', price: 0 };
      } else if (field === 'series') {
        updatedRow = { ...updatedRow, pole: '', ka: '', ampere: '', detail: '', price: 0 };
      } else if (field === 'pole') {
        updatedRow = { ...updatedRow, ka: '', ampere: '', detail: '', price: 0 };
      } else if (field === 'ka') {
        updatedRow = { ...updatedRow, ampere: '', detail: '', price: 0 };
      }

      // --- AUTO MATCH: Jika semua filter terisi, cari data di Master ---
      if (updatedRow.name && updatedRow.brand && updatedRow.series && updatedRow.pole && updatedRow.ka && updatedRow.ampere) {
        // Cari item yang cocok persis di database
        const match = masterComponents.find(c => 
          c.item === updatedRow.name &&
          c.brand === updatedRow.brand &&
          c.series === updatedRow.series &&
          c.pole === updatedRow.pole &&
          c.ka === updatedRow.ka &&
          c.ampere === updatedRow.ampere
        );

        // Jika ketemu, isi Detail Spec & Harga otomatis
        if (match) {
          updatedRow.detail = match.detail; 
          updatedRow.price = match.price;   
          updatedRow.unit = match.unit;
          updatedRow.vendor = match.vendor;
        } else {
          updatedRow.detail = "Item tidak ditemukan di Master";
          updatedRow.price = 0;
        }
      }

      return updatedRow;
    }));
  };

  // Tambah baris kosong baru
  const handleAddNewRow = () => {
    const newId = `new-${Date.now()}`;
    setItems([...items, {
      id: newId, name: '', brand: '', series: '', pole: '', ka: '', ampere: '', 
      detail: '', qty: 1, unit: '-', factor: 1, diskon: '0%', 
      price: 0, vendor: '-', status: 'NEW'
    }]);
  };

  // Hapus baris
  const handleDeleteRow = (id) => {
    if(confirm("Hapus baris item ini?")) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // Simpan data (Simulasi)
  const handleSave = () => {
    console.log("Data Panel Terbaru:", items);
    alert("Perubahan berhasil disimpan! (Cek Console)");
    navigate(-1);
  };

  if (!panelData) return <div className="p-10 text-center">Panel tidak ditemukan.</div>;

  return (
    <div className="flex-1 h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <div className="px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Edit Panel: <span className="text-blue-600 dark:text-blue-400">{panelData.jenis}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Cascading Filter Active</p>
          </div>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition">
           <Save size={18} /> Simpan Perubahan
        </button>
      </div>

      {/* --- CONTENT UTAMA --- */}
      <div className="flex-1 overflow-auto p-8 pb-32">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Container Table dengan min-height agar dropdown tidak terpotong */}
          <div className="overflow-x-auto min-h-[450px]"> 
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  {/* HEADER KOLOM FILTER (KIRI) */}
                  <th className="p-3 text-left font-bold min-w-[130px]">1. Item</th>
                  <th className="p-3 text-left font-bold min-w-[130px]">2. Brand</th>
                  <th className="p-3 text-left font-bold min-w-[100px]">3. Series</th>
                  <th className="p-3 text-left font-bold min-w-[80px]">4. Pole</th>
                  <th className="p-3 text-left font-bold min-w-[80px]">5. KA</th>
                  <th className="p-3 text-left font-bold min-w-[80px]">6. Ampere</th>
                  
                  {/* HEADER HASIL (TENGAH) */}
                  <th className="p-3 text-left font-bold min-w-[250px] bg-slate-900 border-l border-slate-600">
                    Detail Spec (Result)
                  </th>
                  
                  {/* HEADER INPUT (KANAN) */}
                  <th className="p-3 text-center font-bold w-16">Qty</th>
                  <th className="p-3 text-center font-bold w-16">Unit</th>
                  <th className="p-3 text-right font-bold min-w-[120px]">Price</th>
                  <th className="p-3 text-right font-bold min-w-[120px]">Total</th>
                  <th className="p-3 text-center font-bold w-12">Act</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      
                      {/* 1. ITEM (DROPDOWN UTAMA) */}
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                        <select 
                          className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                          value={item.name}
                          onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                        >
                          <option value="">- Pilih -</option>
                          {getItemOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      {/* 2. BRAND (Tergantung Item) */}
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                        <select 
                          className="w-full bg-transparent outline-none text-slate-700 dark:text-slate-300 disabled:opacity-30 cursor-pointer"
                          value={item.brand}
                          onChange={(e) => handleChange(item.id, 'brand', e.target.value)}
                          disabled={!item.name}
                        >
                          <option value="">-</option>
                          {getDropdownOptions(item, 'brand').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      {/* 3. SERIES (Tergantung Brand) */}
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                        <select 
                          className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer"
                          value={item.series}
                          onChange={(e) => handleChange(item.id, 'series', e.target.value)}
                          disabled={!item.brand}
                        >
                          <option value="">-</option>
                          {getDropdownOptions(item, 'series').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      {/* 4. POLE */}
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                        <select className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer text-xs" value={item.pole} onChange={(e) => handleChange(item.id, 'pole', e.target.value)} disabled={!item.series}>
                          <option value="">-</option>
                          {getDropdownOptions(item, 'pole').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      {/* 5. KA */}
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                        <select className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer text-xs" value={item.ka} onChange={(e) => handleChange(item.id, 'ka', e.target.value)} disabled={!item.pole}>
                          <option value="">-</option>
                          {getDropdownOptions(item, 'ka').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      {/* 6. AMPERE (Final Filter) */}
                      <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                        <select className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400 disabled:opacity-30 cursor-pointer text-xs" value={item.ampere} onChange={(e) => handleChange(item.id, 'ampere', e.target.value)} disabled={!item.ka}>
                          <option value="">-</option>
                          {getDropdownOptions(item, 'ampere').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>

                      {/* HASIL: DETAIL SPEC (Read Only) */}
                      <td className="p-3 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                         {item.detail ? (
                           <span className="text-slate-800 dark:text-white font-medium text-sm block truncate">{item.detail}</span>
                         ) : (
                           <span className="text-slate-400 italic text-xs">Lengkapi filter di kiri...</span>
                         )}
                      </td>

                      {/* INPUT QTY */}
                      <td className="p-2">
                        <input 
                          type="number" min="1" 
                          className="w-full text-center bg-transparent border border-slate-200 dark:border-slate-700 rounded py-1 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-white" 
                          value={item.qty} onChange={(e) => handleChange(item.id, 'qty', e.target.value)}
                        />
                      </td>
                      
                      {/* UNIT (Auto) */}
                      <td className="p-2 text-center text-slate-500 text-xs">{item.unit}</td>
                      
                      {/* PRICE (Auto) */}
                      <td className="p-2 text-right text-slate-600 dark:text-slate-400 font-mono text-xs">{formatRupiah(item.price)}</td>
                      
                      {/* TOTAL (Auto Calc) */}
                      <td className="p-2 text-right font-bold text-blue-600 dark:text-blue-400 font-mono text-xs">
                        {formatRupiah(item.price * item.qty)}
                      </td>
                      
                      {/* DELETE */}
                      <td className="p-2 text-center">
                        <button onClick={() => handleDeleteRow(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-slate-400 italic">
                      Panel ini belum memiliki komponen. Klik tombol tambah di bawah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* FOOTER: TOMBOL TAMBAH */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
             <button onClick={handleAddNewRow} className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
               <Plus size={14} /> Tambah Baris Kosong Manual
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditPanel;