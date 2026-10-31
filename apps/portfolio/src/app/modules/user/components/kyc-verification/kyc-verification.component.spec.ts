import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../../../test-utils/playwright-helpers';

test.describe('KYC Verification Component (<app-kyc-verification>)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock KYC backend configuration endpoint
    await page.route('**/api/kyc/config', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isConfigured: true,
          mode: 'sandbox',
          baseUrl: 'https://kyc-api.surepass.io',
        }),
      });
    });

    // Mock Aadhaar generate OTP endpoint
    await page.route('**/api/kyc/aadhaar/generate-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          clientId: 'mock_adh_client_123',
          otpSent: true,
          message: 'Sandbox: OTP sent successfully to linked mobile number.',
          validAadhaar: true,
        }),
      });
    });

    // Mock Aadhaar submit OTP endpoint
    await page.route('**/api/kyc/aadhaar/submit-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          clientId: 'mock_adh_client_123',
          fullName: 'Aditya Kumar Talapula',
          dob: '1995-08-15',
          gender: 'M',
          maskedAadhaar: 'XXXX-XXXX-8899',
          address: {
            line: 'Flat 402, Royal Residency',
            locality: 'Banjara Hills',
            district: 'Hyderabad',
            state: 'Telangana',
            pin: '500034',
            country: 'India',
          },
          profileImage: '',
          zip: '500034',
          verifiedAt: new Date().toISOString(),
        }),
      });
    });

    // Mock Driving License verification endpoint
    await page.route('**/api/kyc/driving-license/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          clientId: 'mock_dl_123',
          licenseNumber: 'TS0920200001234',
          holderName: 'Aditya Kumar Talapula',
          fatherOrHusbandName: 'Satyanarayana Talapula',
          dob: '1995-08-15',
          status: 'ACTIVE',
          validTill: '2036-04-11',
          covDetails: [
            { cov: 'MCWG (Motor Cycle With Gear)' },
            { cov: 'LMV (Light Motor Vehicle - Car)' },
          ],
          address: 'Banjara Hills, Hyderabad, Telangana - 500034',
          state: 'Telangana',
          verifiedAt: new Date().toISOString(),
        }),
      });
    });

    await injectUserSession(page, {
      role: 'user',
    });

    await page.goto('/user/kyc-verification');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render KYC verification header and sandbox mode badge', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'KYC Identity Verification' }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Surepass Sandbox Mode')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Aadhaar Verification/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Driving License/i }),
    ).toBeVisible();
  });

  test('should complete Aadhaar OTP verification workflow', async ({
    page,
  }) => {
    // Fill 12-digit Aadhaar
    const aadhaarInput = page.locator('input[placeholder="XXXX XXXX XXXX"]');
    await aadhaarInput.fill('123456789012');

    // Click Send OTP
    const sendOtpBtn = page.getByRole('button', {
      name: /Send OTP via Surepass/i,
    });
    await expect(sendOtpBtn).toBeEnabled();
    await sendOtpBtn.click();

    // Verify OTP input appears
    const otpInput = page.locator('input[placeholder="123456"]');
    await expect(otpInput).toBeVisible({ timeout: 5000 });
    await otpInput.fill('123456');

    // Submit OTP
    const verifyBtn = page.getByRole('button', { name: /Verify Identity/i });
    await verifyBtn.click();

    // Verify verified identity card is rendered
    await expect(
      page.getByRole('heading', { name: 'Verified Aadhaar Identity' }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Aditya Kumar Talapula')).toBeVisible();
    await expect(page.getByText('XXXX-XXXX-8899')).toBeVisible();
    await expect(page.getByText('Authenticity Confirmed')).toBeVisible();
  });

  test('should switch to Driving License tab and verify license details', async ({
    page,
  }) => {
    // Switch to Driving License tab
    await page.getByRole('button', { name: /Driving License/i }).click();

    await expect(
      page.getByRole('heading', { name: 'Driving License Verification' }),
    ).toBeVisible();

    // Fill DL Number
    const dlInput = page.locator('input[placeholder="e.g. DL1420110012345"]');
    await dlInput.fill('TS0920200001234');

    // Click Verify
    const verifyDlBtn = page.getByRole('button', {
      name: /Verify Driving License/i,
    });
    await expect(verifyDlBtn).toBeEnabled();
    await verifyDlBtn.click();

    // Verify DL card details
    await expect(
      page.getByRole('heading', { name: 'Driving License Credential' }),
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('ACTIVE')).toBeVisible();
    await expect(page.getByText('LMV (Light Motor Vehicle - Car)')).toBeVisible();
  });
});
