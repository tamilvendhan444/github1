export const config = {
	port: Number(process.env.PORT || 4000),
	jwtSecret: process.env.JWT_SECRET || 'dev_secret',
	corsOrigin: process.env.CORS_ORIGIN || '*',
	paymentUpiId: process.env.PAYMENT_UPI_ID || 'merchant@upi',
	uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
