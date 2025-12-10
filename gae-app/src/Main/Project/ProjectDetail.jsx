import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style'; 
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

import { 
  FileEdit, ChevronLeft, Plus, ArrowRight, X, Download, Save, Eye, Trash2, Search, Filter, FileText, PlusCircle
} from 'lucide-react';

import { projectsData, masterPanels, formatRupiah, formatUSD } from '../../data/mockData';

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

const ProjectDetail = () => {
  const navigate = useNavigate();
  const projectInfo = projectsData[0]; 

  const [panels, setPanels] = useState(projectInfo.details); 
  const [rowLevels, setRowLevels] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // State Modal & Form
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [newPanelForm, setNewPanelForm] = useState({
    idMaster: '', 
    jenis: '',    
    jumlah: 1, 
    hargaSatuan: 0, 
    defaultMaterials: [],
    isCustom: false
  });

  const [colFilters, setColFilters] = useState({
    description: '', brand: '', qty: '', unit: ''
  });

  const handleColFilterChange = (field, value) => {
    setColFilters(prev => ({ ...prev, [field]: value }));
  };

  // Logic Filter Master Panel (Search)
  const filteredMasterPanels = masterPanels.filter(panel => 
    panel.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getMaterialPrice = (mat) => mat.currency === 'USD' ? mat.internationalPrice : mat.localPrice;
  const calculateTotalMaterial = (mat) => {
    const unitPrice = getMaterialPrice(mat);
    const grossTotal = unitPrice * mat.qty * mat.factor;
    const discountAmount = grossTotal * (mat.diskon / 100);
    return grossTotal - discountAmount;
  };
  const renderPrice = (price, currency) => currency === 'USD' ? formatUSD(price) : formatRupiah(price);

  const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return text;
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return <span>{parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? <span key={i} className="bg-yellow-300 text-black font-bold px-0.5 rounded">{part}</span> : part)}</span>;
  };

  // --- LOGIC: EXPORT EXCEL (FULL DENGAN WARNA) ---
  const handleExportExcel = () => {
    const sheetData = [];
    // 1. Info Project
    sheetData.push(["PROJECT SUMMARY"]);
    sheetData.push(["Job No", projectInfo.jobNo]);
    sheetData.push(["Project Name", projectInfo.namaProject]);
    sheetData.push(["Customer", projectInfo.customer]);
    sheetData.push([]); 

    // 2. Header Tabel
    sheetData.push([
      "Description", "Type", "Brand", "Spec Detail", "Qty (Mat)", "Unit", 
      "Price (IDR)", "Price (USD)", "Factor", "Disc (%)",
      "Hargakomponen stl Faktor", "", "Man Hour", "Harga Komponen", "" 
    ]);
    sheetData.push([
      "", "", "", "", "", "", "", "", "", "", "USD", "IDR", "IDR", "Satuan (IDR)", "Total (IDR)" 
    ]);

    // 3. Isi Data
    panels.forEach(panel => {
      sheetData.push([panel.jenis.toUpperCase(), "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      if(panel.materials) {
        panel.materials.forEach(mat => {
          const isUSD = mat.currency === 'USD';
          const basePrice = isUSD ? mat.internationalPrice : mat.localPrice;
          const priceAfterFactor = basePrice * mat.factor;
          const priceAfterDiscUnit = priceAfterFactor * (1 - (mat.diskon / 100)); 
          const priceTotalFinal = priceAfterDiscUnit * mat.qty; 

          sheetData.push([
            mat.item, mat.series || "-", mat.brand, mat.detail, mat.qty, mat.unit,                 
            !isUSD ? basePrice : 0, isUSD ? basePrice : 0, mat.factor, mat.diskon,               
            isUSD ? priceAfterFactor : 0, !isUSD ? priceAfterFactor : 0, 
            mat.manHour || 0, priceAfterDiscUnit, priceTotalFinal           
          ]);
        });
      }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    
    // 4. Styling
    const borderStyle = { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } };
    const headerStyle = { font: { bold: true, color: { rgb: "000000" } }, fill: { fgColor: { rgb: "D9D9D9" } }, alignment: { horizontal: "center", vertical: "center" }, border: borderStyle };
    const panelTitleStyle = { font: { bold: true }, fill: { fgColor: { rgb: "EBF1DE" } }, border: borderStyle };
    const cellStyle = { border: borderStyle, alignment: { vertical: "center" } };

    // Apply Styles Loop
    Object.keys(ws).forEach(cellKey => {
      if (cellKey.indexOf('!') === 0) return;
      const r = XLSX.utils.decode_cell(cellKey).r;
      const c = XLSX.utils.decode_cell(cellKey).c;

      if (r >= 5) {
        if(r === 5 || r === 6) {
           ws[cellKey].s = headerStyle;
        } else {
           // Cek apakah ini judul panel (Kolom A ada isi, B kosong)
           const isTitle = ws[XLSX.utils.encode_cell({r:r, c:0})]?.v && !ws[XLSX.utils.encode_cell({r:r, c:1})]?.v;
           if (isTitle) {
             ws[cellKey].s = panelTitleStyle;
           } else {
             ws[cellKey].s = cellStyle;
           }
        }
      }
    });
    
    // 5. Merge & Width
    ws['!merges'] = [{ s: { r: 5, c: 10 }, e: { r: 5, c: 11 } }, { s: { r: 5, c: 13 }, e: { r: 5, c: 14 } }];
    ws['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Detail Estimasi");
    XLSX.writeFile(wb, `${projectInfo.jobNo}_Detail_Estimasi.xlsx`);
  };

  // --- LOGIC: EXPORT WORD (FULL) ---
  const handleExportWord = () => {
    const tableRows = [];

    // Header
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Description", bold: true })], width: { size: 35, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: "Brand", bold: true })], width: { size: 15, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: "Qty", bold: true, alignment: AlignmentType.CENTER })], width: { size: 10, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: "Unit", bold: true, alignment: AlignmentType.CENTER })], width: { size: 10, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: "Price (Est)", bold: true, alignment: AlignmentType.RIGHT })], width: { size: 15, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: "Total", bold: true, alignment: AlignmentType.RIGHT })], width: { size: 15, type: WidthType.PERCENTAGE } }),
        ],
        tableHeader: true,
      })
    );

    // Data Loop
    panels.forEach(panel => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph({ text: panel.jenis.toUpperCase(), bold: true, color: "2E74B5" })],
              columnSpan: 6,
              shading: { fill: "F2F2F2" }
            })
          ]
        })
      );

      if(panel.materials) {
        panel.materials.forEach(mat => {
          const unitPrice = getMaterialPrice(mat);
          const total = calculateTotalMaterial(mat);
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(mat.detail || mat.item)] }),
                new TableCell({ children: [new Paragraph(mat.brand)] }),
                new TableCell({ children: [new Paragraph({ text: mat.qty.toString(), alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: mat.unit, alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: formatRupiah(unitPrice), alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: formatRupiah(total), alignment: AlignmentType.RIGHT })] }),
              ]
            })
          );
        });
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: `PROJECT SUMMARY: ${projectInfo.namaProject}`, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Job No: ${projectInfo.jobNo}` }),
          new Paragraph({ text: `Customer: ${projectInfo.customer}` }),
          new Paragraph({ text: "" }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
            }
          })
        ]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${projectInfo.jobNo}_Project_Detail.docx`);
    });
  };

  // --- UI ACTIONS ---
  const changeLevel = (id, action) => {
    setRowLevels((prev) => {
      const current = prev[id] || 0;
      if (action === 'NEXT') return { ...prev, [id]: current >= 4 ? 4 : current + 1 };
      if (action === 'CLOSE') return { ...prev, [id]: 0 };
      return prev;
    });
  };

  // Select Existing Panel
  const handleSelectPanel = (panel) => {
    setNewPanelForm({ 
      idMaster: panel.id, 
      jenis: panel.name, 
      jumlah: 1, 
      hargaSatuan: panel.price, 
      defaultMaterials: panel.defaultMaterials || [],
      isCustom: false
    });
    setModalSearchTerm(panel.name); 
    setIsDropdownOpen(false);
  };

  // Create Custom Panel (New)
  const handleCreateCustomPanel = () => {
    setNewPanelForm({
      idMaster: `custom-${Date.now()}`,
      jenis: modalSearchTerm,
      jumlah: 1,
      hargaSatuan: 0,
      defaultMaterials: [],
      isCustom: true
    });
    setIsDropdownOpen(false);
  };

  const openModal = () => { 
    setNewPanelForm({ idMaster: '', jenis: '', jumlah: 1, hargaSatuan: 0, defaultMaterials: [], isCustom: false }); 
    setModalSearchTerm(""); 
    setIsDropdownOpen(false); 
    setIsModalOpen(true); 
  };

  const handleAddPanel = (e) => { 
    e.preventDefault(); 
    if (!newPanelForm.jenis) return alert("Nama panel tidak boleh kosong!"); 
    
    setPanels([...panels, { 
      id: Date.now(), 
      jenis: newPanelForm.jenis, 
      jumlah: parseInt(newPanelForm.jumlah), 
      hargaSatuan: parseInt(newPanelForm.hargaSatuan), 
      hargaAkhir: parseInt(newPanelForm.jumlah) * parseInt(newPanelForm.hargaSatuan), 
      materials: newPanelForm.defaultMaterials.map((mat, i) => ({ ...mat, id: `new-mat-${Date.now()}-${i}` })) 
    }]); 
    setIsModalOpen(false); 
  };

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
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border text-green-700 bg-green-50 border-green-200 hover:bg-green-100"><Download size={16}/> Excel</button>
          <button onClick={handleExportWord} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"><FileText size={16}/> Word</button>
          <div className="w-px bg-slate-300 mx-2"></div>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md active:scale-95 transition flex gap-2 items-center"><Save size={18} /> Save Changes</button>
        </div>
      </div>

      {/* CONTENT */}
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

           {(colFilters.description || colFilters.brand || colFilters.qty || colFilters.unit) && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs animate-in fade-in">
               <Filter size={12} />
               <span>Filters Active</span>
               <button onClick={() => setColFilters({description:'', brand:'', qty:'', unit:''})} className="ml-2 p-1 hover:bg-yellow-200 rounded-full font-bold text-red-500"><X size={12}/></button>
             </div>
           )}
        </div>

        {/* TABLE */}
        <div className="rounded-xl shadow-sm overflow-hidden mb-20 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b bg-blue-50/50 border-blue-100 dark:bg-slate-800 dark:border-slate-700">
              <tr>{['Panel Type', 'Qty', 'Unit Price (Est)', 'Total Price', 'Actions'].map((h, i) => (<th key={i} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${i===4?'text-center':'text-left'} text-blue-800 dark:text-blue-400`}>{h}</th>))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {panels.map((item) => {
                const level = rowLevels[item.id] || 0; 
                const isOpen = level > 0;
                
                const filteredMaterials = item.materials ? item.materials.filter(mat => {
                  const matchDesc = !colFilters.description || (mat.detail.toLowerCase().includes(colFilters.description.toLowerCase()) || mat.item.toLowerCase().includes(colFilters.description.toLowerCase()));
                  const matchBrand = !colFilters.brand || mat.brand.toLowerCase().includes(colFilters.brand.toLowerCase());
                  const matchQty = !colFilters.qty || mat.qty.toString().includes(colFilters.qty);
                  const matchUnit = !colFilters.unit || mat.unit.toLowerCase().includes(colFilters.unit.toLowerCase());
                  return matchDesc && matchBrand && matchQty && matchUnit;
                }) : [];

                return (
                  <React.Fragment key={item.id}>
                    <tr className={`transition-all duration-200 border-l-4 ${isOpen ? 'bg-blue-50/30 border-l-blue-600 dark:bg-blue-900/10 dark:border-l-blue-500' : 'hover:bg-slate-50 border-l-transparent dark:hover:bg-slate-800/50'}`}>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className={`text-base font-bold transition-colors ${isOpen ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>{item.jenis}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => changeLevel(item.id, 'NEXT')} disabled={level >= 4} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-sm ${level >= 4 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}>
                              {level === 0 ? <Eye size={14}/> : <ArrowRight size={14}/>} {level === 0 ? "View Details" : `Show Level ${level + 1}`}
                            </button>
                            {isOpen && <button onClick={() => changeLevel(item.id, 'CLOSE')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm border bg-white text-red-600 border-red-200 hover:bg-red-50"><X size={14} /> Close</button>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><span className="font-bold text-base text-slate-700 dark:text-slate-300">{item.jumlah}</span></td>
                      <td className="px-6 py-5 font-medium text-sm text-slate-600 dark:text-slate-400">{formatRupiah(item.hargaSatuan)}</td>
                      <td className="px-6 py-5 font-bold text-base text-slate-800 dark:text-slate-200">{formatRupiah(item.hargaAkhir)}</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex justify-center gap-2">
                           <button onClick={() => navigate(`/project-detail/edit/${item.id}`)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><FileEdit size={18}/></button>
                           <button onClick={() => handleDeletePanel(item.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                    
                    {isOpen && (
                      <tr>
                        <td colSpan="6" className="p-0 border-t border-blue-100 dark:border-slate-700">
                          <div className="p-6 shadow-inner bg-slate-50/50 dark:bg-slate-950/50">
                             <div className="rounded-lg shadow-sm overflow-visible border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                               <div className="overflow-x-visible">
                                 <table className="w-full text-sm">
                                   <thead>
                                     <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                       <ColumnFilter label="Description / Detail" field="description" currentFilter={colFilters.description} onFilterChange={handleColFilterChange} />
                                       <ColumnFilter label="Brand" field="brand" currentFilter={colFilters.brand} onFilterChange={handleColFilterChange} />
                                       <ColumnFilter label="Qty" field="qty" currentFilter={colFilters.qty} onFilterChange={handleColFilterChange} />
                                       <ColumnFilter label="Unit" field="unit" currentFilter={colFilters.unit} onFilterChange={handleColFilterChange} />
                                       {level >= 2 && (<><th className="p-3 text-center bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700">Fctr</th><th className="p-3 text-center bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700">Disc%</th><th className="p-3 text-right bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700">Unit Price</th><th className="p-3 text-right bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700">Total</th></>)}
                                       {level >= 3 && (<><th className="p-3 bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700">Vendor</th><th className="p-3 text-right bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700">MH</th></>)}
                                       {level >= 4 && (<th className="p-3 bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700">Status</th>)}
                                     </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                     {filteredMaterials.length > 0 ? (
                                        filteredMaterials.map((mat) => (
                                            <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                              <td className="p-3 pl-6 border-r font-medium">
                                                <HighlightText text={mat.detail} highlight={colFilters.description} />
                                                <div className="text-[10px] text-slate-400"><HighlightText text={mat.item} highlight={colFilters.description} /></div>
                                              </td>
                                              <td className="p-3 border-r"><span className="text-xs px-2 py-0.5 rounded border bg-slate-100 dark:bg-slate-800"><HighlightText text={mat.brand} highlight={colFilters.brand} /></span></td>
                                              <td className="p-3 text-center border-r"><HighlightText text={mat.qty} highlight={colFilters.qty} /></td>
                                              <td className="p-3 text-center border-r text-slate-500"><HighlightText text={mat.unit} highlight={colFilters.unit} /></td>
                                              {level >= 2 && (<><td className="p-3 text-center border-r bg-blue-50/20">{mat.factor}</td><td className="p-3 text-center border-r bg-blue-50/20">{mat.diskon}</td><td className="p-3 text-right border-r bg-blue-50/20 text-xs font-mono">{renderPrice(getMaterialPrice(mat), mat.currency)}</td><td className="p-3 text-right border-r bg-blue-50/20 font-bold text-blue-700">{renderPrice(calculateTotalMaterial(mat), mat.currency)}</td></>)}
                                              {level >= 3 && (<><td className="p-3 border-r bg-purple-50/20">{mat.vendor}</td><td className="p-3 text-right border-r bg-purple-50/20">{mat.manHour}</td></>)}
                                              {level >= 4 && (<td className="p-3 bg-orange-50/20"><span className="text-[10px] font-bold uppercase text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Ready</span></td>)}
                                            </tr>
                                        ))
                                      ) : (
                                        <tr><td colSpan={12} className="p-6 text-center italic text-slate-400">{item.materials && item.materials.length > 0 ? "No items match your filter." : "No Materials"}</td></tr>
                                      )}
                                   </tbody>
                                 </table>
                               </div>
                               <div className="p-2 border-t text-center bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                                  {level < 4 ? (<button onClick={() => changeLevel(item.id, 'NEXT')} className="text-xs font-bold hover:underline text-blue-600">Show Level {level + 1}</button>) : (<span className="text-xs font-medium text-slate-400">All visible</span>)}
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
      
      {/* MODAL SEARCH & ADD PANEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 p-6">
             <h3 className="text-lg font-bold mb-4">Pilih atau Buat Panel</h3>
             <form onSubmit={handleAddPanel} className="space-y-4">
                
                {/* Search / Create Input */}
                <div className="relative" ref={dropdownRef}>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Panel</label>
                  <input 
                    type="text" 
                    placeholder="Cari atau ketik nama panel baru..." 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={modalSearchTerm} 
                    onChange={(e) => {
                      setModalSearchTerm(e.target.value); 
                      // Update form jenis real-time jika custom
                      setNewPanelForm(prev => ({...prev, jenis: e.target.value}));
                      setIsDropdownOpen(true);
                    }} 
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  
                  {/* Dropdown Results */}
                  {isDropdownOpen && modalSearchTerm && (
                    <div className="absolute w-full bg-white border mt-1 max-h-48 overflow-auto z-10 shadow-lg rounded-lg">
                      {/* Opsi Panel yang Ada */}
                      {filteredMasterPanels.length > 0 && (
                        <div className="border-b border-slate-100">
                          <div className="px-3 py-1 text-[10px] text-slate-400 uppercase font-bold bg-slate-50">Master Panel</div>
                          {filteredMasterPanels.map(mp => (
                            <div 
                              key={mp.id} 
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700"
                              onClick={() => handleSelectPanel(mp)}
                            >
                              {mp.name}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Opsi Buat Baru (Selalu muncul jika ada teks) */}
                      <div 
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer text-sm text-green-700 font-medium flex items-center gap-2"
                        onClick={handleCreateCustomPanel}
                      >
                        <PlusCircle size={16}/>
                        Buat panel baru: "{modalSearchTerm}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Jumlah */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Jumlah</label>
                  <input 
                    type="number" 
                    value={newPanelForm.jumlah} 
                    onChange={e => setNewPanelForm({...newPanelForm, jumlah: e.target.value})} 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    min="1"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-100 text-sm font-bold text-slate-600">Batal</button>
                  <button 
                    type="submit" 
                    disabled={!newPanelForm.jenis} 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow-md disabled:opacity-50"
                  >
                    {newPanelForm.idMaster ? "Tambah Panel" : "Buat Panel Baru"}
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