/**
 * Script to create a test admin credential for verification.
 * Usage: node scripts/create-test-admin.js
 */
const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5001/api/v1';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'SomeRandomStringForInternalAPIKey12345';

async function createTestAdmin() {
    const adminData = {
        name: 'Test Admin',
        email: 'testadmin@sarthak.edu',
        password: 'TestAdmin123!',
        adminType: 'college',
        address: { street: '123 Test St', city: 'Delhi', state: 'Delhi' },
        phone: '+911234567890',
        bio: 'Test admin account for testing authentication flow',
    };

    console.log('Creating test admin...');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('API URL:', API);
    console.log('');

    try {
        const res = await axios.post(`${API}/auth/register/admin`, adminData, {
            headers: { 'x-internal-api-key': INTERNAL_API_KEY },
        });
        console.log('✅ Admin created successfully!');
        console.log('Response:', res.data);
    } catch (err) {
        if (err.response?.data?.error?.includes('already exists')) {
            console.log('ℹ️  Admin already exists with this email - ready to test!');
            console.log('\nYou can log in with:');
            console.log('  Email:', adminData.email);
            console.log('  Password:', adminData.password);
        } else {
            console.error('❌ Error creating admin:', err.response?.data || err.message);
            process.exit(1);
        }
    }
}

createTestAdmin();
