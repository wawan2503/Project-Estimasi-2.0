// --- 1. KONSTANTA & HELPER ---

// URL Logo GAE
export const GAE_LOGO_URL = "https://i.ibb.co/PzMQJ7b/gae-logo.png";

// Helper Format Rupiah
export const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(angka);
};

// --- 2. MASTER DATA KOMPONEN (DATABASE ITEM) ---
// Data ini digunakan untuk fitur "Search" dan "Cascading Filter" di Edit Panel.
// Strukturnya lengkap agar filter dari kiri ke kanan (Item -> Brand -> Series...) nyambung.

export const masterComponents = [
  // === MCB SCHNEIDER ===
  { id: 'c1', item: 'MCB', brand: 'Schneider', series: 'Domae', pole: '1P', ka: '4.5', ampere: '6', detail: 'MCB Domae 1P 6A 4.5kA', unit: 'Pcs', price: 45000, vendor: 'Graha El' },
  { id: 'c2', item: 'MCB', brand: 'Schneider', series: 'Domae', pole: '1P', ka: '4.5', ampere: '10', detail: 'MCB Domae 1P 10A 4.5kA', unit: 'Pcs', price: 45000, vendor: 'Graha El' },
  { id: 'c3', item: 'MCB', brand: 'Schneider', series: 'Domae', pole: '1P', ka: '4.5', ampere: '16', detail: 'MCB Domae 1P 16A 4.5kA', unit: 'Pcs', price: 45000, vendor: 'Graha El' },
  { id: 'c4', item: 'MCB', brand: 'Schneider', series: 'iC60N', pole: '3P', ka: '10', ampere: '20', detail: 'MCB iC60N 3P 20A 10kA', unit: 'Pcs', price: 350000, vendor: 'Graha El' },
  { id: 'c5', item: 'MCB', brand: 'Schneider', series: 'iC60N', pole: '3P', ka: '10', ampere: '32', detail: 'MCB iC60N 3P 32A 10kA', unit: 'Pcs', price: 375000, vendor: 'Graha El' },

  // === MCB ABB ===
  { id: 'c6', item: 'MCB', brand: 'ABB', series: 'SH200', pole: '1P', ka: '6', ampere: '10', detail: 'MCB SH200 1P 10A 6kA', unit: 'Pcs', price: 42000, vendor: 'Surya Electric' },
  { id: 'c7', item: 'MCB', brand: 'ABB', series: 'S200M', pole: '3P', ka: '10', ampere: '50', detail: 'MCB S200M 3P 50A 10kA', unit: 'Pcs', price: 400000, vendor: 'Surya Electric' },

  // === MCCB SCHNEIDER ===
  { id: 'c8', item: 'MCCB', brand: 'Schneider', series: 'EZC100H', pole: '3P', ka: '30', ampere: '80', detail: 'MCCB EZC100H 3P 80A 30kA', unit: 'Unit', price: 1100000, vendor: 'Graha El' },
  { id: 'c9', item: 'MCCB', brand: 'Schneider', series: 'NSX100F', pole: '3P', ka: '36', ampere: '100', detail: 'MCCB NSX100F 3P 100A 36kA', unit: 'Unit', price: 2500000, vendor: 'Graha El' },
  { id: 'c10', item: 'MCCB', brand: 'Schneider', series: 'NSX160F', pole: '3P', ka: '36', ampere: '160', detail: 'MCCB NSX160F 3P 160A 36kA', unit: 'Unit', price: 3200000, vendor: 'Graha El' },
  
  // === MCCB LS ===
  { id: 'c11', item: 'MCCB', brand: 'LS', series: 'Metasol', pole: '3P', ka: '18', ampere: '50', detail: 'MCCB ABN53c 3P 50A 18kA', unit: 'Unit', price: 750000, vendor: 'Korea Part' },

  // === KONTAKTOR ===
  { id: 'c12', item: 'Kontaktor', brand: 'Schneider', series: 'TeSys D', pole: '3P', ka: '-', ampere: '25', detail: 'Kontaktor LC1D25 25A 220V', unit: 'Pcs', price: 350000, vendor: 'Graha El' },
  { id: 'c13', item: 'Kontaktor', brand: 'Schneider', series: 'TeSys D', pole: '3P', ka: '-', ampere: '50', detail: 'Kontaktor LC1D50 50A 220V', unit: 'Pcs', price: 850000, vendor: 'Graha El' },

  // === KABEL (Contoh item non-elektrikal berat) ===
  // Perhatikan: Pole, KA, Ampere diisi '-' agar filter tetap jalan
  { id: 'c14', item: 'Kabel', brand: 'Supreme', series: 'NYA', pole: '-', ka: '-', ampere: '-', detail: 'Kabel NYA 1.5mm Hitam', unit: 'Roll', price: 350000, vendor: 'Kabelindo' },
  { id: 'c15', item: 'Kabel', brand: 'Supreme', series: 'NYY', pole: '-', ka: '-', ampere: '-', detail: 'Kabel NYY 4x10mm', unit: 'Mtr', price: 150000, vendor: 'Kabelindo' },
  { id: 'c16', item: 'Kabel', brand: 'Kabelmetal', series: 'NYY', pole: '-', ka: '-', ampere: '-', detail: 'Kabel NYY 4x10mm Metal', unit: 'Mtr', price: 145000, vendor: 'Kabelindo' },
];

