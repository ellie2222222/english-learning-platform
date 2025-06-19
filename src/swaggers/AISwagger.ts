/**
 * @openapi
 * tags:
 *   - name: AI
 *     description: AI-related endpoints for English learning support
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AIQuestionRequest:
 *       type: object
 *       required:
 *         - question
 *       properties:
 *         question:
 *           type: string
 *           description: The user's question for the English tutor AI
 *           example: "How do I improve my English pronunciation?"
 *     AIQuestionResponse:
 *       type: object
 *       properties:
 *         response:
 *           type: string
 *           description: The AI's response to the user's question
 *           example: "To improve your pronunciation, practice tongue twisters and listen to native speakers."
 *         message:
 *           type: string
 *           description: Status message
 *           example: "AI response successful"
 *     PersonalizedLearningResponse:
 *       type: object
 *       properties:
 *         referenceData:
 *           type: array
 *           items:
 *             type: object
 *           description: Raw user progress data used for analysis
 *         response:
 *           type: object
 *           properties:
 *             strengths:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of user's strengths
 *               example: ["Good vocabulary", "Consistent progress"]
 *             weaknesses:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of user's weaknesses
 *               example: ["Poor grammar", "Low test scores"]
 *             recommendations:
 *               type: array
 *               items:
 *                 type: string
 *               description: Actionable recommendations
 *               example: ["Practice grammar exercises", "Take more practice tests"]
 *             summary:
 *               type: string
 *               description: Summary of user's progress
 *               example: "You’re doing well but need to focus on grammar."
 *         message:
 *           type: string
 *           description: Status message
 *           example: "AI response successful"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *         details:
 *           type: object
 *           description: Additional error details (optional)
 */

/**
 * @openapi
 * /api/ai/tutor:
 *   post:
 *     summary: Ask the English Tutor AI a question
 *     description: Allows authenticated users to ask English learning-related questions to the AI tutor. Only questions about vocabulary, grammar, pronunciation, etc., are answered.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIQuestionRequest'
 *     responses:
 *       200:
 *         description: Successful response from the AI tutor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIQuestionResponse'
 *       400:
 *         description: Bad request (e.g., missing or invalid question)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid request: Question is required"
 *               statusCode: 400
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *               statusCode: 401
 *       403:
 *         description: Forbidden (user role not allowed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Forbidden: Insufficient permissions"
 *               statusCode: 403
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal Server Error"
 *               statusCode: 500
 */

/**
 * @openapi
 * /api/ai/recommentdations/{id}/user:
 *   get:
 *     summary: Get personalized learning recommendations
 *     description: Retrieves personalized learning recommendations based on the user's progress. Accessible by admins or the user themselves.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user for whom recommendations are requested
 *     responses:
 *       200:
 *         description: Successful response with personalized recommendations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PersonalizedLearningResponse'
 *       400:
 *         description: Bad request (e.g., invalid user ID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid user ID"
 *               statusCode: 400
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *               statusCode: 401
 *       403:
 *         description: Forbidden (user not authorized to access this resource)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "You are not authorized to access this resource"
 *               statusCode: 403
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User not found"
 *               statusCode: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal Server Error"
 *               statusCode: 500
 */
