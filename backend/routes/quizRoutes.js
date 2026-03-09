const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.delete('/questions/:id', roleCheck('admin', 'instructor'), quizController.deleteQuestion);

router.get('/my-attempts', quizController.getMyAttempts);
router.get('/recommendations', quizController.getRecommendations);
router.get('/course/:courseId', quizController.getQuizzesByCourse);
router.get('/:id', quizController.getQuizWithQuestions);
router.post('/:id/submit', roleCheck('student'), quizController.submitAttempt);
router.get('/:id/questions', quizController.getQuizQuestions);
router.post('/:id/questions', roleCheck('admin', 'instructor'), quizController.addQuestion);
router.post('/:id/questions/batch', roleCheck('admin', 'instructor'), quizController.addBatchQuestions);
router.post('/', roleCheck('admin', 'instructor'), quizController.createQuiz);

module.exports = router;
