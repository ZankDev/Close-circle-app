/**
 * OTPService.js
 * Generates a 4-digit OTP, sends it via n8n webhook (which delivers SMS),
 * and provides local verification against the stored code.
 */

const N8N_WEBHOOK_URL = 'https://geva.app.n8n.cloud/webhook-test/f95d8dc2-2c77-4b01-a244-3e5dd0edb024';

// In-memory store: phoneNumber → { code, expiresAt }
const otpStore = {};

/**
 * Generate a random 4-digit code.
 * TODO: remove hardcoded value before production
 */
const generateCode = () => '0000';

/**
 * Send OTP to the given phone number via n8n webhook.
 * The webhook is responsible for forwarding the SMS to the user.
 */
export const sendOTP = async (phoneNumber) => {
  const code = generateCode();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Store locally so we can verify later
  otpStore[phoneNumber] = { code, expiresAt };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        message: code,
      }),
    });

    if (!response.ok) {
      console.warn('Webhook response not OK:', response.status);
    }

    console.log(`OTP sent to ${phoneNumber}: ${code}`); // dev only
    return { success: true, code }; // code returned for dev convenience
  } catch (error) {
    console.error('OTP webhook error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify the code entered by the user.
 */
export const verifyOTP = async (phoneNumber, token) => {
  const entry = otpStore[phoneNumber];

  if (!entry) {
    return { success: false, error: 'לא נשלח קוד אימות למספר זה' };
  }

  if (Date.now() > entry.expiresAt) {
    delete otpStore[phoneNumber];
    return { success: false, error: 'קוד האימות פג תוקף, אנא בקש קוד חדש' };
  }

  if (token !== entry.code) {
    return { success: false, error: 'קוד האימות שגוי' };
  }

  delete otpStore[phoneNumber];
  return { success: true };
};

/**
 * Resend OTP — generates a new code and sends again.
 */
export const resendOTP = async (phoneNumber) => {
  return sendOTP(phoneNumber);
};

/**
 * Normalise an Israeli phone number to E.164 format.
 * "0501234567" → "+972501234567"
 */
export const formatPhoneNumber = (phone, countryCode = '+972') => {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('972')) return `+${clean}`;
  if (clean.startsWith('0')) return `${countryCode}${clean.substring(1)}`;
  return `${countryCode}${clean}`;
};
