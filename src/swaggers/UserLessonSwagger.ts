/**
 * @swagger
 * tags:
 *   - name: UserLesson
 *     description: User lesson management endpoints
 */

/**
 * @swagger
 * /api/users/lessons:
 *   post:
 *     tags: [UserLesson]
 *     summary: Create a new user lesson
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLessonCreate'
 *     responses:
 *       201:
 *         description: User lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userLesson:
 *                   $ref: '#/components/schemas/UserLesson'
 *                 message:
 *                   type: string
 *                   example: User lesson created successfully
 *       400:
 *         description: Bad request (e.g., invalid ID, missing fields, invalid status)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/lessons/{userLessonId}:
 *   get:
 *     tags: [UserLesson]
 *     summary: Get user lesson by ID
 *     parameters:
 *       - name: userLessonId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User lesson retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userLesson:
 *                   $ref: '#/components/schemas/UserLesson'
 *                 message:
 *                   type: string
 *                   example: User lesson retrieved successfully
 *       400:
 *         description: Bad request (e.g., invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/{userId}/lessons:
 *   get:
 *     tags: [UserLesson]
 *     summary: Get user lessons by user ID
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DATE, NAME]
 *           default: DATE
 *     responses:
 *       200:
 *         description: User lessons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserLesson'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: User lessons retrieved successfully
 *       400:
 *         description: Bad request (e.g., invalid ID, invalid query parameters)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         lessonId:
 *           type: string
 *         currentOrder:
 *           type: number
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             role:
 *               type: number
 *             avatar:
 *               type: string
 *             googleId:
 *               type: string
 *             email:
 *               type: string
 *             lastOnline:
 *               type: string
 *               format: date-time
 *             onlineStreak:
 *               type: number
 *             activeUntil:
 *               type: string
 *               format: date-time
 *               nullable: true
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *         lesson:
 *           $ref: '#/components/schemas/Lesson'
 *     UserLessonCreate:
 *       type: object
 *       required:
 *         - userId
 *         - lessonId
 *         - currentOrder
 *         - status
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user (must be a valid MongoDB ObjectId)
 *         lessonId:
 *           type: string
 *           description: The ID of the lesson (must be a valid MongoDB ObjectId)
 *         currentOrder:
 *           type: number
 *           minimum: 0
 *           description: The current order of the lesson for the user
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *           description: The status of the user lesson
 *     UserLessonUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *           description: The updated status of the user lesson
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 */
