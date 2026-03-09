// Use global fetch

async function testRestriction() {
    try {
        // 1. Login as instructor
        console.log('Logging in as instructor...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_instructor@dleo.com', password: 'Instructor@123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('Instructor login failed. Please ensure instructor@dleo.com / Instructor@123 exists.');
            return;
        }

        const token = loginData.data.token;
        console.log('Instructor login successful.');

        // 2. Attempt to create a course
        console.log('Attempting to create a course as instructor...');
        const createRes = await fetch('http://localhost:5000/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Forbidden Course',
                description: 'This should not be allowed'
            })
        });

        const createData = await createRes.json();
        console.log('Status:', createRes.status);
        console.log('Response:', JSON.stringify(createData, null, 2));

        if (createRes.status === 403) {
            console.log('SUCCESS: Course creation restricted for instructors.');
        } else if (createRes.status === 201) {
            console.error('FAILURE: Course was created despite restriction!');
        } else {
            console.log('Received status:', createRes.status);
        }

    } catch (err) {
        console.error('Error during test:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.error('Backend server is not running on port 5000.');
        }
    }
}

testRestriction();
