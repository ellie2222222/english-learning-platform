/**
 * @swagger
 * tags:
 *   - name: Vocabulary
 *     description: Vocabulary management endpoints
 */

/**
 * @swagger
 * /api/vocabularies:
 *   post:
 *     tags: [Vocabulary]
 *     summary: Create a new vocabulary
 *     description: Creates a new vocabulary entry with required fields and an image file. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/VocabularyCreate'
 *     responses:
 *       201:
 *         description: Vocabulary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vocabulary:
 *                   $ref: '#/components/schemas/Vocabulary'
 *                 message:
 *                   type: string
 *                   example: Vocabulary created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (non-admin user)
 *       500:
 *         description: Internal server error
 *   get:
 *     tags: [Vocabulary]
 *     summary: Get all vocabularies
 *     description: Retrieves a paginated list of vocabularies. Supports query parameters for pagination and sorting. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [englishContent, order, createdAt]
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: List of vocabularies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vocabulary'
 *                 total:
 *                   type: integer
 *                   description: Total number of vocabularies
 *                 page:
 *                   type: integer
 *                   description: Current page
 *                 size:
 *                   type: integer
 *                   description: Number of items per page
 *                 message:
 *                   type: string
 *                   example: Vocabularies retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/vocabularies/{id}:
 *   get:
 *     tags: [Vocabulary]
 *     summary: Get vocabulary by ID
 *     description: Retrieves a single vocabulary by its ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     responses:
 *       200:
 *         description: Vocabulary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vocabulary:
 *                   $ref: '#/components/schemas/Vocabulary'
 *                 message:
 *                   type: string
 *                   example: Vocabulary retrieved successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vocabulary not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags: [Vocabulary]
 *     summary: Update a vocabulary
 *     description: Updates an existing vocabulary with provided fields and a required image file. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/VocabularyUpdate'
 *     responses:
 *       200:
 *         description: Vocabulary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vocabulary:
 *                   $ref: '#/components/schemas/Vocabulary'
 *                 message:
 *                   type: string
 *                   example: Vocabulary updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (non-admin user)
 *       404:
 *         description: Vocabulary or lesson not found
 *       409:
 *         description: Conflict (duplicate English content)
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags: [Vocabulary]
 *     summary: Delete a vocabulary
 *     description: Deletes a vocabulary by its ID. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     responses:
 *       200:
 *         description: Vocabulary deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vocabulary:
 *                   $ref: '#/components/schemas/Vocabulary'
 *                 message:
 *                   type: string
 *                   example: Vocabulary deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (non-admin user)
 *       404:
 *         description: Vocabulary not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Vocabulary:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the vocabulary
 *         lessonId:
 *           type: string
 *           description: The ID of the associated lesson
 *         englishContent:
 *           type: string
 *           description: The English content of the vocabulary
 *         vietnameseContent:
 *           type: string
 *           description: The Vietnamese translation of the vocabulary
 *         order:
 *           type: number
 *           description: Order of the vocabulary in the lesson
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         isDeleted:
 *           type: boolean
 *           description: Whether the vocabulary is marked as deleted
 *     VocabularyCreate:
 *       type: object
 *       required:
 *         - lessonId
 *         - englishContent
 *         - vietnameseContent
 *         - vocabularyImage
 *       properties:
 *         lessonId:
 *           type: string
 *           description: The ID of the lesson to associate with the vocabulary
 *         englishContent:
 *           type: string
 *           description: The English content of the vocabulary (max 100 characters)
 *         vietnameseContent:
 *           type: string
 *           description: The Vietnamese translation of the vocabulary (max 100 characters)
 *         vocabularyImage:
 *           type: string
 *           format: binary
 *           description: The image file for the vocabulary (jpeg, jpg, png, gif)
 *     VocabularyUpdate:
 *       type: object
 *       required:
 *         - vocabularyImage
 *       properties:
 *         lessonId:
 *           type: string
 *           description: The ID of the lesson to associate with the vocabulary (optional)
 *         englishContent:
 *           type: string
 *           description: The English content of the vocabulary (optional, max 100 characters)
 *         vietnameseContent:
 *           type: string
 *           description: The Vietnamese translation of the vocabulary (optional, max 100 characters)
 *         vocabularyImage:
 *           type: string
 *           format: binary
 *           description: The new image file for the vocabulary (required, jpeg, jpg, png, gif)
 */
