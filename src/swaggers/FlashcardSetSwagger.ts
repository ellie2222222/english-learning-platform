/**
 * @swagger
 * tags:
 *   - name: Flashcard Sets
 *     description: FlashcardSets management endpoints
 */

/**
 * @swagger
 * /api/flashcard-sets:
 *   post:
 *     summary: Create a new flashcard set
 *     tags: [Flashcard Sets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the flashcard set
 *               description:
 *                 type: string
 *                 description: The description of the flashcard set
 *             example:
 *               name: "Basic Vocabulary"
 *               description: "A set of basic English-Vietnamese vocabulary"
 *     responses:
 *       201:
 *         description: Flashcard set created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcardSet:
 *                   $ref: '#/components/schemas/FlashcardSet'
 *                 message:
 *                   type: string
 *                   example: "Flashcard set created successfully"
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
 *     summary: Get all flashcard sets
 *     tags: [Flashcard Sets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Search term for filtering flashcard sets
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
 *         description: Flashcard sets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcardSets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FlashcardSet'
 *                 total:
 *                   type: integer
 *                   description: Total number of flashcard sets
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 size:
 *                   type: integer
 *                   description: Number of items per page
 *                 message:
 *                   type: string
 *                   example: "Flashcard sets retrieved successfully"
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
 * /api/flashcard-sets/{id}:
 *   patch:
 *     summary: Update a flashcard set
 *     tags: [Flashcard Sets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flashcard set ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the flashcard set
 *               description:
 *                 type: string
 *                 description: The updated description of the flashcard set
 *             example:
 *               name: "Updated Vocabulary"
 *               description: "Updated set of English-Vietnamese vocabulary"
 *     responses:
 *       200:
 *         description: Flashcard set updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcardSet:
 *                   $ref: '#/components/schemas/FlashcardSet'
 *                 message:
 *                   type: string
 *                   example: "Flashcard set updated successfully"
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
 *     summary: Delete a flashcard set
 *     tags: [Flashcard Sets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flashcard set ID
 *     responses:
 *       200:
 *         description: Flashcard set deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcardSet:
 *                   $ref: '#/components/schemas/FlashcardSet'
 *                 message:
 *                   type: string
 *                   example: "Flashcard set deleted successfully"
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
 *     summary: Get a single flashcard set
 *     tags: [Flashcard Sets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The flashcard set ID
 *     responses:
 *       200:
 *         description: Flashcard set retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcardSet:
 *                   $ref: '#/components/schemas/FlashcardSet'
 *                 message:
 *                   type: string
 *                   example: "Flashcard set retrieved successfully"
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
