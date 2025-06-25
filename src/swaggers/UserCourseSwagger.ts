/**
 * @swagger
 * tags:
 *   name: UserCourses
 *   description: User course management endpoints for tracking user progress in an e-learning platform
 */

/**
 * @swagger
 * /api/user-courses:
 *   post:
 *     summary: Create a new user course
 *     description: Creates a new user course to track a user's enrollment and progress in a course. Accessible by users with Admin (1) or User (0) roles.
 *     tags: [UserCourses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCourseCreate'
 *     responses:
 *       201:
 *         description: User course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCourse:
 *                   $ref: '#/components/schemas/UserCourse'
 *                 message:
 *                   type: string
 *                   example: "User course created successfully"
 *       400:
 *         description: Bad request (e.g., invalid userId, courseId, or status)
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
 * /api/user-courses/{id}:
 *   get:
 *     summary: Get user course by ID
 *     description: Retrieves a user course by its ID. Accessible by users with Admin (1) or User (0) roles, with ownership validation to ensure the user is enrolled in the course.
 *     tags: [UserCourses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user course (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCourse:
 *                   $ref: '#/components/schemas/UserCourse'
 *                 message:
 *                   type: string
 *                   example: "User course retrieved successfully"
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
 *         description: User course not found
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
 * /api/user-courses/{id}/user:
 *   get:
 *     summary: Get user courses by user ID
 *     description: Retrieves a list of user courses for a specific user with pagination and sorting. Accessible by users with Admin (1) or User (0) roles.
 *     tags: [UserCourses]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of user courses per page
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
 *         description: User courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCourses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCourse'
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
 *                   example: "User courses retrieved successfully"
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
 * /api/user-courses/{id}/course:
 *   get:
 *     summary: Get user course by course ID
 *     description: Retrieves a user course by courseId for the authenticated user. Accessible by users with Admin (1) or User (0) roles. Returns the user's progress in the specified course.
 *     tags: [UserCourses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the course (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCourse:
 *                   $ref: '#/components/schemas/UserCourse'
 *                 message:
 *                   type: string
 *                   example: User course retrieved successfully
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
 *         description: User course not found
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
 *     UserCourse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "12345"
 *           description: The ID of the user course (MongoDB ObjectId)
 *         userId:
 *           type: string
 *           example: "67890"
 *           description: The ID of the user (MongoDB ObjectId)
 *         courseId:
 *           type: string
 *           example: "54321"
 *           description: The ID of the course (MongoDB ObjectId)
 *         currentOrder:
 *           type: number
 *           example: 1
 *           description: The current order of the course for the user
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *           example: "ongoing"
 *           description: The status of the user course
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
 *     UserCourseCreate:
 *       type: object
 *       required:
 *         - userId
 *         - courseId
 *         - currentOrder
 *         - status
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user (must be a valid MongoDB ObjectId)
 *           example: "67890"
 *         courseId:
 *           type: string
 *           description: The ID of the course (must be a valid MongoDB ObjectId)
 *           example: "54321"
 *         currentOrder:
 *           type: number
 *           minimum: 0
 *           description: The current order of the course for the user
 *           example: 1
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *           description: The status of the user course
 *           example: "ongoing"
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
 * */
