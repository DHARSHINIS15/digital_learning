// Use global fetch
async function testBatchAddQuestions() {
    try {
        // 1. Login as instructor
        console.log('Logging in as instructor...');
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_instructor@dleo.com', password: 'Instructor@123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('Login failed.');
            return;
        }

        const token = loginData.data.token;
        console.log('Login successful.');

        // 2. Find a quiz
        console.log('Fetching quizzes...');
        // Assume course ID 1 or find one. Let's use the one from previous tests or hardcode a known ID.
        // We can just try to add to quiz ID 1 if it exists.
        const quizId = 2;

        // 3. Attempt to batch add questions
        console.log(`Attempting to batch add questions to quiz ${quizId}...`);
        const batchRes = await fetch(`http://localhost:5001/api/quizzes/${quizId}/questions/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                questions: [
                    {
                        question_text: 'What is 1 + 1?',
                        option_a: '1',
                        option_b: '2',
                        option_c: '3',
                        option_d: '4',
                        correct_option: 'b'
                    },
                    {
                        question_text: 'What is the capital of France?',
                        option_a: 'Berlin',
                        option_b: 'Madrid',
                        option_c: 'Paris',
                        option_d: 'Rome',
                        correct_option: 'c'
                    }
                ]
            })
        });

        const batchData = await batchRes.json();
        console.log('Status:', batchRes.status);
        console.log('Response:', JSON.stringify(batchData, null, 2));

        if (batchRes.status === 201) {
            console.log('SUCCESS: Batch questions added successfully.');
        } else {
            console.log('FAILURE: Failed to add batch questions.');
        }

    } catch (err) {
        console.error('Error during test:', err.message);
    }
}

testBatchAddQuestions();
