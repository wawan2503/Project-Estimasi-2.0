// --- 1. KONSTANTA & HELPER ---
export const GAE_LOGO_URL = "https://i.ibb.co/PzMQJ7b/gae-logo.png";
export const KURS_USD = 16000;

export const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

export const formatUSD = (angka) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(angka);
};

// Calculate material row price
export const calculateMaterialPrice = (item) => {
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
  const totalPrice = (basePriceIDR + manHour) * qty;
  return totalPrice;
};

// Calculate panel total from materials
export const calculatePanelTotal = (panel) => {
  if (!panel.materials || panel.materials.length === 0) {
    return panel.hargaAkhir || (panel.jumlah * panel.hargaSatuan) || 0;
  }
  return panel.materials.reduce((sum, mat) => sum + calculateMaterialPrice(mat), 0) * panel.jumlah;
};

// Calculate project total from panels + additional costs
export const calculateProjectTotal = (project) => {
  const panelsTotal = (project.details || []).reduce((sum, panel) => sum + calculatePanelTotal(panel), 0);
  const additionalCosts = project.additionalCosts || {};
  const additionalTotal = Object.values(additionalCosts).reduce((sum, cost) => sum + (parseFloat(cost) || 0), 0);
  return panelsTotal + additionalTotal;
};

// --- 2. MASTER DATA KOMPONEN (DATABASE ITEM) ---
// Struktur diperbarui sesuai format Excel
export const masterComponents = [
  { 
    id: 'c1', item: 'MCCB', brand: 'Schneider', series: 'NSX', pole: '1P', ka: '10', ampere: '50-70', 
    detail: 'MCCB,1P,10KA,50-70A', unit: 'UNIT', 
    internationalPrice: 0, localPrice: 500000, currency: 'IDR', manHour: 18000, vendor: 'Graha El' 
  },
  { 
    id: 'c2', item: 'Kontaktor', brand: 'Schneider', series: 'TeSys', pole: '-', ka: '10', ampere: '50-70', 
    detail: 'Kontaktor 10KA 50-70A', unit: 'UNIT', 
    internationalPrice: 35, localPrice: 0, currency: 'USD', manHour: 18000, vendor: 'Graha El' 
  },
  { 
    id: 'c3', item: 'ACB', brand: 'Schneider', series: 'MasterPact', pole: '3P', ka: '65', ampere: '1000', 
    detail: 'ACB 1000A Drawout', unit: 'UNIT', 
    internationalPrice: 0, localPrice: 15000000, currency: 'IDR', manHour: 50000, vendor: 'Graha El' 
  },
];

// --- 3. MASTER DATA PANEL (KATALOG) ---
export const masterPanels = [
  { 
    id: 'mp1', name: 'PHB TM OUTGOING', price: 100000000,
    defaultMaterials: [
      { ...masterComponents[0], id: 'dm1', qty: 1, factor: 1, diskon: 10 }, // MCCB
      { ...masterComponents[1], id: 'dm2', qty: 1, factor: 1, diskon: 10 }  // Kontaktor
    ]
  },
  { 
    id: 'mp2', name: 'PANEL LVMDP', price: 250000000,
    defaultMaterials: []
  }
];

// --- 4. DATA PROJECT UTAMA ---
export const projectsData = [
  {
    id: 1,
    jobNo: 'E6-2117',
    namaProject: 'Ehouse',
    customer: 'Freeport',
    harga: 100000000000,
    pembuat: 'Irwansyah Sarumaha',
    lastEditDate: '09 Des 2025',
    lastEditTime: '10:33',
    details: [
       { 
         id: 101, jenis: 'PHB TM OUTGOING', jumlah: 1, hargaSatuan: 100000000, hargaAkhir: 100000000,
         materials: [
           { 
             id: 'ex1', ...masterComponents[0], qty: 1, factor: 1, diskon: 10
           },
           { 
             id: 'ex2', ...masterComponents[1], qty: 1, factor: 1, diskon: 10
           }
         ]
       },
    ]
  },
];