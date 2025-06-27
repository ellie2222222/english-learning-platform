/**
 * @swagger
 * tags:
 *   - name: Grammar
 *     description: Grammar management endpoints
 */

/**
 * @swagger
 * /api/grammars:
 *   post:
 *     tags: [Grammar]
 *     summary: Create a new grammar
 *     description: Creates a new grammar item associated with a lesson.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *               - title
 *               - structure
 *             properties:
 *               lessonId:
 *                 type: string
 *                 example: "64f9d35ee9df932a347cd6b2"
 *               title:
 *                 type: string
 *                 example: "Present Simple Tense"
 *               structure:
 *                 type: string
 *                 example: "Subject + Verb(s/es)"
 *               example:
 *                 type: string
 *                 example: "He goes to school every day."
 *               explanation:
 *                 type: string
 *                 example: "The present simple is used for habits and general truths."
 *     responses:
 *       201:
 *         description: Grammar created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grammar'
 *   get:
 *     tags: [Grammar]
 *     summary: Get all grammars
 *     responses:
 *       200:
 *         description: List of grammars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grammar'
 */

/**
 * @swagger
 * /api/grammars/{grammarId}:
 *   get:
 *     tags: [Grammar]
 *     summary: Get grammar by ID
 *     parameters:
 *       - name: grammarId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grammar retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grammar'
 *   patch:
 *     tags: [Grammar]
 *     summary: Update a grammar
 *     parameters:
 *       - name: grammarId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the grammar item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lessonId:
 *                 type: string
 *                 example: "64f9d35ee9df932a347cd6b2"
 *               title:
 *                 type: string
 *                 example: "Updated Title"
 *               structure:
 *                 type: string
 *                 example: "Updated structure"
 *               example:
 *                 type: string
 *                 example: "Updated example sentence"
 *               explanation:
 *                 type: string
 *                 example: "Updated explanation text"
 *     responses:
 *       200:
 *         description: Grammar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grammar'
 *   delete:
 *     tags: [Grammar]
 *     summary: Delete a grammar
 *     parameters:
 *       - name: grammarId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Grammar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grammar'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Grammar:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         lessonId:
 *           type: string
 *         title:
 *           type: string
 *         structure:
 *           type: string
 *         example:
 *           type: string
 *         explanation:
 *           type: string
 *         order:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     GrammarCreate:
 *       type: object
 *       required:
 *         - lessonId
 *         - title
 *         - structure
 *       properties:
 *         lessonId:
 *           type: string
 *         title:
 *           type: string
 *         structure:
 *           type: string
 *         example:
 *           type: string
 *         explanation:
 *           type: string
 *     GrammarUpdate:
 *       type: object
 *       properties:
 *         lessonId:
 *           type: string
 *         title:
 *           type: string
 *         structure:
 *           type: string
 *         example:
 *           type: string
 *         explanation:
 *           type: string
 */
