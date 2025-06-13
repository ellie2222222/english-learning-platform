/**
 * @swagger
 * tags:
 *   - name: Test
 *     description: Test management endpoints
 */

/**
 * @swagger
 * /api/tests:
 *   post:
 *     tags: [Test]
 *     summary: Create a new test
 *     security:
 *       - bearerAuth: []
 *     description: Requires ADMIN role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestCreate'
 *     responses:
 *       201:
 *         description: Test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *                 message:
 *                   type: string
 *                   example: Test created successfully
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
 *       403:
 *         description: Forbidden (requires ADMIN role)
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
 * /api/tests/{testId}:
 *   patch:
 *     tags: [Test]
 *     summary: Update a test
 *     security:
 *       - bearerAuth: []
 *     description: Requires ADMIN role
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestUpdate'
 *     responses:
 *       200:
 *         description: Test updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *                 message:
 *                   type: string
 *                   example: Test updated successfully
 *       400:
 *         description: Bad request (e.g., invalid ID, invalid data)
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
 *       403:
 *         description: Forbidden (requires ADMIN role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Test not found
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
 * /api/tests/{testId}:
 *   delete:
 *     tags: [Test]
 *     summary: Delete a test
 *     security:
 *       - bearerAuth: []
 *     description: Requires ADMIN role
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *                 message:
 *                   type: string
 *                   example: Test deleted successfully
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
 *       403:
 *         description: Forbidden (requires ADMIN role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Test not found
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
 * /api/tests/{testId}:
 *   get:
 *     tags: [Test]
 *     summary: Get test by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: testId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test:
 *                   $ref: '#/components/schemas/Test'
 *                 message:
 *                   type: string
 *                   example: Test retrieved successfully
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
 *         description: Test not found
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
 * /api/tests:
 *   get:
 *     tags: [Test]
 *     summary: Get all tests
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Test'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: Tests retrieved successfully
 *       400:
 *         description: Bad request (e.g., invalid query parameters)
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
 * /api/tests/lesson/{lessonId}:
 *   get:
 *     tags: [Test]
 *     summary: Get tests by lesson ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: lessonId
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
 *         description: Tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Test'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: Tests retrieved successfully
 *       400:
 *         description: Bad request (e.g., invalid lesson ID, invalid query parameters)
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
 *     Test:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         lessonIds:
 *           type: array
 *           items:
 *             type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         totalQuestions:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *     TestCreate:
 *       type: object
 *       required:
 *         - courseId
 *         - name
 *         - length
 *         - lessonIds
 *         - totalQuestions
 *       properties:
 *         courseId:
 *           type: string
 *           description: The ID of the course (must be a valid MongoDB ObjectId)
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: The name of the test (max 100 characters)
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: The description of the test (max 2000 characters)
 *         length:
 *           type: number
 *           minimum: 1
 *           description: The duration of the test in minutes
 *         order:
 *           type: number
 *           minimum: 0
 *           description: The order of the test
 *         lessonIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of lesson IDs (must be valid MongoDB ObjectIds)
 *         totalQuestions:
 *           type: number
 *           minimum: 0
 *           description: The total number of questions in the test
 *     TestUpdate:
 *       type: object
 *       properties:
 *         courseId:
 *           type: string
 *           description: The ID of the course (must be a valid MongoDB ObjectId)
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: The name of the test (max 100 characters)
 *         description:
 *           type: string
 *           maxLength: 2000
 *           description: The description of the test (max 2000 characters)
 *         length:
 *           type: number
 *           minimum: 1
 *           description: The duration of the test in minutes
 *         order:
 *           type: number
 *           minimum: 0
 *           description: The order of the test
 *         lessonIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of lesson IDs (must be valid MongoDB ObjectIds)
 *         totalQuestions:
 *           type: number
 *           minimum: 0
 *           description: The total number of questions in the test
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