/**
 * @swagger
 * tags:
 *   - name: UserAchievements
 *     description: UserAchievements management endpoints
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     UserAchievement:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the user achievement
 *         userId:
 *           type: string
 *           description: The ID of the user associated with the achievement
 *         achievementId:
 *           type: string
 *           description: The ID of the achievement
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User achievement creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: User achievement last update timestamp
 *       required:
 *         - userId
 *         - achievementId
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *
 * /api/user-achievements/{id}/users:
 *   get:
 *     summary: Get a list of user achievements for a specific user
 *     tags: [UserAchievements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose achievements are to be retrieved
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
 *         description: Number of user achievements per page
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
 *           enum: [name, date]
 *         description: Field to sort by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter user achievements
 *     responses:
 *       200:
 *         description: User achievements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userAchievements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserAchievement'
 *                 total:
 *                   type: integer
 *                   description: Total number of user achievements
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 size:
 *                   type: integer
 *                   description: Number of user achievements per page
 *                 message:
 *                   type: string
 *                   example: Get user achievements successfully
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
 * /api/user-achievements/{id}:
 *   get:
 *     summary: Get a user achievement by ID
 *     tags: [UserAchievements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user achievement to retrieve
 *     responses:
 *       200:
 *         description: User achievement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userAchievement:
 *                   $ref: '#/components/schemas/UserAchievement'
 *                 message:
 *                   type: string
 *                   example: Get user achievement successfully
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
 *         description: User achievement not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
