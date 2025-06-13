/**
 * @swagger
 * tags:
 *   - name: Course
 *     description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Course]
 *     summary: Create a new course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreate'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *   get:
 *     tags: [Course]
 *     summary: Get all courses
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /api/courses/{courseId}:
 *   get:
 *     tags: [Course]
 *     summary: Get course by ID
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *   patch:
 *     tags: [Course]
 *     summary: Update a course
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdate'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *   delete:
 *     tags: [Course]
 *     summary: Delete a course
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /api/courses/{courseId}/lessons:
 *   get:
 *     tags: [Course]
 *     summary: Get lessons by course ID
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lessons for the course
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         level:
 *           type: string
 *         totalLessons:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CourseCreate:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - level
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         level:
 *           type: string
 *         totalLessons:
 *           type: number
 *     CourseUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         level:
 *           type: string
 *         totalLessons:
 *           type: number
 *     Lesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         # Add more lesson fields as needed
 */