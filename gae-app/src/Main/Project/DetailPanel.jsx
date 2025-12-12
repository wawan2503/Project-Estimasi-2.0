import React from 'react';

/**
 * Props:
 * - item: panel object (with .materials)
 * - level: current detail level (0-4)
 * - colFilters: { detail, brand, series, qty, unit }
 * - calculateRow: function(item) => { ... }
 * - changeLevel: (id, action) => void
 * - handleColFilterChange: (field, value) => void
 * - formatRupiah, formatUSD: formatting helpers
 * - scrollContainerStyle: style object for scrollbar
 * - ColumnFilter: component (passed from parent)
 * - HighlightText: component (passed from parent)
 */
const DetailPanel = ({
  item,
  level,
  colFilters,
  calculateRow,
  changeLevel,
  handleColFilterChange,
  formatRupiah,
  formatUSD,
  scrollContainerStyle,
  ColumnFilter,
  HighlightText,
}) => {
  const filteredMaterials = (item.materials || []).filter((mat) => {
    const check = (val, filter) => (val || '').toString().toLowerCase().includes((filter || '').toLowerCase());
    return check(mat.detail, colFilters.detail)
      && check(mat.brand, colFilters.brand)
      && check(mat.series, colFilters.series)
      && check(mat.qty, colFilters.qty)
      && check(mat.unit, colFilters.unit);
  });

  // adjust min widths depending on level so layout stays stable
  let innerTableMinClass = 'min-w-full';
  if (level === 2) innerTableMinClass = 'min-w-[1200px]';
  if (level === 3) innerTableMinClass = 'min-w-[1700px]';
  if (level >= 4) innerTableMinClass = 'min-w-[2200px]';

  return (
    <tr>
      <td colSpan="5" className="p-0 border-t border-blue-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="w-full overflow-x-auto p-4 mx-auto" style={scrollContainerStyle}>
          <div className="border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg shadow-sm inline-block">
            <table className={`${innerTableMinClass} w-full text-xs border-collapse`}>
              <thead>
                <tr className="bg-slate-800 text-white border-b border-slate-700 h-[45px]">
                  <ColumnFilter
                    label="Material Description"
                    field="detail"
                    currentFilter={colFilters.detail}
                    onFilterChange={handleColFilterChange}
                    bgColor="bg-slate-900"
                    width="min-w-[280px]"
                    className="sticky left-0 z-30 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.5)] border-r-2 border-r-slate-600"
                  />
                  <ColumnFilter label="Brand" field="brand" currentFilter={colFilters.brand} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[100px]" />
                  <ColumnFilter label="Series" field="series" currentFilter={colFilters.series} onFilterChange={handleColFilterChange} bgColor="bg-slate-800" width="min-w-[100px]" />
                  <ColumnFilter label="Qty" field="qty" currentFilter={colFilters.qty} onFilterChange={handleColFilterChange} bgColor="bg-blue-900" width="min-w-[70px]" />
                  <ColumnFilter label="Unit" field="unit" currentFilter={colFilters.unit} onFilterChange={handleColFilterChange} bgColor="bg-blue-900" width="min-w-[70px]" />

                  {level >= 2 && (
                    <>
                      <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-28 text-right align-middle">Int. Price</th>
                      <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-28 text-right align-middle">Loc. Price</th>
                      <th className="p-2 border-r border-slate-600 bg-blue-900/90 w-12 text-center align-middle">Cur</th>
                    </>
                  )}

                  {level >= 3 && (
                    <>
                      <th className="p-2 border-r border-slate-600 bg-green-900 w-16 text-center align-middle">Fctr</th>
                      <th className="p-2 border-r border-slate-600 bg-green-900 w-16 text-center align-middle">Disc%</th>
                      <th className="p-2 border-r border-slate-600 bg-green-900 w-20 text-center align-middle">Man Hour</th>
                    </>
                  )}

                  {level >= 4 && (
                    <>
                      <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">Stl Disc(USD)</th>
                      <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">To IDR</th>
                      <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">Stl Disc(IDR)</th>
                      <th className="p-2 border-r border-slate-600 bg-slate-700 w-32 text-right align-middle">Price + MH</th>
                      <th className="p-2 border-r border-slate-600 bg-blue-800 w-40 text-right align-middle font-bold text-yellow-300">TOTAL</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredMaterials.length > 0 ? (
                  filteredMaterials.map((mat) => {
                    const calc = calculateRow(mat);
                    return (
                      <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-2 pl-4 border-r bg-slate-100 dark:bg-slate-900 font-medium truncate max-w-[280px] sticky left-0 z-10 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.1)] border-r-slate-300">
                          <HighlightText text={mat.detail || mat.item} highlight={colFilters.detail} />
                        </td>

                        <td className="p-2 border-r"><HighlightText text={mat.brand} highlight={colFilters.brand} /></td>
                        <td className="p-2 border-r"><HighlightText text={mat.series} highlight={colFilters.series} /></td>

                        <td className="p-2 text-center border-r font-bold bg-blue-50/30"><HighlightText text={mat.qty} highlight={colFilters.qty} /></td>
                        <td className="p-2 text-center border-r text-slate-500 bg-blue-50/30"><HighlightText text={mat.unit} highlight={colFilters.unit} /></td>

                        {level >= 2 && (
                          <>
                            <td className="p-2 text-right border-r font-mono bg-blue-50/30">{mat.internationalPrice > 0 ? formatUSD(mat.internationalPrice) : '-'}</td>
                            <td className="p-2 text-right border-r font-mono bg-blue-50/30">{formatRupiah(mat.localPrice)}</td>
                            <td className="p-2 text-center border-r text-xs bg-blue-50/30">{mat.currency}</td>
                          </>
                        )}

                        {level >= 3 && (
                          <>
                            <td className="p-2 text-center border-r bg-green-50/30">{mat.factor}</td>
                            <td className="p-2 text-center border-r bg-green-50/30">{mat.diskon}</td>
                            <td className="p-2 text-center border-r bg-green-50/30">{mat.manHour}</td>
                          </>
                        )}

                        {level >= 4 && (
                          <>
                            <td className="p-2 text-right border-r font-mono bg-slate-50/50">{calc.priceAfterDiscUSD > 0 ? formatUSD(calc.priceAfterDiscUSD) : '-'}</td>
                            <td className="p-2 text-right border-r font-mono bg-slate-50/50">{calc.priceBecomeIDR > 0 ? formatRupiah(calc.priceBecomeIDR) : '-'}</td>
                            <td className="p-2 text-right border-r font-mono bg-slate-50/50">{calc.priceAfterDiscIDR > 0 ? formatRupiah(calc.priceAfterDiscIDR) : '-'}</td>
                            <td className="p-2 text-right border-r font-mono font-medium bg-slate-50/50">{formatRupiah(calc.priceAfterManHour)}</td>
                            <td className="p-2 text-right border-r font-mono font-bold text-blue-700 bg-blue-50/50">{formatRupiah(calc.totalPrice)}</td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={16} className="p-6 text-center italic text-slate-400">No items match.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-2 border-t text-center bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            {level < 4 ? (
              <button onClick={() => changeLevel(item.id, 'NEXT')} className="text-xs font-bold hover:underline text-blue-600">Show Full Detail View (Level {level + 1})</button>
            ) : (
              <span className="text-xs font-medium text-slate-400">All columns visible (Max Level)</span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default DetailPanel;
