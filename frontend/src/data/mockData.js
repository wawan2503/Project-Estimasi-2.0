export const KURS_USD = 16000;

export const formatRupiah = (angka) => {
  const n = Number(angka) || 0;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
};

export const formatUSD = (angka) => {
  const n = Number(angka) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
};

export const calculateMaterialPrice = (item) => {
  const qty = parseFloat(item.qty) || 0;
  const factor = parseFloat(item.factor) || 1;
  const diskon = parseFloat(item.diskon) || 0;
  const manHour = parseFloat(item.manHour) || 0;
  const intPrice = parseFloat(item.internationalPrice) || 0;
  const locPrice = parseFloat(item.localPrice) || 0;

  const discRate = (100 - diskon) / 100;
  const sumPriceIDR = locPrice + (intPrice > 0 ? intPrice * KURS_USD : 0);
  const priceAfterDiscIDR = sumPriceIDR > 0 ? (sumPriceIDR * discRate) / factor : 0;
  return (priceAfterDiscIDR + manHour / factor) * qty;
};

export const calculatePanelTotal = (panel) => {
  if (!panel.materials || panel.materials.length === 0) {
    return panel.hargaAkhir || panel.jumlah * panel.hargaSatuan || 0;
  }
  return panel.materials.reduce((sum, mat) => sum + calculateMaterialPrice(mat), 0) * (panel.jumlah || 1);
};

export const calculateProjectTotal = (project) => {
  const panelsTotal = (project.details || []).reduce((sum, panel) => sum + calculatePanelTotal(panel), 0);
  const additionalCosts = project.additionalCosts || {};
  const additionalTotal = Object.values(additionalCosts).reduce((sum, cost) => sum + (parseFloat(cost) || 0), 0);
  return panelsTotal + additionalTotal;
};
