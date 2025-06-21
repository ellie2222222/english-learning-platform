/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Create payment management endpoints
 */

/**
 * @swagger
 * /api/payments/paypal/create:
 *   post:
 *     summary: Create a PayPal payment
 *     description: >
 *       Initiates a PayPal payment for a specific membership. <br> <br>
 *       The currency for PayPal is in `USD`. <br> <br>
 *       If the membership price is in `VND`, please **divide** the price by `25000 (25,000)`. <br> <br>
 *       Example: `price = 3750000` (in VND) -> `price = 150` (in USD). <br> <br>
 *       Sandbox account: `sb-z0buh33888275@personal.example.com`, Sandbox password: `"m!.0N%D`.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - membershipId
 *               - platform
 *             properties:
 *               membershipId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the membership being purchased.
 *                 example: "507f1f77bcf86cd799439011"
 *               platform:
 *                 type: string
 *                 enum: [web, mobile]
 *                 description: The platform initiating the payment (web or mobile).
 *                 example: web
 *     responses:
 *       200:
 *         description: Payment created successfully, returns the PayPal approval link.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 link:
 *                   type: string
 *                   description: The PayPal approval link to redirect the user for payment.
 *                   example: https://www.sandbox.paypal.com/checkoutnow?token=123456789
 *       400:
 *         description: Bad request (missing or invalid parameters, e.g., invalid membershipId or platform).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid membership id
 *       401:
 *         description: Unauthorized (missing or invalid authentication token).
 *       500:
 *         description: Internal server error (e.g., approval link not found or server failure).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Approval link not found.
 */

/**
 * @swagger
 * /api/payments/vnpay/create:
 *   post:
 *     summary: Create a VNPay payment
 *     description: >
 *       Initiates a VNPay payment for a specific membership. <br> <br>
 *       The currency for VNPay is in `VND`. <br> <br>
 *       If the membership price is in `USD`, please **multiply** the price by `25000 (25,000)`. <br> <br>
 *       Example: `price = 150` (in USD) -> `price = 3750000` (in VND). <br> <br>
 *       Sandbox account can be found here: `https://sandbox.vnpayment.vn/apis/vnpay-demo/`.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - membershipId
 *               - platform
 *             properties:
 *               membershipId:
 *                 type: string
 *                 description: The MongoDB ObjectId of the membership being purchased.
 *                 example: "507f1f77bcf86cd799439011"
 *               platform:
 *                 type: string
 *                 enum: [web, mobile]
 *                 description: The platform initiating the payment (web or mobile).
 *                 example: web
 *               bankCode:
 *                 type: string
 *                 description: The bank code for VNPay payment (optional).
 *                 example: NCB
 *     responses:
 *       200:
 *         description: Payment created successfully, returns the VNPay payment URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 link:
 *                   type: string
 *                   description: The VNPay payment URL to redirect the user for payment.
 *                   example: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?params=...
 *       400:
 *         description: Bad request (missing or invalid parameters, e.g., invalid membershipId or platform).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid membership id
 *       401:
 *         description: Unauthorized (missing or invalid authentication token).
 *       500:
 *         description: Internal server error (e.g., server failure during payment creation).
 */
