import { Request, Response } from 'express';
import { SurepassService } from '../services/surepass.service';
import {
  IAadhaarOtpRequest,
  IAadhaarSubmitOtpRequest,
  IDrivingLicenseVerifyRequest,
} from '@portfolio/shared-types';

export class KycController {
  /**
   * GET /api/kyc/config
   * Returns KYC service status and configuration mode without exposing tokens.
   */
  public static async getConfig(_req: Request, res: Response): Promise<void> {
    try {
      const status = SurepassService.getServiceStatus();
      res.json(status);
    } catch (err: unknown) {
      res.status(500).json({
        error: 'Failed to retrieve KYC service configuration',
        message: (err as Error).message,
      });
    }
  }

  /**
   * POST /api/kyc/aadhaar/generate-otp
   * Generates Aadhaar OTP via Surepass
   */
  public static async generateAadhaarOtp(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const body = req.body as IAadhaarOtpRequest;
      if (!body || !body.aadhaarNumber) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Aadhaar number is required.',
        });
        return;
      }

      const result = await SurepassService.generateAadhaarOtp(
        body.aadhaarNumber,
      );
      res.json(result);
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Failed to generate Aadhaar OTP';
      res.status(400).json({
        error: 'Aadhaar OTP Generation Error',
        message: errMsg,
      });
    }
  }

  /**
   * POST /api/kyc/aadhaar/submit-otp
   * Verifies Aadhaar OTP via Surepass and returns sanitized identity profile.
   */
  public static async submitAadhaarOtp(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const body = req.body as IAadhaarSubmitOtpRequest;
      if (!body || !body.clientId || !body.otp) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Both clientId and OTP are required.',
        });
        return;
      }

      const verifiedData = await SurepassService.submitAadhaarOtp(
        body.clientId,
        body.otp,
      );
      res.json(verifiedData);
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Failed to verify Aadhaar OTP';
      res.status(400).json({
        error: 'Aadhaar OTP Verification Error',
        message: errMsg,
      });
    }
  }

  /**
   * POST /api/kyc/driving-license/verify
   * Verifies Driving License credentials via Surepass.
   */
  public static async verifyDrivingLicense(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const body = req.body as IDrivingLicenseVerifyRequest;
      if (!body || !body.dlNumber) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Driving License number is required.',
        });
        return;
      }

      const verifiedData = await SurepassService.verifyDrivingLicense(
        body.dlNumber,
        body.dob,
      );
      res.json(verifiedData);
    } catch (err: unknown) {
      const errMsg =
        (err as Error).message || 'Failed to verify Driving License';
      res.status(400).json({
        error: 'Driving License Verification Error',
        message: errMsg,
      });
    }
  }
}

