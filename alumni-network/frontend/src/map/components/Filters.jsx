import React, { useMemo } from 'react';

export default function Filters({ alumni, filters, setFilters }) {
  const companies = useMemo(() => {
    const set = new Set(alumni.map(a => a.company).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [alumni]);
  const batches = useMemo(() => {
    const set = new Set(alumni.map(a => a.graduation_year).filter(Boolean));
    return ['All', ...Array.from(set).sort((x,y)=> x-y)];
  }, [alumni]);

  return (
    <div className="map-filters">
      <label>
        Company
        <select value={filters.company} onChange={(e)=>setFilters(f => ({...f, company: e.target.value}))}>
          {companies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label>
        Batch
        <select value={filters.batch} onChange={(e)=>setFilters(f => ({...f, batch: e.target.value}))}>
          {batches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
    </div>
  );
}
// export default Filters;
//