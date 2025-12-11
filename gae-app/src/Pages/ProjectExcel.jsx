import React from 'react';
import * as XLSX from 'xlsx-js-style'; 
import { Download } from 'lucide-react';
import { formatRupiah, formatUSD } from '../data/mockData';

const KURS_USD = 16000; 

const ProjectExcel = ({ projectInfo, panels }) => {

  // --- Logic Hitungan (Re-used) ---
  const calculateRow = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const factor = parseFloat(item.factor) || 1;
    const diskon = parseFloat(item.diskon) || 0;
    const manHour = parseFloat(item.manHour) || 0;
    const intPrice = parseFloat(item.internationalPrice) || 0;
    const locPrice = parseFloat(item.localPrice) || 0;

    let priceAfterDiscUSD = 0;
    if (intPrice > 0) priceAfterDiscUSD = intPrice * factor * ((100 - diskon) / 100);

    let priceBecomeIDR = 0;
    if (priceAfterDiscUSD > 0) priceBecomeIDR = priceAfterDiscUSD * KURS_USD;

    let priceAfterDiscIDR = 0;
    if (locPrice > 0) priceAfterDiscIDR = locPrice * factor * ((100 - diskon) / 100);

    const basePriceIDR = priceBecomeIDR > 0 ? priceBecomeIDR : priceAfterDiscIDR;
    const priceAfterManHour = basePriceIDR + manHour;
    const totalPrice = priceAfterManHour * qty;

    return { priceAfterDiscUSD, priceBecomeIDR, priceAfterDiscIDR, priceAfterManHour, totalPrice };
  };

  const handleExportExcel = () => {
    const sheetData = [];
    
    // 1. Info Project
    sheetData.push(["PROJECT SUMMARY"]);
    sheetData.push(["Job No", projectInfo.jobNo]);
    sheetData.push(["Project Name", projectInfo.namaProject]);
    sheetData.push(["Customer", projectInfo.customer]);
    sheetData.push([]); 

    // 2. Header Tabel (16 Kolom)
    sheetData.push([
      "Material Description", "Brand", "Series", "Qty", "Unit", 
      "Int. Price", "Loc. Price", "Cur", 
      "Fctr", "Disc%", "Man Hour",
      "Stl Disc(USD)", "To IDR", "Stl Disc(IDR)", "Price + MH", "TOTAL"
    ]);

    // Baris kosong untuk styling border header bawah
    sheetData.push([
      "", "", "", "", "", "", "", "", "", "", "USD", "IDR", "IDR", "Satuan (IDR)", "Total (IDR)" 
    ]);

    // 3. Isi Data
    panels.forEach(panel => {
      // Judul Panel
      sheetData.push([panel.jenis.toUpperCase(), "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      
      if(panel.materials) {
        panel.materials.forEach(mat => {
          const calc = calculateRow(mat);

          sheetData.push([
            mat.detail || mat.item, 
            mat.brand,              
            mat.series,             
            mat.qty,                
            mat.unit,               
            mat.internationalPrice, 
            mat.localPrice,         
            mat.currency,           
            mat.factor,             
            mat.diskon,             
            mat.manHour,            
            calc.priceAfterDiscUSD, 
            calc.priceBecomeIDR,    
            calc.priceAfterDiscIDR, 
            calc.priceAfterManHour, 
            calc.totalPrice         
          ]);
        });
      }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    
    // 4. Styling
    const borderStyle = { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } };
    const headerStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1E293B" } }, alignment: { horizontal: "center", vertical: "center" }, border: borderStyle };
    const panelTitleStyle = { font: { bold: true, color: { rgb: "1E3A8A" } }, fill: { fgColor: { rgb: "DBEAFE" } }, border: borderStyle };
    const cellStyle = { border: borderStyle, alignment: { vertical: "center" } };

    Object.keys(ws).forEach(cellKey => {
      if (cellKey.indexOf('!') === 0) return;
      const r = XLSX.utils.decode_cell(cellKey).r;
      // const c = XLSX.utils.decode_cell(cellKey).c; // Unused but available

      if (r >= 5) { 
        if(r === 5 || r === 6) {
           ws[cellKey].s = headerStyle;
        } else {
           // Cek apakah ini judul panel (Kolom A ada isi, B kosong)
           const cellValA = ws[XLSX.utils.encode_cell({r:r, c:0})] ? ws[XLSX.utils.encode_cell({r:r, c:0})].v : null;
           const cellValB = ws[XLSX.utils.encode_cell({r:r, c:1})] ? ws[XLSX.utils.encode_cell({r:r, c:1})].v : null;
           
           if (cellValA && !cellValB) {
             ws[cellKey].s = panelTitleStyle;
           } else {
             ws[cellKey].s = cellStyle;
           }
        }
      }
    });
    
    // 5. Width
    ws['!merges'] = [{ s: { r: 5, c: 10 }, e: { r: 5, c: 11 } }, { s: { r: 5, c: 13 }, e: { r: 5, c: 14 } }];
    ws['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Detail Estimasi");
    XLSX.writeFile(wb, `${projectInfo.jobNo}_Detail_Estimasi.xlsx`);
  };

  return (
    <button 
      onClick={handleExportExcel} 
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border text-green-700 bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
    >
      <Download size={16} strokeWidth={2.5}/> Excel
    </button>
  );
};

export default ProjectExcel;    