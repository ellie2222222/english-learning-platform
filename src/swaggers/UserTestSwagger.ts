/**
 * @swagger
 * tags:
 *   name: UserTests
 *   description: User test management endpoints for tracking user test progress in an e-learning platform
 */

/**
 * @swagger
 * /api/user-tests:
 *   post:
 *     summary: Create a new user test
 *     description: Creates a new user test to track a user's test attempt, including score and status. Only accessible by users with Admin (1) role.
 *     tags: [UserTests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserTestCreate'
 *     responses:
 *       201:
 *         description: User test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userTest:
 *                   $ref: '#/components/schemas/UserTest'
 *                 message:
 *                   type: string
 *                   example: "User test created successfully"
 *       400:
 *         description: Bad request (e.g., invalid testId, userId, attemptNo, score, or status)
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
 * /api/user-tests/{id}:
 *   get:
 *     summary: Get user test by ID
 *     description: Retrieves a user test by its ID. Accessible by users with Admin (1) or User (0) roles, with ownership validation to ensure the user owns the test.
 *     tags: [UserTests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user test (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User test retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userTest:
 *                   $ref: '#/components/schemas/UserTest'
 *                 message:
 *                   type: string
 *                   example: "User test retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (user does not own the test)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User test not found
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
 * /api/user-tests/{id}/user:
 *   get:
 *     summary: Get user tests by user ID
 *     description: Retrieves a list of user tests for a specific user with pagination and sorting. Accessible by users with Admin (1) or User (0) roles, with lesson ownership validation to ensure the user is associated with the lesson containing the test.
 *     tags: [UserTests]
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
 *         description: Number of user tests per page
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
 *         description: User tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userTests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserTest'
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
 *                   example: "User tests retrieved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (user is not associated with the lesson)
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
 * /api/user-tests/{id}/test:
 *   get:
 *     summary: Get user test by test ID
 *     description: Retrieves a user test by testId for the authenticated user. Accessible by users with Admin (1) or User (0) roles. Returns the user's test attempt for the specified test.
 *     tags: [UserTests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the test (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User test retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userTest:
 *                   $ref: '#/components/schemas/UserTest'
 *                 message:
 *                   type: string
 *                   example: User test retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (user is not associated with the test)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User test not found
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
 *     UserTest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "12345"
 *           description: The ID of the user test (MongoDB ObjectId)
 *         testId:
 *           type: string
 *           example: "54321"
 *           description: The ID of the test (MongoDB ObjectId)
 *         userId:
 *           type: string
 *           example: "67890"
 *           description: The ID of the user (MongoDB ObjectId)
 *         attemptNo:
 *           type: number
 *           example: 1
 *           description: The attempt number for the test
 *         score:
 *           type: number
 *           example: 85
 *           description: The score achieved by the user
 *         status:
 *           type: string
 *           enum: [passed, failed]
 *           example: "passed"
 *           description: The status of the user test
 *         description:
 *           type: string
 *           example: "Completed test with good performance"
 *           description: Additional details about the test attempt
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
 *     UserTestCreate:
 *       type: object
 *       required:
 *         - testId
 *         - userId
 *         - attemptNo
 *         - score
 *         - status
 *       properties:
 *         testId:
 *           type: string
 *           description: The ID of the test (must be a valid MongoDB ObjectId)
 *           example: "54321"
 *         userId:
 *           type: string
 *           description: The ID of the user (must be a valid MongoDB ObjectId)
 *           example: "67890"
 *         attemptNo:
 *           type: number
 *           minimum: 1
 *           description: The attempt number for the test
 *           example: 1
 *         score:
 *           type: number
 *           minimum: 0
 *           description: The score achieved by the user
 *           example: 85
 *         status:
 *           type: string
 *           enum: [passed, failed]
 *           description: The status of the user test
 *           example: "passed"
 *         description:
 *           type: string
 *           description: Additional details about the test attempt
 *           example: "Completed test with good performance"
 *           nullable: true
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
