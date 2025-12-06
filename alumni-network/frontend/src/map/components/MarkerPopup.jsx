import React from 'react';

export default function MarkerPopup({ alumni }) {
  const { name, graduation_year, company, role, city, state, company_logo } = alumni;
  return (
    <div style={{ minWidth: 220 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: '#eee' }}>
          {company_logo ? <img src={company_logo} alt={`${company} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', paddingTop: 10 }}>{company ? company[0] : 'A'}</div>}
        </div>
        <div>
          <strong>{name}</strong>
          <div style={{ fontSize: 13 }}>{role} @ {company}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Batch: {graduation_year}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{city}, {state}</div>
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={() => alert('Connect request — integrate /api/alumni/connect')}>Request Connect</button>
        <a className="btn btn-ghost" href={`/alumni/${alumni.id}`} target="_blank" rel="noreferrer">View Profile</a>
      </div>
    </div>
  );
}
