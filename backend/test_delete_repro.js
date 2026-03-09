const fetch = require('node-fetch');

async function testDelete() {
    const BASE_URL = 'http://localhost:5001/api';

    // 1. Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dharshinis415@gmail.com', password: 'Admin@123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    // 2. Try delete question 8
    console.log('Testing DELETE /api/quizzes/questions/8');
    const delRes = await fetch(`${BASE_URL}/quizzes/questions/8`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    console.log('Status:', delRes.status);
    const delData = await delRes.json();
    console.log('Response:', JSON.stringify(delData, null, 2));
}

testDelete();
