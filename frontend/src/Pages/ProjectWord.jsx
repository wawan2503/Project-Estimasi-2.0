import React from 'react';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { FileText } from 'lucide-react';
import { formatRupiah, formatUSD } from '../data/mockData';

const KURS_USD = 16000;

const ProjectWord = ({ projectInfo, panels }) => {

  const calculateRow = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const factor = parseFloat(item.factor) || 1;
    const diskon = parseFloat(item.diskon) || 0;
    const manHour = parseFloat(item.manHour) || 0;
    const intPrice = parseFloat(item.internationalPrice) || 0;
    const locPrice = parseFloat(item.localPrice) || 0;

    let priceAfterDiscUSD = 0;
    if (intPrice > 0) priceAfterDiscUSD = (intPrice * ((100 - diskon) / 100)) / factor;

    let priceBecomeIDR = 0;
    if (priceAfterDiscUSD > 0) priceBecomeIDR = priceAfterDiscUSD * KURS_USD;

    let priceAfterDiscIDR = 0;
    const sumPriceIDR = locPrice + (intPrice > 0 ? intPrice * KURS_USD : 0);
    if (sumPriceIDR > 0) priceAfterDiscIDR = (sumPriceIDR * ((100 - diskon) / 100)) / factor;

    const priceAfterManHour = priceAfterDiscIDR + manHour / factor;
    const totalPrice = priceAfterManHour * qty;

    return { priceAfterDiscUSD, priceBecomeIDR, priceAfterDiscIDR, priceAfterManHour, totalPrice };
  };

  const handleExportWord = () => {
    const tableRows = [];

    // Header (16 Kolom)
    const headers = [
      "Desc", "Brand", "Ser", "Qty", "Un", 
      "Int.P", "Loc.P", "Cur", "Fct", "Dis", "MH", 
      "Stl(U)", "To IDR", "Stl(I)", "P+MH", "TOTAL"
    ];
    
    tableRows.push(
      new TableRow({
        children: headers.map(h => new TableCell({ 
          children: [new Paragraph({ text: h, bold: true, size: 10 })], // Font kecil agar muat
          shading: { fill: "1E293B", color: "auto" }, // Gelap
        })),
        tableHeader: true,
      })
    );

    // Data Loop
    panels.forEach(panel => {
      // Judul Panel
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph({ text: panel.jenis.toUpperCase(), bold: true, color: "2E74B5", size: 14 })],
              columnSpan: 16,
              shading: { fill: "F2F2F2" }
            })
          ]
        })
      );

      if(panel.materials) {
        panel.materials.forEach(mat => {
          const calc = calculateRow(mat);
          
          const rowData = [
            mat.detail || mat.item, 
            mat.brand, 
            mat.series, 
            mat.qty.toString(), 
            mat.unit,
            formatUSD(mat.internationalPrice), 
            formatRupiah(mat.localPrice), 
            mat.currency,
            mat.factor.toString(), 
            mat.diskon.toString(), 
            mat.manHour.toString(),
            formatUSD(calc.priceAfterDiscUSD), 
            formatRupiah(calc.priceBecomeIDR),
            formatRupiah(calc.priceAfterDiscIDR), 
            formatRupiah(calc.priceAfterManHour),
            formatRupiah(calc.totalPrice)
          ];

          tableRows.push(
            new TableRow({
              children: rowData.map(d => new TableCell({ 
                children: [new Paragraph({ text: d, size: 10 })] 
              }))
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

  return (
    <button 
      onClick={handleExportWord} 
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors"
    >
      <FileText size={16} strokeWidth={2.5}/> Word
    </button>
  );
};

export default ProjectWord;
