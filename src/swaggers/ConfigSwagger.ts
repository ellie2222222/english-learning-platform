/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Config:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: The configuration key
 *           example: test_passing_point
 *         value:
 *           type: string
 *           description: The configuration value
 *           example: "80"
 *         description:
 *           type: string
 *           description: Description of the configuration
 *           example: Minimum score to pass a test
 *       required:
 *         - key
 *         - value
 *     Revenue:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           enum: [day, week, month, year]
 *           description: Time period for revenue calculation
 *         value:
 *           type: integer
 *           description: Number of time periods
 *           example: 30
 *     NewUsers:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           enum: [day, week, month, year]
 *           description: Time period for new user calculation
 *         value:
 *           type: integer
 *           description: Number of time periods
 *           example: 30
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: An error occurred
 */

/**
 * @swagger
 * tags:
 *   - name: Config
 *     description: Configuration management endpoints
 *   - name: Statistics
 *     description: Statistical data endpoints
 */

/**
 * @swagger
 * /api/configs/{id}:
 *   get:
 *     summary: Get a specific configuration
 *     tags: [Config]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *     responses:
 *       200:
 *         description: Config retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 config:
 *                   $ref: '#/components/schemas/Config'
 *                 message:
 *                   type: string
 *                   example: Config retrieved successfully
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
 * /api/configs:
 *   get:
 *     summary: Get all configurations
 *     tags: [Config]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Configs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Config'
 *                 message:
 *                   type: string
 *                   example: Configs retrieved successfully
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
 * /api/configs:
 *   post:
 *     summary: Create a new configuration
 *     tags: [Config]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Config'
 *     responses:
 *       201:
 *         description: Config created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 config:
 *                   $ref: '#/components/schemas/Config'
 *                 message:
 *                   type: string
 *                   example: Config created successfully
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
 * /api/configs/{id}:
 *   patch:
 *     summary: Update a configuration
 *     tags: [Config]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - value
 *     responses:
 *       200:
 *         description: Config updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 config:
 *                   $ref: '#/components/schemas/Config'
 *                 message:
 *                   type: string
 *                   example: Config updated successfully
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
