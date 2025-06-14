/**
 * @swagger
 * tags:
 *   - name: Blogs
 *     description: Blogs management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       tags: [Blogs]
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the blog
 *         title:
 *           type: string
 *           description: The title of the blog
 *         content:
 *           type: string
 *           description: The content of the blog
 *         coverImage:
 *           type: string
 *           description: URL or path to the blog's cover image
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: The status of the blog
 *         userId:
 *           type: string
 *           description: The ID of the user who created the blog
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Blog creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Blog last update timestamp
 *       required:
 *         - title
 *         - content
 *         - coverImage
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *
 * /api/blogs:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the blog
 *               content:
 *                 type: string
 *                 description: The content of the blog
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: The status of the blog
 *               blogCover:
 *                 type: string
 *                 format: binary
 *                 description: The cover image file for the blog
 *               blogAttachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of attachment files for the blog
 *             required:
 *               - title
 *               - content
 *               - blogCover
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *                 message:
 *                   type: string
 *                   example: Blog created successfully
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
 *     summary: Get a list of blogs
 *     tags: [Blogs]
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
 *         description: Number of blogs per page
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
 *           enum: [date, title]
 *         description: Field to sort by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter blogs
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 total:
 *                   type: integer
 *                   description: Total number of blogs
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 size:
 *                   type: integer
 *                   description: Number of blogs per page
 *                 message:
 *                   type: string
 *                   example: Get blogs successfully
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
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to retrieve
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *                 message:
 *                   type: string
 *                   example: Get blog successfully
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
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   patch:
 *     summary: Update a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the blog
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: The updated status of the blog
 *               blogCover:
 *                 type: string
 *                 format: binary
 *                 description: The updated cover image file for the blog
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *                 message:
 *                   type: string
 *                   example: Blog updated successfully
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
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: Delete a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog to delete
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *                 message:
 *                   type: string
 *                   example: Blog deleted successfully
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
 *         description: Blog not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
