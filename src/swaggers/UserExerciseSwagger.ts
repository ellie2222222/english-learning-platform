/**
 * @swagger
 * tags:
 *   name: UserExercise
 *   description: API endpoints for managing user exercises in the English Learning Platform
 */

/**
 * @swagger
 * /api/user-exercises/submit:
 *   post:
 *     summary: Submit a user exercise
 *     tags: [UserExercise]

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exerciseId
 *               - answer
 *             properties:
 *               exerciseId:
 *                 type: string
 *                 description: The ID of the exercise being submitted
 *                 example: "507f1f77bcf86cd799439011"
 *               answer:
 *                 type: string
 *                 description: The user's answer to the exercise
 *                 example: "Paris"
 *     responses:
 *       201:
 *         description: User exercise submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userExercise:
 *                   type: object
 *                   description: The submitted user exercise object
 *                 message:
 *                   type: string
 *                   example: User exercise submitted successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user exercise ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 */

/**
 * @swagger
 * /api/user-exercises/{id}/user:
 *   get:
 *     summary: Get all exercises for a specific user
 *     tags: [UserExercise]

 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose exercises are being retrieved
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of user exercises per page
 *         example: 10
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Order of results (ascending or descending)
 *         example: DESC
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *         description: Field to sort by
 *         example: createdAt
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter user exercises
 *         example: "capital"
 *     responses:
 *       200:
 *         description: User exercises retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exercises:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: User exercise object
 *                 total:
 *                   type: integer
 *                   description: Total number of user exercises
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 size:
 *                   type: integer
 *                   description: Number of user exercises per page
 *                 message:
 *                   type: string
 *                   example: User exercises retrieved successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user exercise ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 */

/**
 * @swagger
 * /api/user-exercises/{id}:
 *   get:
 *     summary: Get a specific user exercise
 *     tags: [UserExercise]

 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user exercise to retrieve
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: User exercise retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userExercise:
 *                   type: object
 *                   description: The user exercise object
 *                 message:
 *                   type: string
 *                   example: User exercise retrieved successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user exercise ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 */
