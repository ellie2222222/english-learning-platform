/**
 * @swagger
 * tags:
 *   - name: Course
 *     description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Course]
 *     summary: Create a new course
 *     description: Creates a new course with required fields and a cover image. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreate'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *                 message:
 *                   type: string
 *                   example: Course created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (non-admin user)
 *       500:
 *         description: Internal server error
 *   get:
 *     tags: [Course]
 *     summary: Get all courses
 *     description: Retrieves a paginated list of courses. Supports query parameters for pagination and sorting. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
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
 *           enum: [name, createdAt]
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 total:
 *                   type: integer
 *                   description: Total number of courses
 *                 page:
 *                   type: integer
 *                   description: Current page
 *                 size:
 *                   type: integer
 *                   description: Number of items per page
 *                 message:
 *                   type: string
 *                   example: Courses retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Course]
 *     summary: Get course by ID
 *     description: Retrieves a single course by its ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *                 message:
 *                   type: string
 *                   example: Course retrieved successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags: [Course]
 *     summary: Update a course
 *     description: Updates an existing course with provided fields and a required cover image. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdate'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *                 message:
 *                   type: string
 *                   example: Course updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (non-admin user)
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags: [Course]
 *     summary: Delete a course
 *     description: Deletes a course by its ID. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *                 message:
 *                   type: string
 *                   example: Course deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (non-admin user)
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/courses/{id}/lessons:
 *   get:
 *     tags: [Course]
 *     summary: Get lessons by course ID
 *     description: Retrieves a paginated list of lessons for a specific course. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of items per page
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
 *           enum: [title, createdAt]
 *         description: Field to sort by
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *                 total:
 *                   type: integer
 *                   description: Total number of lessons
 *                 page:
 *                   type: integer
 *                   description: Current page
 *                 size:
 *                   type: integer
 *                   description: Number of items per page
 *                 message:
 *                   type: string
 *                   example: Lessons retrieved successfully
 *       400:
 *         description: Invalid ID or query parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the course
 *         name:
 *           type: string
 *           description: The name of the course (max 100 characters)
 *         description:
 *           type: string
 *           description: The description of the course
 *         type:
 *           type: string
 *           description: The type of the course
 *         level:
 *           type: string
 *           description: The level of the course
 *         totalLessons:
 *           type: number
 *           description: The total number of lessons in the course
 *         imageUrl:
 *           type: string
 *           description: URL of the course cover image
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         isDeleted:
 *           type: boolean
 *           description: Whether the course is marked as deleted
 *     CourseCreate:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - level
 *         - courseCover
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the course (max 100 characters)
 *         description:
 *           type: string
 *           description: The description of the course (optional)
 *         type:
 *           type: string
 *           description: The type of the course
 *         level:
 *           type: string
 *           description: The level of the course
 *         totalLessons:
 *           type: number
 *           description: The total number of lessons in the course (optional)
 *         courseCover:
 *           type: string
 *           format: binary
 *           description: The cover image file for the course (jpeg, jpg, png, gif)
 *     CourseUpdate:
 *       type: object
 *       required:
 *         - courseCover
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the course (optional, max 100 characters)
 *         description:
 *           type: string
 *           description: The description of the course (optional)
 *         type:
 *           type: string
 *           description: The type of the course (optional)
 *         level:
 *           type: string
 *           description: The level of the course (optional)
 *         totalLessons:
 *           type: number
 *           description: The total number of lessons in the course (optional)
 *         courseCover:
 *           type: string
 *           format: binary
 *           description: The new cover image file for the course (required, jpeg, jpg, png, gif)
 *     Lesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique ID of the lesson
 *         title:
 *           type: string
 *           description: The title of the lesson
 *         courseId:
 *           type: string
 *           description: The ID of the associated course
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         isDeleted:
 *           type: boolean
 *           description: Whether the lesson is marked as deleted
 */