/**
 * @swagger
 * tags:
 *   - name: Achievements
 *     description: Achievements management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Achievement:
 *       tags: [Achievements]
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the achievement
 *         name:
 *           type: string
 *           description: The name of the achievement
 *         description:
 *           type: string
 *           description: The description of the achievement
 *         type:
 *           type: string
 *           enum: [login_streak, course_completion, lesson_completion]
 *           description: The type of the achievement
 *         goal:
 *           type: integer
 *           description: The goal value to achieve
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Achievement creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Achievement last update timestamp
 *       required:
 *         - name
 *         - description
 *         - type
 *         - goal
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *
 * /api/achievements:
 *   post:
 *     summary: Create a new achievement
 *     tags: [Achievements]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the achievement
 *               description:
 *                 type: string
 *                 description: The description of the achievement
 *               type:
 *                 type: string
 *                 enum: [login_streak, course_completion, lesson_completion]
 *                 description: The type of the achievement (select from dropdown)
 *               goal:
 *                 type: integer
 *                 description: The goal value to achieve
 *             required:
 *               - name
 *               - description
 *               - type
 *               - goal
 *     responses:
 *       201:
 *         description: Achievement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievement:
 *                   $ref: '#/components/schemas/Achievement'
 *                 message:
 *                   type: string
 *                   example: Achievement created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   get:
 *     summary: Get a list of achievements
 *     tags: [Achievements]
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
 *         description: Number of achievements per page
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
 *           enum: [date, name]
 *         description: Field to sort by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter achievements
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [login_streak, course_completion, lesson_completion]
 *         description: Filter by achievement type
 *     responses:
 *       200:
 *         description: Achievements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Achievement'
 *                 total:
 *                   type: integer
 *                   description: Total number of achievements
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 size:
 *                   type: integer
 *                   description: Number of achievements per page
 *                 message:
 *                   type: string
 *                   example: Achievement get successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/achievements/{id}:
 *   get:
 *     summary: Get an achievement by ID
 *     tags: [Achievements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the achievement to retrieve
 *     responses:
 *       200:
 *         description: Achievement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievement:
 *                   $ref: '#/components/schemas/Achievement'
 *                 message:
 *                   type: string
 *                   example: Achievement get successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Achievement not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   patch:
 *     summary: Update an achievement by ID
 *     tags: [Achievements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the achievement to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the achievement
 *               description:
 *                 type: string
 *                 description: The updated description of the achievement
 *               type:
 *                 type: string
 *                 enum: [login_streak, course_completion, lesson_completion]
 *                 description: The updated type of the achievement (select from dropdown)
 *               goal:
 *                 type: integer
 *                 description: The updated goal value to achieve
 *     responses:
 *       200:
 *         description: Achievement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievement:
 *                   $ref: '#/components/schemas/Achievement'
 *                 message:
 *                   type: string
 *                   example: Achievement updated successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403iddy:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Achievement not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete an achievement by ID
 *     tags: [Achievements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the achievement to delete
 *     responses:
 *       200:
 *         description: Achievement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 achievement:
 *                   $ref: '#/components/schemas/Achievement'
 *                 message:
 *                   type: string
 *                   example: Achievement deleted successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User does not have required permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Achievement not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
