const fs = require('fs');
const path = require('path');

async function testFileUpload() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_instructor@dleo.com', password: 'Instructor@123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;

        console.log('Creating dummy image...');
        const dummyPath = path.join(__dirname, 'dummy.png');
        fs.writeFileSync(dummyPath, 'fake-image-content');

        console.log('Uploading file...');
        const formData = new FormData();
        const fileContent = fs.readFileSync(dummyPath);
        const blob = new Blob([fileContent], { type: 'image/png' });
        formData.append('file', blob, 'dummy.png');

        const uploadRes = await fetch('http://localhost:5001/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const uploadData = await uploadRes.json();
        console.log('Status:', uploadRes.status);
        console.log('Response:', JSON.stringify(uploadData, null, 2));

        if (uploadRes.status === 200) {
            const imageUrl = uploadData.data.url;
            console.log('SUCCESS: File uploaded to:', imageUrl);

            console.log('Verifying static serving...');
            const staticRes = await fetch(imageUrl);
            console.log('Static fetch status:', staticRes.status);
            if (staticRes.status === 200) {
                console.log('SUCCESS: Static file is accessible.');
            }
        }

        // Cleanup
        if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testFileUpload();
