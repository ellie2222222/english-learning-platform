/**
 * @swagger
 * tags:
 *   - name: Lesson
 *     description: Lesson management endpoints
 */

/**
 * @swagger
 * /lessons:
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
 * /lessons/{lessonId}:
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
 */