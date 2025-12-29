 import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Package, X, Save, FileSpreadsheet, LayoutGrid, Table, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { masterComponents, formatRupiah, formatUSD } from '../../data/mockData';
import MobileHeader from '../../components/MobileHeader';
import TableViewMaterial from './TableViewMaterial';
import CardViewMaterial from './CardViewMaterial';
import * as XLSX from 'xlsx-js-style';

const ITEMS_PER_PAGE = 50;

const MaterialPage = ({ setSidebarOpen }) => {
  const [materials, setMaterials] = useState(masterComponents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [currentPage, setCurrentPage] = useState(1);
  
  const emptyForm = {
    item: '', brand: '', series: '', pole: '', ka: '', ampere: '',
    detail: '', unit: 'UNIT', internationalPrice: 0, localPrice: 0,
    currency: 'IDR', manHour: 0, vendor: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  const openAddModal = () => { setEditingMaterial(null); setFormData(emptyForm); setIsModalOpen(true); };
  const openEditModal = (material) => { setEditingMaterial(material); setFormData({ ...material }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingMaterial(null); setFormData(emptyForm); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const materialData = {
      ...formData,
      internationalPrice: parseFloat(formData.internationalPrice) || 0,
      localPrice: parseFloat(formData.localPrice) || 0,
      manHour: parseFloat(formData.manHour) || 0
    };
    if (editingMaterial) {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? { ...materialData, id: editingMaterial.id } : m));
    } else {
      setMaterials([...materials, { ...materialData, id: `c${Date.now()}` }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this material?')) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const filteredMaterials = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return materials.filter(m =>
      m.item.toLowerCase().includes(search) ||
      m.brand.toLowerCase().includes(search) ||
      m.detail.toLowerCase().includes(search) ||
      m.series?.toLowerCase().includes(search) ||
      m.vendor.toLowerCase().includes(search)
    );
  }, [materials, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMaterials.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMaterials, currentPage]);

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Export to Excel
  const exportToExcel = () => {
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "1E40AF" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const cellStyle = {
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } }
      }
    };

    const numberStyle = {
      ...cellStyle,
      alignment: { horizontal: "right", vertical: "center" },
      numFmt: "#,##0"
    };

    // Prepare data
    const headers = [
      "No", "Item", "Brand", "Series", "Pole", "KA", "Ampere", 
      "Detail", "Unit", "Currency", "Local Price (IDR)", "Int'l Price (USD)", 
      "Man Hour", "Vendor"
    ];

    const data = filteredMaterials.map((m, idx) => [
      idx + 1,
      m.item,
      m.brand,
      m.series || '-',
      m.pole || '-',
      m.ka || '-',
      m.ampere || '-',
      m.detail || '-',
      m.unit,
      m.currency,
      m.localPrice,
      m.internationalPrice,
      m.manHour,
      m.vendor
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Add title
    XLSX.utils.sheet_add_aoa(ws, [["MATERIAL DATABASE"]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(ws, [[`Export Date: ${new Date().toLocaleDateString('id-ID')}`]], { origin: "A2" });
    XLSX.utils.sheet_add_aoa(ws, [[`Total Materials: ${filteredMaterials.length}`]], { origin: "A3" });
    
    // Add headers
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A5" });
    
    // Add data
    XLSX.utils.sheet_add_aoa(ws, data, { origin: "A6" });

    // Style title
    ws["A1"] = { v: "MATERIAL DATABASE", s: { font: { bold: true, sz: 16, color: { rgb: "1E40AF" } } } };
    ws["A2"] = { v: `Export Date: ${new Date().toLocaleDateString('id-ID')}`, s: { font: { sz: 10, color: { rgb: "666666" } } } };
    ws["A3"] = { v: `Total Materials: ${filteredMaterials.length}`, s: { font: { sz: 10, color: { rgb: "666666" } } } };

    // Style headers
    const headerRow = 5;
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow - 1, c: colIdx });
      if (ws[cellRef]) ws[cellRef].s = headerStyle;
    });

    // Style data cells
    data.forEach((row, rowIdx) => {
      row.forEach((_, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow + rowIdx, c: colIdx });
        if (ws[cellRef]) {
          // Number columns (Local Price, Int'l Price, Man Hour)
          if (colIdx === 10 || colIdx === 11 || colIdx === 12) {
            ws[cellRef].s = numberStyle;
          } else {
            ws[cellRef].s = cellStyle;
          }
        }
      });
    });

    // Set column widths
    ws["!cols"] = [
      { wch: 5 },   // No
      { wch: 15 },  // Item
      { wch: 15 },  // Brand
      { wch: 12 },  // Series
      { wch: 8 },   // Pole
      { wch: 8 },   // KA
      { wch: 10 },  // Ampere
      { wch: 30 },  // Detail
      { wch: 8 },   // Unit
      { wch: 10 },  // Currency
      { wch: 18 },  // Local Price
      { wch: 18 },  // Int'l Price
      { wch: 12 },  // Man Hour
      { wch: 15 },  // Vendor
    ];

    // Merge title cell
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    ];

    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    XLSX.writeFile(wb, `Material_Database_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Materials" />
      
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <Package size={28} className="text-blue-600" /> Material Database
              </h1>
              <p className="text-slate-500 text-sm mt-1">{filteredMaterials.length} of {materials.length} materials</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              {/* Search */}
              <div className="relative flex-1 sm:w-[200px]">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              {/* View Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => setViewMode('card')} className={`p-2 rounded-md transition-all ${viewMode === 'card' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <LayoutGrid size={18} />
                </button>
                <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Table size={18} />
                </button>
              </div>
              <button onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-lg font-semibold shadow flex items-center justify-center gap-2">
                <FileSpreadsheet size={18} />
              </button>
              <button onClick={openAddModal}
                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2.5 rounded-lg font-semibold shadow flex items-center justify-center gap-2">
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto py-6">
          
          {/* Card View */}
          {viewMode === 'card' && (
            <CardViewMaterial 
              materials={paginatedMaterials} 
              onEdit={openEditModal} 
              onDelete={handleDelete} 
            />
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <TableViewMaterial 
              materials={paginatedMaterials} 
              onEdit={openEditModal} 
              onDelete={handleDelete}
              onAdd={(newMaterial) => setMaterials([...materials, newMaterial])}
            />
          )}

          {/* Shared Pagination */}
          {filteredMaterials.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
              <span className="text-xs text-slate-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredMaterials.length)} of {filteredMaterials.length}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14}/> Prev
                </button>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <input 
                    type="number" 
                    min="1" 
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCurrentPage(Math.min(Math.max(1, val), totalPages));
                    }}
                    className="w-10 text-center text-xs font-bold bg-transparent text-blue-700 dark:text-blue-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">/ {totalPages}</span>
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {editingMaterial ? <Edit2 size={22} className="text-orange-500" /> : <Package size={22} className="text-blue-600" />}
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                  <input type="text" name="item" required value={formData.item} onChange={handleInputChange}
                    placeholder="e.g. MCCB" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand *</label>
                  <input type="text" name="brand" required value={formData.brand} onChange={handleInputChange}
                    placeholder="e.g. Schneider" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Series</label>
                  <input type="text" name="series" value={formData.series} onChange={handleInputChange}
                    placeholder="e.g. NSX" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Pole</label>
                  <input type="text" name="pole" value={formData.pole} onChange={handleInputChange}
                    placeholder="e.g. 3P" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">KA</label>
                  <input type="text" name="ka" value={formData.ka} onChange={handleInputChange}
                    placeholder="e.g. 10" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ampere</label>
                  <input type="text" name="ampere" value={formData.ampere} onChange={handleInputChange}
                    placeholder="e.g. 50-70" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Detail / Description</label>
                  <input type="text" name="detail" value={formData.detail} onChange={handleInputChange}
                    placeholder="e.g. MCCB,3P,10KA,50-70A" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="UNIT">UNIT</option>
                    <option value="SET">SET</option>
                    <option value="PCS">PCS</option>
                    <option value="METER">METER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                  <select name="currency" value={formData.currency} onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="IDR">IDR (Rupiah)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Local Price (IDR)</label>
                  <input type="number" name="localPrice" value={formData.localPrice} onChange={handleInputChange}
                    placeholder="0" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">International Price (USD)</label>
                  <input type="number" name="internationalPrice" value={formData.internationalPrice} onChange={handleInputChange}
                    placeholder="0" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Man Hour Cost</label>
                  <input type="number" name="manHour" value={formData.manHour} onChange={handleInputChange}
                    placeholder="0" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor *</label>
                  <input type="text" name="vendor" required value={formData.vendor} onChange={handleInputChange}
                    placeholder="e.g. Graha El" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="mt-6 pt-4 flex gap-3 justify-end border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit"
                  className={`px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 shadow ${
                    editingMaterial ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  <Save size={18} /> {editingMaterial ? 'Update Material' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialPage;
