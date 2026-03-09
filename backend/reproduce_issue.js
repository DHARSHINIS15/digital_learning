
const fetch = require('node-fetch');

async function reproduce() {
    try {
        const PORT = 5001;
        const BASE_URL = `http://localhost:${PORT}`;

        console.log(`Targeting server at ${BASE_URL}`);

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'dharshinis415@gmail.com', password: 'Admin@123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }
        const token = loginData.data.token;
        console.log('Login successful.');

        // 2. Create course
        console.log('Creating debug course...');
        const createCourseRes = await fetch(`${BASE_URL}/api/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Debug Course ' + Date.now(),
                description: 'For debugging',
                category: 'Development',
                level: 'Beginner',
                price: 0
            })
        });
        const createCourseData = await createCourseRes.json();
        const courseId = createCourseData.data.course.id;
        console.log(`Created course ID: ${courseId}`);

        // 3. Create lesson (Simulating the failure)
        console.log('Attempting to create lesson...');
        const payload = {
            title: "Environment Setup",
            duration_minutes: 10,
            image_url: "",
            contents: [
                {
                    title: "Installing the JDK and Eclipse",
                    content_type: "video",
                    content_url: "https://www.youtube.com/watch?v=i3uK--LXQU8"
                }
            ]
        };

        const lessonRes = await fetch(`${BASE_URL}/api/courses/${courseId}/lessons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        console.log(`Lesson Create Status: ${lessonRes.status}`);
        const lessonData = await lessonRes.json();
        console.log('Response:', JSON.stringify(lessonData, null, 2));

    } catch (err) {
        console.error('Reproduction error:', err);
    }
}

reproduce();
