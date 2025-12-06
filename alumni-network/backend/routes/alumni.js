const express = require('express');
const router = express.Router();
const Alumni = require('../models/Alumni');

// GET /api/alumni?bbox=west,south,east,north
router.get('/', async (req,res) => {
  const bbox = req.query.bbox;
  const filter = { 'consent_record.opt_in': true };
  if (bbox) {
    const [west,south,east,north] = bbox.split(',').map(Number);
    filter.location = { $geoWithin: { $geometry: { type:'Polygon', coordinates:[[[west,south],[east,south],[east,north],[west,north],[west,south]]] } } };
  }
  const docs = await Alumni.find(filter).limit(200).lean();
  const response = docs.map(d => ({
    id: d._id, name: d.name, graduation_year: d.graduation_year,
    company: d.company, role: d.role,
    location_visibility: d.location_visibility,
    display_point: d.displayPoint ? { lat: d.displayPoint.coordinates[1], lng: d.displayPoint.coordinates[0] } : null,
    city: d.city, state: d.state
  }));
  res.json(response);
});

router.post('/', async (req,res) => {
  // upsert simplified: create new
  try {
    const body = req.body;
    const loc = body.location ? { type:'Point', coordinates: [body.location.lng, body.location.lat] } : undefined;
    const dp = body.displayPoint ? { type:'Point', coordinates: [body.displayPoint.lng, body.displayPoint.lat] } : undefined;
    const doc = await Alumni.create({ ...body, location: loc, displayPoint: dp, consent_record: body.consent_record || { opt_in: true, timestamp: new Date() } });
    res.json({ ok:true, id: doc._id });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/connect', (req,res) => {
  console.log('connect request', req.body);
  res.json({ ok:true, message: 'Request logged (simulate notify)' });
});

module.exports = router;
