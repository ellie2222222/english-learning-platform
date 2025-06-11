/**
 * @swagger
 * tags:
 *   - name: Flashcards
 *     description: Flashcards management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Flashcard:
 *       type: object
 *       required:
 *         - englishContent
 *         - vietnameseContent
 *         - flashcardSetId
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the flashcard
 *         englishContent:
 *           type: string
 *           description: The English content of the flashcard
 *         vietnameseContent:
 *           type: string
 *           description: The Vietnamese content of the flashcard
 *         flashcardSetId:
 *           type: string
 *           description: The ID of the flashcard set this flashcard belongs to
 *         order:
 *           type: number
 *           description: The order of the flashcard in the set
 *         isDeleted:
 *           type: boolean
 *           description: Indicates if the flashcard is deleted
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "60d5f3b7c4b3b1234567890a"
 *         englishContent: "Apple"
 *         vietnameseContent: "Táo"
 *         flashcardSetId: "60d5f3b7c4b3b1234567890b"
 *         order: 1
 *         isDeleted: false
 *         createdAt: "2025-06-10T13:55:00.000Z"
 *         updatedAt: "2025-06-10T13:55:00.000Z"
 *
 *     FlashcardSet:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the flashcard set
 *         name:
 *           type: string
 *           description: The name of the flashcard set
 *         description:
 *           type: string
 *           description: The description of the flashcard set
 *         userId:
 *           type: string
 *           description: The ID of the user who created the flashcard set
 *         isDeleted:
 *           type: boolean
 *           description: Indicates if the flashcard set is deleted
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "60d5f3b7c4b3b1234567890b"
 *         name: "Basic Vocabulary"
 *         description: "A set of basic English-Vietnamese vocabulary"
 *         userId: "60d5f3b7c4b3b1234567890c"
 *         isDeleted: false
 *         createdAt: "2025-06-10T13:55:00.000Z"
 *         updatedAt: "2025-06-10T13:55:00.000Z"
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *       example:
 *         message: "Invalid Flashcard ID"
 */

/**
 * @swagger
 * tags:
 *   - name: Flashcards
 *     description: Operations related to flashcards
 *   - name: Flashcard Sets
 *     description: Operations related to flashcard sets
 */

/**
 * @swagger
 * /api/flashcards:
 *   post:
 *     summary: Create a new flashcard
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - englishContent
 *               - vietnameseContent
 *               - flashcardSetId
 *             properties:
 *               englishContent:
 *                 type: string
 *                 description: The English content of the flashcard
 *               vietnameseContent:
 *                 type: string
 *                 description: The Vietnamese content of the flashcard
 *               flashcardSetId:
 *                 type: string
 *                 description: The ID of the flashcard set
 *             example:
 *               englishContent: "Apple"
 *               vietnameseContent: "Táo"
 *               flashcardSetId: "60d5f3b7c4b3b1234567890b"
 *     responses:
 *       201:
 *         description: Flashcard created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcard:
 *                   $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard created successfully"
 *       400:
 *         description: Bad request
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
 */

/**
 * @swagger
 * /api/flashcards/{id}:
 *   patch:
 *     summary: Update a flashcard
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flashcard ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               englishContent:
 *                 type: string
 *                 description: The updated English content
 *               vietnameseContent:
 *                 type: string
 *                 description: The updated Vietnamese content
 *             example:
 *               englishContent: "Apple"
 *               vietnameseContent: "Quả táo"
 *     responses:
 *       200:
 *         description: Flashcard updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcard:
 *                   $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard updated successfully"
 *       400:
 *         description: Bad request
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
 *
 *   delete:
 *     summary: Delete a flashcard
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flashcard ID
 *     responses:
 *       200:
 *         description: Flashcard deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcard:
 *                   $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard deleted successfully"
 *       400:
 *         description: Bad request
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
 *
 *   get:
 *     summary: Get a single flashcard
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flashcard ID
 *     responses:
 *       200:
 *         description: Flashcard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcard:
 *                   $ref: '#/components/schemas/Flashcard'
 *                 message:
 *                   type: string
 *                   example: "Flashcard retrieved successfully"
 *       400:
 *         description: Bad request
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
 */

/**
 * @swagger
 * /api/flashcards/{id}/flashcard-set:
 *   get:
 *     summary: Get all flashcards in a flashcard set
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flashcard set ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering flashcards
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
 *           enum: [date, name]
 *         description: Field to sort by
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Flashcards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcards:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flashcard'
 *                 total:
 *                   type: integer
 *                   description: Total number of flashcards
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 size:
 *                   type: integer
 *                   description: Number of items per page
 *                 message:
 *                   type: string
 *                   example: "Flashcards retrieved successfully"
 *       400:
 *         description: Bad request
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
 */
