import * as XLSX from 'xlsx-js-style';

function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\*/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function parseExcelNumber(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  let s = String(value).trim();
  if (!s) return 0;

  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }

  s = s.replace(/\s+/g, '');
  s = s.replace(/rp/gi, '');
  s = s.replace(/\$/g, '');

  const dotCount = (s.match(/\./g) || []).length;
  const commaCount = (s.match(/,/g) || []).length;

  if (dotCount && commaCount) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (commaCount && !dotCount) {
    if (/,\d{1,2}$/.test(s)) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
  } else if (dotCount && !commaCount) {
    if (dotCount > 1) s = s.replace(/\./g, '');
    else if (/\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
  }

  s = s.replace(/[^\d.-]/g, '');
  const num = Number(s);
  if (!Number.isFinite(num)) return 0;
  return negative ? -num : num;
}

function headerToKey(normalizedHeader) {
  const map = {
    legacyid: 'legacyId',
    legacy: 'legacyId',
    legacycode: 'legacyId',
    code: 'legacyId',

    item: 'item',
    material: 'item',

    brand: 'brand',
    merk: 'brand',

    series: 'series',
    seri: 'series',

    pole: 'pole',

    ka: 'ka',
    breakingcapacity: 'ka',

    ampere: 'ampere',
    current: 'ampere',

    detail: 'detail',
    description: 'detail',
    deskripsi: 'detail',

    unit: 'unit',
    satuan: 'unit',

    currency: 'currency',
    curr: 'currency',

    localpriceidr: 'localPrice',
    localprice: 'localPrice',
    local: 'localPrice',
    hargalokal: 'localPrice',
    pricelocal: 'localPrice',

    intlusdprice: 'internationalPrice',
    intlpriceusd: 'internationalPrice',
    internationalprice: 'internationalPrice',
    internationalpriceusd: 'internationalPrice',
    globalprice: 'internationalPrice',
    hargaimport: 'internationalPrice',

    manhour: 'manHour',
    manhourcost: 'manHour',
    mh: 'manHour',

    vendor: 'vendor',
    supplier: 'vendor'
  };

  if (normalizedHeader === 'no' || normalizedHeader === 'nomor') return null;

  return map[normalizedHeader] ?? null;
}

export function createMaterialsTemplateWorkbook() {
  const headers = [
    'Legacy ID',
    'Item*',
    'Brand*',
    'Series',
    'Pole',
    'KA',
    'Ampere',
    'Detail',
    'Unit',
    'Currency (IDR/USD)',
    'Local Price (IDR)',
    "Int'l Price (USD)",
    'Man Hour (Auto 2% x Local Price)',
    'Vendor'
  ];

  const sample = [
    'MAT-0001',
    'MCCB',
    'Schneider',
    'CVS',
    '3P',
    '10KA',
    '50-70',
    'MCCB,3P,10KA,50-70A',
    'UNIT',
    'IDR',
    1500000,
    0,
    30000,
    'Graha El'
  ];

  const ws = XLSX.utils.aoa_to_sheet([]);
  XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
  XLSX.utils.sheet_add_aoa(ws, [sample], { origin: 'A2' });

  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
    fill: { fgColor: { rgb: '1E40AF' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  const cellStyle = {
    alignment: { vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      left: { style: 'thin', color: { rgb: 'CCCCCC' } },
      right: { style: 'thin', color: { rgb: 'CCCCCC' } }
    }
  };

  headers.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (ws[cellRef]) ws[cellRef].s = headerStyle;
  });

  sample.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: colIdx });
    if (ws[cellRef]) ws[cellRef].s = cellStyle;
  });

  ws['!cols'] = [
    { wch: 14 }, // Legacy ID
    { wch: 14 }, // Item
    { wch: 16 }, // Brand
    { wch: 12 }, // Series
    { wch: 8 }, // Pole
    { wch: 8 }, // KA
    { wch: 10 }, // Ampere
    { wch: 30 }, // Detail
    { wch: 10 }, // Unit
    { wch: 18 }, // Currency
    { wch: 18 }, // Local Price
    { wch: 18 }, // Int'l Price
    { wch: 12 }, // Man Hour
    { wch: 16 } // Vendor
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Materials');
  return wb;
}

export function downloadMaterialsTemplate(filename = 'Materials_Import_Template.xlsx') {
  const wb = createMaterialsTemplateWorkbook();
  XLSX.writeFile(wb, filename);
}

export function parseMaterialsArrayBuffer(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const preferredSheet =
    wb.SheetNames.find((n) => normalizeHeader(n) === 'materials') ?? wb.SheetNames[0];
  const ws = wb.Sheets[preferredSheet];
  if (!ws) return { items: [], errors: ['No worksheet found'] };

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });
  if (!rows.length) return { items: [], errors: ['Sheet is empty'] };

  const isHeaderRow = (row) => {
    const normalized = (row ?? []).map(normalizeHeader).filter(Boolean);
    if (!normalized.length) return false;
    const hit = new Set(normalized.map(headerToKey).filter(Boolean));
    return hit.has('item') && hit.has('brand');
  };

  const headerRowIndex = rows.slice(0, 30).findIndex(isHeaderRow);
  if (headerRowIndex < 0) {
    return {
      items: [],
      errors: ['Header row not found (need at least Item and Brand columns)']
    };
  }

  const headerRow = rows[headerRowIndex];
  const columnMap = new Map();
  headerRow.forEach((cell, idx) => {
    const key = headerToKey(normalizeHeader(cell));
    if (key) columnMap.set(idx, key);
  });

  const errors = [];
  const items = [];

  const dataRows = rows.slice(headerRowIndex + 1);
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const isEmpty = (row ?? []).every((v) => String(v ?? '').trim() === '');
    if (isEmpty) continue;

    const material = {};
    for (const [colIdx, key] of columnMap.entries()) {
      material[key] = row[colIdx];
    }

    const item = String(material.item ?? '').trim();
    const brand = String(material.brand ?? '').trim();

    if (!item || !brand) {
      errors.push(`Row ${headerRowIndex + 2 + i}: item/brand is required`);
      continue;
    }

    const currency = String(material.currency ?? '').trim().toUpperCase();
    const unit = String(material.unit ?? '').trim().toUpperCase();
    const localPrice = Math.max(0, parseExcelNumber(material.localPrice));
    const computedManHour = Math.round(localPrice * 0.02);

    items.push({
      legacyId: String(material.legacyId ?? '').trim() || undefined,
      item,
      brand,
      series: String(material.series ?? '').trim() || null,
      pole: String(material.pole ?? '').trim() || null,
      ka: String(material.ka ?? '').trim() || null,
      ampere: String(material.ampere ?? '').trim() || null,
      detail: String(material.detail ?? '').trim() || null,
      unit: unit || 'UNIT',
      currency: currency === 'USD' ? 'USD' : 'IDR',
      localPrice,
      internationalPrice: Math.max(0, parseExcelNumber(material.internationalPrice)),
      manHour: computedManHour,
      vendor: String(material.vendor ?? '').trim() || null
    });
  }

  return { items, errors, sheetName: preferredSheet };
}
