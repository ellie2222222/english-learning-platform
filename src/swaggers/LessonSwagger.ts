/**
 * @swagger
 * tags:
 *   - name: Lesson
 *     description: Lesson management endpoints
 */

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     tags: [Lesson]
 *     summary: Create a new lesson
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonCreate'
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *   get:
 *     tags: [Lesson]
 *     summary: Get all lessons
 *     responses:
 *       200:
 *         description: List of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 */

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     tags: [Lesson]
 *     summary: Get lesson by ID
 *     parameters:
 *       - name: lessonId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *   patch:
 *     tags: [Lesson]
 *     summary: Update a lesson
 *     parameters:
 *       - name: lessonId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonUpdate'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *   delete:
 *     tags: [Lesson]
 *     summary: Delete a lesson
 *     parameters:
 *       - name: lessonId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/grammars:
 *   get:
 *     tags: [Lesson]
 *     summary: Get grammars by lesson ID
 *     parameters:
 *       - name: lessonId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grammars for the lesson
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grammar'
 *
 * /api/lessons/{lessonId}/vocabularies:
 *   get:
 *     tags: [Lesson]
 *     summary: Get vocabularies by lesson ID
 *     parameters:
 *       - name: lessonId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vocabularies for the lesson
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vocabulary'
 */

/**
 * @swagger
 * /api/lessons/{id}/exercises/submission:
 *   post:
 *     summary: Submit answers for multiple exercises in a lesson
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the lesson containing the exercises
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - answers
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user submitting the answers
 *                 example: "507f1f77bcf86cd799439011"
 *               answers:
 *                 type: array
 *                 description: Array of answers for exercises
 *                 items:
 *                   type: object
 *                   required:
 *                     - exerciseId
 *                     - selectedAnswers
 *                   properties:
 *                     exerciseId:
 *                       type: string
 *                       description: The ID of the exercise
 *                       example: "507f1f77bcf86cd799439011"
 *                     selectedAnswers:
 *                       type: array
 *                       description: Array of selected answers
 *                       items:
 *                         type: string
 *                       example: ["Paris"]
 *     responses:
 *       200:
 *         description: Exercises submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 submission:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: The ID of the user
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time of submission
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           exerciseId:
 *                             type: string
 *                             description: The ID of the exercise
 *                           selectedAnswers:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: The answers selected by the user
 *                           correctAnswers:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: The correct answers for the exercise
 *                           isCorrect:
 *                             type: boolean
 *                             description: Whether the user's answer is correct
 *                 message:
 *                   type: string
 *                   example: Exercises submitted successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid exercise ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, user does not have access to this resource
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         courseId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LessonCreate:
 *       type: object
 *       required:
 *         - title
 *         - courseId
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         courseId:
 *           type: string
 *     LessonUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *     Grammar:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         lessonId:
 *           type: string
 *         title:
 *           type: string
 *         structure:
 *           type: string
 *         example:
 *           type: string
 *         explanation:
 *           type: string
 *         order:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     GrammarCreate:
 *       type: object
 *       required:
 *         - lessonId
 *         - title
 *         - structure
 *         - order
 *       properties:
 *         lessonId:
 *           type: string
 *         title:
 *           type: string
 *         structure:
 *           type: string
 *         example:
 *           type: string
 *         explanation:
 *           type: string
 *         order:
 *           type: number
 *     GrammarUpdate:
 *       type: object
 *       properties:
 *         lessonId:
 *           type: string
 *         title:
 *           type: string
 *         structure:
 *           type: string
 *         example:
 *           type: string
 *         explanation:
 *           type: string
 *         order:
 *           type: number
 *     Vocabulary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         lessonId:
 *           type: string
 *         englishContent:
 *           type: string
 *         vietnameseContent:
 *           type: string
 *         imageUrl:
 *           type: string
 *         order:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VocabularyCreate:
 *       type: object
 *       required:
 *         - lessonId
 *         - englishContent
 *         - vietnameseContent
 *         - order
 *       properties:
 *         lessonId:
 *           type: string
 *         englishContent:
 *           type: string
 *         vietnameseContent:
 *           type: string
 *         imageUrl:
 *           type: string
 *         order:
 *           type: number
 *     VocabularyUpdate:
 *       type: object
 *       properties:
 *         lessonId:
 *           type: string
 *         englishContent:
 *           type: string
 *         vietnameseContent:
 *           type: string
 *         imageUrl:
 *           type: string
 *         order:
 *           type: number
 */