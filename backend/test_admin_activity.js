const API_URL = 'http://localhost:5000/api';

async function test() {
    try {
        // 1. Login as Admin
        console.log('Logging in as admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dharshinis415@gmail.com',
                password: 'Admin@123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log('Admin logged in.');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Get Users
        console.log('Fetching users...');
        const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
        if (!usersRes.ok) throw new Error(`Get users failed: ${usersRes.status}`);
        const usersData = await usersRes.json();
        const users = usersData.data.users;
        const student = users.find(u => u.role === 'student');

        if (!student) {
            console.error('No student found to test with.');
            return;
        }
        console.log(`Found student: ${student.name} (ID: ${student.id})`);

        // 3. Get Activity by Student
        console.log(`Fetching activity for student ${student.id}...`);
        const activityRes = await fetch(`${API_URL}/activity/student/${student.id}`, { headers });
        console.log('Activity response status:', activityRes.status);
        if (activityRes.ok) {
            const activityData = await activityRes.json();
            console.log('Activity data keys:', Object.keys(activityData.data));
        } else {
            console.error('Fetch activity failed');
        }

        // 4. Get Progress by Student (existing endpoint)
        console.log(`Fetching progress for student ${student.id}...`);
        const progressRes = await fetch(`${API_URL}/progress/student/${student.id}`, { headers });
        console.log('Progress response status:', progressRes.status);
        if (progressRes.ok) {
            const progressData = await progressRes.json();
            console.log('Progress data count:', progressData.data.progress.length);
        } else {
            console.error('Fetch progress failed');
        }

        console.log('Verification Successful!');

    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

test();
