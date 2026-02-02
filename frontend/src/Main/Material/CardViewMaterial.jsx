import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { formatRupiah, formatUSD } from '../../data/mockData';

const CardViewMaterial = ({ materials, onEdit, onDelete }) => {
  const formatPrice = (m) => m.currency === 'USD' && m.internationalPrice > 0 ? formatUSD(m.internationalPrice) : formatRupiah(m.localPrice);

  if (materials.length === 0) {
    return (
      <div className="col-span-full py-16 text-center">
        <Package size={32} className="mx-auto text-slate-400 mb-2" />
        <p className="text-slate-500 font-medium">No materials found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {materials.map((m) => (
        <div key={m.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-lg hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div className="flex gap-1">
              <button onClick={() => onEdit(m)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={14}/></button>
              <button onClick={() => onDelete(m.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
            </div>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">{m.item}</h3>
          <p className="text-sm text-slate-500">{m.brand} • {m.series}</p>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.detail}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {m.pole && m.pole !== '-' && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">{m.pole}</span>}
            {m.ampere && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{m.ampere}A</span>}
            {m.ka && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">{m.ka}KA</span>}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-600">{formatPrice(m)}</span>
              <span className="text-xs text-slate-400">{m.vendor}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardViewMaterial;
