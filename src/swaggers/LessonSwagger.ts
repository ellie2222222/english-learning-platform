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