/**
 * @swagger
 * tags:
 *   - name: UserCourse
 *     description: User course management endpoints
 */

/**
 * @swagger
 * /api/users/courses:
 *   post:
 *     tags: [UserCourse]
 *     summary: Create a new user course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCourseCreate'
 *     responses:
 *       201:
 *         description: User course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCourse:
 *                   $ref: '#/components/schemas/UserCourse'
 *                 message:
 *                   type: string
 *                   example: User lesson created successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/courses/{userCourseId}:
 *   get:
 *     tags: [UserCourse]
 *     summary: Get user course by ID
 *     parameters:
 *       - name: userCourseId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userCourse:
 *                   $ref: '#/components/schemas/UserCourse'
 *                 message:
 *                   type: string
 *                   example: User lesson retrieved successfully
 *       404:
 *         description: User course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users/{userId}/courses:
 *   get:
 *     tags: [UserCourse]
 *     summary: Get user courses by user ID
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DATE, NAME]
 *           default: DATE
 *     responses:
 *       200:
 *         description: User courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserCourse'
 *                 page:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   example: User lessons retrieved successfully
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCourse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         courseId:
 *           type: string
 *         lessonFinished:
 *           type: number
 *         averageScore:
 *           type: number
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             role:
 *               type: number
 *             avatar:
 *               type: string
 *             googleId:
 *               type: string
 *             email:
 *               type: string
 *             lastOnline:
 *               type: string
 *               format: date-time
 *             onlineStreak:
 *               type: number
 *             activeUntil:
 *               type: string
 *               format: date-time
 *               nullable: true
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *         course:
 *           $ref: '#/components/schemas/Course'
 *     UserCourseCreate:
 *       type: object
 *       required:
 *         - userId
 *         - lessonId
 *         - currentOrder
 *         - status
 *       properties:
 *         userId:
 *           type: string
 *         lessonId:
 *           type: string
 *         currentOrder:
 *           type: number
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *     UserCourseUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [ongoing, completed]
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *         message:
 *           type: string
 */