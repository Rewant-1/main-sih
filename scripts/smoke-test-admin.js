#!/usr/bin/env node
// Smoke test script to validate admin endpoints
const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5001/api/v1';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'test-key';

async function run() {
  try {
    console.log('Using API URL:', API);

    // 1. Register admin using internal API key
    const adminRegisterData = {
      name: 'Smoke Test Admin',
      email: 'smoke-admin@example.com',
      password: 'Password123!',
      adminType: 'college',
      address: { street: '1 Test Ave', city: 'Test City', state: 'TS' },
      phone: '+911234567890',
      bio: 'Automation test admin',
    };

    const regRes = await axios.post(`${API}/auth/register/admin`, adminRegisterData, {
      headers: { 'x-internal-api-key': INTERNAL_API_KEY },
    });
    console.log('Admin register response:', regRes.data);

    // 2. Login admin
    const loginRes = await axios.post(`${API}/auth/admin/login`, {
      email: adminRegisterData.email,
      password: adminRegisterData.password,
    });
    console.log('Admin login response:', loginRes.data);
    const token = loginRes.data.data.token;

    // 3. Get admin names
    const namesRes = await axios.get(`${API}/admins/names`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Admin names:', namesRes.data);

    // 4. Register alumni
    const alumniRegisterData = {
      name: 'Smoke Test Alumni',
      email: `smoke-alumni-${Date.now()}@example.com`,
      password: 'Pass12345!',
      graduationYear: 2020,
      degreeUrl: 'https://example.com/degree.pdf'
    };
    const alumniReg = await axios.post(`${API}/auth/register/alumni`, alumniRegisterData);
    console.log('Alumni register response:', alumniReg.data);

    // In this app, the registerAlumni returns no data for alumni id; search the DB is required.
    // For this smoke test, fetch alumni list and pick the most recent one.
    const alumniList = await axios.get(`${API}/alumni`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Alumni list length:', alumniList.data.data.length || 0);
    const createdAlumni = alumniList.data.data?.find(a => a.email === alumniRegisterData.email);
    if (!createdAlumni) {
      console.warn('Could not find created alumni in list; skipping verify step.');
      return;
    }

    // 5. Verify alumni using admin token (should now be accepted)
    const verifyRes = await axios.post(`${API}/auth/verify/${createdAlumni._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Verify response:', verifyRes.data);

    console.log('Smoke test completed successfully!');
  } catch (err) {
    if (err.response) {
      console.error('API error', err.response.status, err.response.data);
    } else {
      console.error('Unknown error', err.message);
    }
    process.exit(1);
  }
}

run();
