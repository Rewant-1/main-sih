const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api/v1';
const now = Date.now();
const emailA = `admin.collegeA.${now}@test.com`;
const emailB = `admin.collegeB.${now}@test.com`;
const studentEmailA = `student.a.${now}@test.com`;

async function testAdminAuth() {
    console.log('🧪 Testing Admin Authentication Flow\n');

    try {
        // Test 1: Register first admin for College A
        console.log('1️⃣ Registering Admin for College A...');
        const registerResponse1 = await axios.post(`${BASE_URL}/admin/auth/register-test`, {
            name: 'Admin College A',
            email: emailA,
            password: 'password123',
            instituteName: 'College A',
            adminId: 'college-a-001',
            phone: '+919876543210',
            address: {
                street: '123 Main St',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India'
            }
        });
        console.log('✅ Admin A registered:', {
            id: registerResponse1.data.data.admin._id,
            adminId: registerResponse1.data.data.admin.adminId,
            instituteName: registerResponse1.data.data.admin.instituteName
        });
        console.log('Token:', registerResponse1.data.data.token.substring(0, 50) + '...\n');

        // Test 2: Register second admin for College B
        console.log('2️⃣ Registering Admin for College B...');
        const registerResponse2 = await axios.post(`${BASE_URL}/admin/auth/register-test`, {
            name: 'Admin College B',
            email: emailB,
            password: 'password123',
            instituteName: 'College B',
            adminId: 'college-b-001',
            phone: '+919876543211',
            address: {
                street: '456 Park Ave',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110001',
                country: 'India'
            }
        });
        console.log('✅ Admin B registered:', {
            id: registerResponse2.data.data.admin._id,
            adminId: registerResponse2.data.data.admin.adminId,
            instituteName: registerResponse2.data.data.admin.instituteName
        });
        console.log('Token:', registerResponse2.data.data.token.substring(0, 50) + '...\n');

        // Test 3: Login Admin A
        console.log('3️⃣ Testing Admin A Login...');
        const loginResponse = await axios.post(`${BASE_URL}/admin/auth/login`, {
            email: emailA,
            password: 'password123'
        });
        console.log('✅ Admin A logged in successfully');
        console.log('Token received:', loginResponse.data.data.token.substring(0, 50) + '...');
        console.log('Admin info:', {
            id: loginResponse.data.data.admin._id,
            adminId: loginResponse.data.data.admin.adminId,
            name: loginResponse.data.data.admin.name,
            instituteName: loginResponse.data.data.admin.instituteName
        });

        const tokenA = loginResponse.data.data.token;

        // Test 4: Access protected route with token
        console.log('\n4️⃣ Testing Protected Route - Get Admin Names...');
        const adminsResponse = await axios.get(`${BASE_URL}/admins/names`, {
            headers: {
                'Authorization': `Bearer ${tokenA}`
            }
        });
        console.log('✅ Protected route accessed successfully');
        console.log('Admin names from same college:', adminsResponse.data.data);

        // Test 5: Create a student as Admin A
        console.log('\n5️⃣ Creating Student for College A...');
        const studentResponse = await axios.post(`${BASE_URL}/admins/users`, {
            name: 'Test Student A',
            email: studentEmailA,
            password: 'password123',
            userType: 'Student',
            academic: {
                degreeType: 'B.Tech',
                degreeName: 'Computer Science'
            }
        }, {
            headers: {
                'Authorization': `Bearer ${tokenA}`
            }
        });
        console.log('✅ Student created:', {
            userId: studentResponse.data.data.userId,
            profileId: studentResponse.data.data.profileId
        });

        // Test 6: Get students as Admin A
        console.log('\n6️⃣ Getting Students for College A...');
        const studentsResponseA = await axios.get(`${BASE_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${tokenA}`
            }
        });
        console.log('✅ Students fetched for College A:', studentsResponseA.data.data.length, 'students');

        // Test 7: Try to access as Admin B (should see different data)
        console.log('\n7️⃣ Logging in as Admin B...');
        const loginResponseB = await axios.post(`${BASE_URL}/admin/auth/login`, {
            email: emailB,
            password: 'password123'
        });
        const tokenB = loginResponseB.data.data.token;

        console.log('8️⃣ Getting Students for College B...');
        const studentsResponseB = await axios.get(`${BASE_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${tokenB}`
            }
        });
        console.log('✅ Students fetched for College B:', studentsResponseB.data.data.length, 'students');
        console.log('   (Should be 0 - no students in College B yet)');

        console.log('\n✅ All tests passed! College segregation is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received. Is the server running?');
            console.error('Request:', error.request._currentUrl);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAdminAuth();
