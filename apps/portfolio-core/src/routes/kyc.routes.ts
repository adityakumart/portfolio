import { Router } from 'express';
import { KycController } from '../controllers/kyc.controller';
import { authenticateKycUser } from '../middlewares/kyc-auth.middleware';
import { kycRateLimiter } from '../middlewares/rate-limit.middleware';

export const kycRouter = Router();

// Rate limiting across all KYC verification endpoints
kycRouter.use(kycRateLimiter);

// Service configuration (allows UI to check sandbox/live mode, does not expose tokens)
kycRouter.get('/config', KycController.getConfig);

// Protected verification operations (requires authenticated platform or RR session)
kycRouter.use(authenticateKycUser);

// Aadhaar verification flow
kycRouter.post('/aadhaar/generate-otp', KycController.generateAadhaarOtp);
kycRouter.post('/aadhaar/submit-otp', KycController.submitAadhaarOtp);

// Driving License verification flow
kycRouter.post('/driving-license/verify', KycController.verifyDrivingLicense);