// --- 3. MASTER DATA PANEL (KATALOG) ---
// Ini digunakan untuk Modal "Tambah Panel" (Pilih dari Master)
export const masterPanels = [
  { 
    id: 'mp1', 
    name: 'PHB TM OUTGOING', 
    price: 100000000,
    // Template material bawaan (diambil dari masterComponents biar ID nya valid)
    defaultMaterials: [
      { ...masterComponents[0], id: 'dm1', qty: 10, factor: 1, diskon: '0%' }, // Copy MCB Schneider 6A
      { ...masterComponents[13], id: 'dm2', qty: 5, factor: 1.1, diskon: '5%' } // Copy Kabel NYA
    ]
  },
  { 
    id: 'mp2', 
    name: 'PANEL LVMDP 1000A', 
    price: 250000000,
    defaultMaterials: [
      { ...masterComponents[8], id: 'dm3', qty: 1, factor: 1, diskon: '10%' } // MCCB NSX100F
    ]
  },
  { 
    id: 'mp3', 
    name: 'PANEL CAPACITOR BANK', 
    price: 45000000,
    defaultMaterials: [] // Kosong
  },
  { 
    id: 'mp4', 
    name: 'PANEL ATS/AMF', 
    price: 85000000,
    defaultMaterials: []
  }
];

// --- 4. DATA PROJECT UTAMA (DUMMY) ---
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
    // LIST PANEL PROJECT (Initial State)
    details: [
       { 
         id: 101, 
         jenis: 'PHB TM OUTGOING', 
         jumlah: 1, 
         hargaSatuan: 100000000, 
         hargaAkhir: 100000000,
         // Default material yang sudah ada di panel ini
         materials: [
           { 
             id: 'exist1', 
             name: 'MCB', brand: 'Schneider', series: 'Domae', pole: '1P', ka: '4.5', ampere: '6', 
             detail: 'MCB Domae 1P 6A 4.5kA', unit: 'Pcs', price: 45000, qty: 10, factor: 1, diskon: '0%', vendor: 'Graha El', status: 'READY'
           },
           { 
             id: 'exist2', 
             name: 'Kabel', brand: 'Supreme', series: 'NYA', pole: '-', ka: '-', ampere: '-', 
             detail: 'Kabel NYA 1.5mm Hitam', unit: 'Roll', price: 350000, qty: 2, factor: 1.1, diskon: '5%', vendor: 'Kabelindo', status: 'PENDING'
           }
         ]
       },
    ]
  },
];