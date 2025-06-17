/**
 * @swagger
 * tags:
 *   name: Exercises
 *   description: API endpoints for managing exercises in the English Learning Platform
 */

/**
 * @swagger
 * /api/exercises:
 *   post:
 *     summary: Create a new exercise
 *     tags: [Exercises]

 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *               - type
 *               - question
 *               - answer
 *               - focus
 *               - explanation
 *             properties:
 *               lessonId:
 *                 type: string
 *                 description: The ID of the lesson to which the exercise belongs
 *                 example: "507f1f77bcf86cd799439011"
 *               type:
 *                 type: string
 *                 enum: [multiple_choice, translate, fill_in_the_blank, image_translate]
 *                 description: The type of exercise
 *                 example: multiple_choice
 *               question:
 *                 type: string
 *                 description: The question for the exercise
 *                 example: "What is the capital of France?"
 *               answer:
 *                 oneOf:
 *                   - type: string
 *                     description: The correct answer for multiple_choice exercises, must be one of the options
 *                     example: "Paris"
 *                   - type: array
 *                     items:
 *                       type: string
 *                     description: Array of correct answers for translate, fill_in_the_blank, or image_translate exercises
 *                     example: ["Paris", "París"]
 *               focus:
 *                 type: string
 *                 enum: [vocabulary, grammar]
 *                 description: The focus area of the exercise
 *                 example: vocabulary
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of options for multiple_choice exercises
 *                 example: ["Paris", "London", "Berlin", "Madrid"]
 *               explanation:
 *                 type: string
 *                 description: Explanation for the correct answer
 *                 example: "Paris is the capital city of France."
 *               exerciseImage:
 *                 type: string
 *                 format: binary
 *                 description: Image file for image_translate exercises
 *     responses:
 *       201:
 *         description: Exercise created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exercise:
 *                   type: object
 *                   description: The created exercise object
 *                 message:
 *                   type: string
 *                   example: Exercise created successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid lessonId
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, user is not an admin
 */

/**
 * @swagger
 * /api/exercises/{id}:
 *   patch:
 *     summary: Update an existing exercise
 *     tags: [Exercises]

 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the exercise to update
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: Updated question for the exercise
 *                 example: "What is the capital of France?"
 *               answer:
 *                 oneOf:
 *                   - type: string
 *                     description: Updated answer for multiple_choice exercises, must be one of the options
 *                     example: "Paris"
 *                   - type: array
 *                     items:
 *                       type: string
 *                     description: Updated array of answers for translate, fill_in_the_blank, or image_translate exercises
 *                     example: ["Paris", "París"]
 *               focus:
 *                 type: string
 *                 enum: [vocabulary, grammar]
 *                 description: Updated focus area of the exercise
 *                 example: vocabulary
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated options for multiple_choice exercises
 *                 example: ["Paris", "London", "Berlin", "Madrid"]
 *               explanation:
 *                 type: string
 *                 description: Updated explanation for the correct answer
 *                 example: "Paris is the capital city of France."
 *               exerciseImage:
 *                 type: string
 *                 format: binary
 *                 description: Updated image file for image_translate exercises
 *     responses:
 *       200:
 *         description: Exercise updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exercise:
 *                   type: object
 *                   description: The updated exercise object
 *                 message:
 *                   type: string
 *                   example: Exercise updated successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid exercise ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, user is not an admin
 */

/**
 * @swagger
 * /api/exercises/{id}:
 *   delete:
 *     summary: Delete an exercise
 *     tags: [Exercises]

 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the exercise to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Exercise deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exercise:
 *                   type: object
 *                   description: The deleted exercise object
 *                 message:
 *                   type: string
 *                   example: Exercise deleted successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid exercise ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 *       403:
 *         description: Forbidden, user is not an admin
 */

/**
 * @swagger
 * /api/exercises/{id}/lesson:
 *   get:
 *     summary: Get exercises for a specific lesson
 *     tags: [Exercises]

 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the lesson
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
 *         description: Number of exercises per page
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
 *         description: Search term to filter exercises
 *         example: "capital"
 *     responses:
 *       200:
 *         description: Exercises retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exercises:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Exercise object
 *                 total:
 *                   type: integer
 *                   description: Total number of exercises
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 size:
 *                   type: integer
 *                   description: Number of exercises per page
 *                 message:
 *                   type: string
 *                   example: Exercises retrieved successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid lesson ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 */

/**
 * @swagger
 * /api/exercises/{id}:
 *   get:
 *     summary: Get a specific exercise
 *     tags: [Exercises]

 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the exercise
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Exercise retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exercise:
 *                   type: object
 *                   description: The exercise object
 *                 message:
 *                   type: string
 *                   example: Exercise retrieved successfully
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid exercise ID
 *       401:
 *         description: Unauthorized, missing or invalid token
 */
