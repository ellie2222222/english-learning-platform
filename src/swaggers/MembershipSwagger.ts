/**
 * @swagger
 * tags:
 *   - name: Memberships
 *     description: Memberships management endpoints
 */

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Membership:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the membership
 *         name:
 *           type: string
 *           description: Name of the membership
 *         description:
 *           type: string
 *           description: Description of the membership
 *         price:
 *           type: number
 *           description: Price of the membership
 *         duration:
 *           type: number
 *           description: Duration of the membership in days
 *       required:
 *         - name
 *         - price
 *         - duration
 *     MembershipResponse:
 *       type: object
 *       properties:
 *         membership:
 *           $ref: '#/components/schemas/Membership'
 *         message:
 *           type: string
 *           description: Response message
 *     MembershipListResponse:
 *       type: object
 *       properties:
 *         memberships:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Membership'
 *         total:
 *           type: number
 *           description: Total number of memberships
 *         page:
 *           type: number
 *           description: Current page number
 *         size:
 *           type: number
 *           description: Number of memberships per page
 *         message:
 *           type: string
 *           description: Response message
 */

/**
 * @openapi
 * /api/memberships:
 *   post:
 *     summary: Create a new membership
 *     tags:
 *       - Memberships
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *             required:
 *               - name
 *               - price
 *               - duration
 *     responses:
 *       201:
 *         description: Membership created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get a list of memberships
 *     tags:
 *       - Memberships
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of memberships per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: date
 *         description: Field to sort by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Memberships retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/memberships/{id}:
 *   patch:
 *     summary: Update an existing membership
 *     tags:
 *       - Memberships
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *     responses:
 *       200:
 *         description: Membership updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Membership not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a membership
 *     tags:
 *       - Memberships
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     responses:
 *       200:
 *         description: Membership deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Membership not found
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get a membership by ID
 *     tags:
 *       - Memberships
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership ID
 *     responses:
 *       200:
 *         description: Membership retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Membership not found
 *       500:
 *         description: Internal server error
 */
