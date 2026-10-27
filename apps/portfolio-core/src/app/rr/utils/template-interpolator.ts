import { IBooking, IRRWhatsAppConfig, IRRWhatsAppTemplateId } from '@portfolio/shared-types';

/**
 * Format date string to Indian readable date: DD-MM-YYYY
 */
export function formatToIndianDateString(dateVal: any): string {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format time to 12-hour AM/PM format
 */
export function formatToTimeString(dateVal: any): string {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Normalize phone number with country code prefix (e.g. +91)
 */
export function sanitizeWhatsAppPhone(phone: string, defaultPrefix = '+91'): string {
  if (!phone) return '';
  // Remove non-digit characters except leading '+'
  let clean = phone.replace(/[^0-9]/g, '');
  if (!clean) return '';

  // If 10 digits (standard Indian mobile), prepend prefix
  if (clean.length === 10) {
    const cleanPrefix = defaultPrefix.replace(/[^0-9]/g, '');
    clean = cleanPrefix + clean;
  }
  return clean;
}

/**
 * Build direct WhatsApp Web / App intent URL
 */
export function buildWhatsAppDirectUrl(phone: string, message: string, defaultPrefix = '+91'): string {
  const cleanPhone = sanitizeWhatsAppPhone(phone, defaultPrefix);
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
}

/**
 * Extract context variables from IBooking and IRRWhatsAppConfig
 */
export function extractBookingPlaceholders(
  booking: IBooking,
  config: IRRWhatsAppConfig,
  customInvoiceLink?: string
): Record<string, string> {
  const general = config.generalSettings;
  const customerName = `${booking.renterFirstName || ''} ${booking.renterSecondName || ''}`.trim() || 'Valued Customer';
  const customerPhone = booking.renterPhone || '';
  const bookingId = booking.id || '';
  const vehicleName = booking.vehicleName || 'Vehicle';
  const vehicleManufacturer = booking.vehicleManufacturer || '';
  const vehicleRegNo = booking.vehicleRegNo || '';

  const pickupDate = formatToIndianDateString(booking.pickupDateTime);
  const pickupTime = formatToTimeString(booking.pickupDateTime);
  const returnDate = formatToIndianDateString(booking.returnDateTime);
  const returnTime = formatToTimeString(booking.returnDateTime);

  const finalRentalAmount = booking.finalRentalAmount || booking.totalRentalAmount || '0';
  const amountPaid = booking.amountPaid || '0';
  const pendingAmount = booking.pendingAmount || '0';

  const companyName = general.companyName || 'RoadReady Car Rentals';
  const supportPhone = general.supportPhoneNumber || '+91 98765 43210';
  const depotAddress = general.depotAddress || 'Main Depot';

  return {
    customerName,
    customerPhone,
    bookingId,
    vehicleName,
    vehicleManufacturer,
    vehicleRegNo,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    finalRentalAmount,
    amountPaid,
    pendingAmount,
    invoiceLink: customInvoiceLink || 'https://roadready.com/invoice',
    companyName,
    supportPhone,
    depotAddress,
  };
}

/**
 * Interpolate placeholders in template text: {{variableName}}
 */
export function interpolateTemplate(
  templateText: string,
  variables: Record<string, string>
): string {
  if (!templateText) return '';
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}
