// Use global fetch
async function testBatchWithImages() {
    try {
        console.log('Logging in as instructor...');
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_instructor@dleo.com', password: 'Instructor@123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.token;

        const quizId = 2; // Quiz created in previous tests

        console.log(`Attempting to batch add questions with images to quiz ${quizId}...`);
        const batchRes = await fetch(`http://localhost:5001/api/quizzes/${quizId}/questions/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questions: [
                    {
                        question_text: 'Identify this component:',
                        option_a: 'CPU',
                        option_b: 'RAM',
                        option_c: 'GPU',
                        option_d: 'Motherboard',
                        correct_option: 'b',
                        image_url: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=400'
                    },
                    {
                        question_text: 'Regular question without image',
                        option_a: '1',
                        option_b: '2',
                        option_c: '3',
                        option_d: '4',
                        correct_option: 'a'
                    }
                ]
            })
        });

        const batchData = await batchRes.json();
        console.log('Status:', batchRes.status);
        console.log('Response:', JSON.stringify(batchData, null, 2));

        if (batchRes.status === 201) {
            console.log('SUCCESS: Batch questions with images added successfully.');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testBatchWithImages();
