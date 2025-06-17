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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrammarCreate'
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrammarUpdate'
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
 *         - order
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
 *         order:
 *           type: number
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
 *         order:
 *           type: number
 */
