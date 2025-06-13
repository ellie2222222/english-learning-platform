/**
 * @swagger
 * tags:
 *   - name: UserTest
 *     description: User test management endpoints
 */

/**
 * @swagger
 * /api/users/tests:
 *   post:
 *     tags: [UserTest]
 *     summary: Create a new user test
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
 *                   example: User test created successfully
 *       400:
 *         description: Bad request (e.g., invalid ID, missing fields, invalid data)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (missing or invalid token)
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
 * /api/users/tests/{userTestId}:
 *   get:
 *     tags: [UserTest]
 *     summary: Get user test by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userTestId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
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
 *       400:
 *         description: Bad request (e.g., invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (missing or invalid token)
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
 * /api/users/{userId}/tests:
 *   get:
 *     tags: [UserTest]
 *     summary: Get user tests by user ID
 *     security:
 *       - bearerAuth: []
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
 *         description: User tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserTest'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: User tests retrieved successfully
 *       400:
 *         description: Bad request (e.g., invalid ID, invalid query parameters)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (missing or invalid token)
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
 * /api/users/tests/{userTestId}:
 *   get:
 *     tags: [UserTest]
 *     summary: Get user tests by test ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userTestId
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
 *         description: User tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserTest'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: User tests retrieved successfully
 *       400:
 *         description: Bad request (e.g., invalid ID, invalid query parameters)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (missing or invalid token)
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
 *         _id:
 *           type: string
 *         userTestId:
 *           type: string
 *         userId:
 *           type: string
 *         attemptNo:
 *           type: number
 *         score:
 *           type: number
 *         status:
 *           type: string
 *           enum: [passed, failed]
 *         description:
 *           type: string
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
 *         test:
 *           $ref: '#/components/schemas/Test'
 *     UserTestCreate:
 *       type: object
 *       required:
 *         - userTestId
 *         - userId
 *         - attemptNo
 *         - score
 *         - status
 *       properties:
 *         userTestId:
 *           type: string
 *           description: The ID of the test (must be a valid MongoDB ObjectId)
 *         userId:
 *           type: string
 *           description: The ID of the user (must be a valid MongoDB ObjectId)
 *         attemptNo:
 *           type: number
 *           minimum: 1
 *           description: The attempt number for the test
 *         score:
 *           type: number
 *           minimum: 0
 *           description: The score achieved in the test
 *         status:
 *           type: string
 *           enum: [passed, failed]
 *           description: The status of the user test
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: Additional description of the test attempt (max 2000 characters)
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */