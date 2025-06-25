/**
 * @swagger
 * tags:
 *   name: UserLessons
 *   description: User lesson management endpoints for tracking user progress in an e-learning platform
 */

/**
 * @swagger
 * /api/user-lessons:
 *   post:
 *     summary: Create a new user lesson
 *     description: Creates a new user lesson to track a user's progress in a lesson. Only requires userId and lessonId. Only accessible by users with Admin (1) role.
 *     tags: [UserLessons]

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
 *                   example: "User lesson created successfully"
 *       400:
 *         description: Bad request (e.g., invalid userId or lessonId)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
 * /api/user-lessons/{id}:
 *   get:
 *     summary: Get user lesson by ID
 *     description: Retrieves a user lesson by its ID. Accessible by users with Admin (1) or User (0) roles, with ownership validation to ensure the user owns the lesson.
 *     tags: [UserLessons]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user lesson (MongoDB ObjectId)
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
 *                   example: "User lesson retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (user does not own the lesson)
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
 * /api/user-lessons/{id}/lesson:
 *   get:
 *     summary: Get user lesson by lesson ID
 *     description: Retrieves a user lesson by lesson ID for the authenticated user. Accessible by users with Admin (1) or User (0) roles, with course ownership validation to ensure the user is enrolled in the course containing the lesson.
 *     tags: [UserLessons]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the lesson (MongoDB ObjectId)
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
 *                   example: "User lesson retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (user is not enrolled in the course)
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
 * /api/user-lessons/{id}/user:
 *   get:
 *     summary: Get user lessons by user ID
 *     description: Retrieves a list of user lessons for a specific user with pagination and sorting. Accessible by users with Admin (1) role.
 *     tags: [UserLessons]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user (MongoDB ObjectId)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: Number of user lessons per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sorting order
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date]
 *           default: date
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: User lessons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userLessons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserLesson'
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 size:
 *                   type: integer
 *                   example: 10
 *                 message:
 *                   type: string
 *                   example: "User lessons retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request (e.g., invalid user ID or query parameters)
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
 * /api/user-lessons/{id}:
 *   patch:
 *     summary: Update user lesson status
 *     description: Updates the status of a user lesson (e.g., from 'ongoing' to 'completed'). Accessible by users with Admin (1) or User (0) roles, with ownership validation to ensure the user owns the lesson.
 *     tags: [UserLessons]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user lesson (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLessonUpdate'
 *     responses:
 *       200:
 *         description: User lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userLesson:
 *                   $ref: '#/components/schemas/UserLesson'
 *                 message:
 *                   type: string
 *                   example: "User lesson updated successfully"
 *       400:
 *         description: Bad request (e.g., invalid status)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (user does not own the lesson)
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
 * components:
 *   schemas:
 *     UserLesson:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "12345"
 *           description: The ID of the user lesson (MongoDB ObjectId)
 *         userId:
 *           type: string
 *           example: "67890"
 *           description: The ID of the user (MongoDB ObjectId)
 *         lessonId:
 *           type: string
 *           example: "54321"
 *           description: The ID of the lesson (MongoDB ObjectId)
 *         currentOrder:
 *           type: number
 *           example: 0
 *           description: The order of the lesson for the user (defaults to 0)
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *           example: "ongoing"
 *           description: The status of the user lesson (defaults to "ongoing")
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-18T09:03:00Z"
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-18T09:03:00Z"
 *           description: Last update timestamp
 *     UserLessonCreate:
 *       type: object
 *       required:
 *         - userId
 *         - lessonId
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user (must be a valid MongoDB ObjectId)
 *           example: "67890"
 *         lessonId:
 *           type: string
 *           description: The ID of the lesson (must be a valid MongoDB ObjectId)
 *           example: "54321"
 *     UserLessonUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *           description: The updated status of the user lesson
 *           example: "completed"
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: "Invalid request data"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
