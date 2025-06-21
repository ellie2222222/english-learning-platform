/**
 * @swagger
 * /api/statistics/revenue:
 *   get:
 *     summary: Get revenue over time
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Time period for revenue calculation
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of time periods
 *     responses:
 *       200:
 *         description: Revenue data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revenue:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       amount:
 *                         type: number
 *                 message:
 *                   type: string
 *                   example: Get revenue over time successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/statistics/new-users:
 *   get:
 *     summary: Get new users over time
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: time
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Time period for new user calculation
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of time periods
 *     responses:
 *       200:
 *         description: New user data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newUserOverTime:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       count:
 *                         type: integer
 *                 message:
 *                   type: string
 *                   example: Get new user over time successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
