const API_URL = 'http://localhost:5000/api';

async function test() {
    try {
        // 1. Login as Student
        console.log('Logging in as student...');
        // I need a valid student email. From seed or previous logs?
        // In test_admin_activity.js output, it found "DHARSHINI S (ID: ...)"
        // I can try to find a student user first as Admin, then login as them (if I knew password).
        // Or just use the hardcoded student from previous `test_api.js` if it exists?
        // `test_api.js` had `dharshinis415@gmail.com` but no student.
        // Let's use Admin to find a student email, and guess password or use a known one.
        // Assuming 'student@example.com' / 'student' or similar from seed.
        // Let's try to register a new student to be sure.

        const timestamp = Date.now();
        const email = `teststudent${timestamp}@example.com`;
        const password = 'password123';

        console.log(`Registering new student: ${email}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Student',
                email,
                password,
                role: 'student'
            })
        });

        if (!regRes.ok) throw new Error(`Registration failed: ${regRes.status}`);
        const regData = await regRes.json();
        const token = regData.data.token;
        const studentId = regData.data.user.id;
        console.log(`Student registered. ID: ${studentId}`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test Analytics (Dashboard)
        console.log(`Testing Analytics (Dashboard) for student ${studentId}...`);
        const analyticsRes = await fetch(`${API_URL}/analytics/student/${studentId}`, { headers });
        console.log('Analytics status:', analyticsRes.status);
        if (analyticsRes.ok) {
            console.log('Analytics data OK');
        } else {
            const err = await analyticsRes.json();
            console.error('Analytics failed:', err.message);
        }

        // 3. Test Activity (Heatmap - My Activity)
        console.log('Testing My Activity...');
        const activityRes = await fetch(`${API_URL}/activity/me`, { headers });
        console.log('Activity status:', activityRes.status);
        if (activityRes.ok) {
            console.log('Activity data OK');
        } else {
            const err = await activityRes.json();
            console.error('Activity failed:', err.message);
        }

        // 4. Test Restricted Activity Endpoint (Should Fail)
        console.log(`Testing Restricted Activity Endpoint (/api/activity/student/${studentId})...`);
        const restrictedRes = await fetch(`${API_URL}/activity/student/${studentId}`, { headers });
        console.log('Restricted status:', restrictedRes.status);
        if (restrictedRes.status === 403) {
            console.log('Correctly forbidden (403)');
        } else {
            console.warn('Unexpected status for restricted endpoint:', restrictedRes.status);
        }

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

test();
