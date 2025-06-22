/**
 * @swagger
 * tags:
 *   name: Tests
 *   description: API endpoints for managing tests
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Test:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the test
 *         name:
 *           type: string
 *           description: The name of the test
 *         description:
 *           type: string
 *           description: The description of the test
 *         lessonIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of lesson IDs associated with the test
 *         totalQuestions:
 *           type: integer
 *           description: The total number of questions in the test
 *     TestResponse:
 *       type: object
 *       properties:
 *         test:
 *           $ref: '#/components/schemas/Test'
 *         message:
 *           type: string
 *           description: Response message
 *     TestsResponse:
 *       type: object
 *       properties:
 *         tests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Test'
 *         total:
 *           type: integer
 *           description: Total number of tests
 *         page:
 *           type: integer
 *           description: Current page number
 *         size:
 *           type: integer
 *           description: Number of tests per page
 *         message:
 *           type: string
 *           description: Response message
 *     CreateTestDto:
 *       type: object
 *       required:
 *         - name
 *         - lessonIds
 *         - totalQuestions
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the test
 *         lessonIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of lesson IDs
 *         description:
 *           type: string
 *           description: The description of the test
 *         totalQuestions:
 *           type: integer
 *           description: The total number of questions
 *     UpdateTestDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the test
 *         lessonIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of lesson IDs
 *         description:
 *           type: string
 *           description: The description of the test
 *         totalQuestions:
 *           type: integer
 *           description: The total number of questions
 *     SubmitTestDto:
 *       type: object
 *       required:
 *         - userId
 *         - answers
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user submitting the test
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - exerciseId
 *               - selectedAnswers
 *             properties:
 *               exerciseId:
 *                 type: string
 *                 description: The ID of the exercise being answered
 *               selectedAnswers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: The selected answers for the exercise
 *     TestResultItem:
 *       type: object
 *       properties:
 *         exerciseId:
 *           type: string
 *           description: The ID of the exercise
 *         selectedAnswers:
 *           type: array
 *           items:
 *             type: string
 *           description: The answers selected by the user
 *         correctAnswers:
 *           type: array
 *           items:
 *             type: string
 *           description: The correct answers for the exercise
 *         isCorrect:
 *           type: boolean
 *           description: Whether the user's answer was correct
 *     TestSubmissionResponse:
 *       type: object
 *       properties:
 *         submission:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The ID of the submission
 *             userId:
 *               type: string
 *               description: The ID of the user
 *             testId:
 *               type: string
 *               description: The ID of the test
 *             attemptNo:
 *               type: integer
 *               description: The attempt number
 *             score:
 *               type: integer
 *               description: The score achieved (0-100)
 *             status:
 *               type: string
 *               enum: [passed, failed]
 *               description: The status of the test submission
 *             description:
 *               type: string
 *               description: Description of the submission result
 *             submittedAt:
 *               type: string
 *               format: date-time
 *               description: When the test was submitted
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TestResultItem'
 *               description: Detailed results for each exercise
 *         message:
 *           type: string
 *           description: Response message
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Error details
 */

/**
 * @swagger
 * /api/tests:
 *   post:
 *     summary: Create a new test
 *     tags: [Tests]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTestDto'
 *     responses:
 *       201:
 *         description: Test created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Bad Request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tests/{id}/course:
 *   get:
 *     summary: Get tests by course ID
 *     tags: [Tests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tests per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Order of results (ascending or descending)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: Tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestsResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User lacks access to the course
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tests/{id}:
 *   get:
 *     summary: Get a test by ID
 *     tags: [Tests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test ID
 *     responses:
 *       200:
 *         description: Test retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User lacks access to the test
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tests/{id}:
 *   patch:
 *     summary: Update a test by ID
 *     tags: [Tests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTestDto'
 *     responses:
 *       200:
 *         description: Test updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tests/{id}:
 *   delete:
 *     summary: Delete a test by ID
 *     tags: [Tests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test ID
 *     responses:
 *       200:
 *         description: Test deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User does not have admin role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tests/lesson/{id}:
 *   get:
 *     summary: Get tests by lesson ID
 *     tags: [Tests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tests per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Order of results (ascending or descending)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: Tests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestsResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User lacks access to the lesson
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/tests/{id}/submission:
 *   post:
 *     summary: Submit answers for a test
 *     tags: [Tests]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitTestDto'
 *     responses:
 *       201:
 *         description: Test submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestSubmissionResponse'
 *       400:
 *         description: Bad Request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User lacks access to the test
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
