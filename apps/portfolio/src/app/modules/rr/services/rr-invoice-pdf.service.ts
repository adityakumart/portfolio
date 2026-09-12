import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export function formatToIndianDate(dateStr: string): string {
  if (!dateStr || dateStr === '________' || dateStr === 'N/A') return dateStr;

  const separator = dateStr.includes('T')
    ? 'T'
    : dateStr.includes(' ')
      ? ' '
      : null;
  if (separator) {
    const parts = dateStr.split(separator);
    const datePart = parts[0];
    const timePart = parts[1] || '';
    const dateParts = datePart.split('-');
    if (dateParts.length === 3 && dateParts[0].length === 4) {
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      return timePart ? `${formattedDate} ${timePart}` : formattedDate;
    }
    return dateStr;
  }

  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

@Injectable({
  providedIn: 'root',
})
export class RRInvoicePdfService {
  async printAgreementPdf(b: any): Promise<void> {
    if (!b) return;

    // Normalize all fields to avoid "undefined" strings in printed PDF
    const id = b.id || 'DRAFT';
    const renterFirstName = b.renterFirstName || '';
    const renterSecondName = b.renterSecondName || '';
    const renterFatherName = b.renterFatherName || '________';
    const renterAddress = b.renterAddress || '________';
    const renterPhone = b.renterPhone || '________';
    const renterAltPhone =
      b.renterAltPhone &&
      b.renterAltPhone !== '-' &&
      b.renterAltPhone !== '________'
        ? b.renterAltPhone
        : '';
    const renterAadhar = b.renterAadhar || '________';
    const renterDL = b.renterDL || '________';

    const vehicleRegNo = b.vehicleRegNo || '________';
    const vehicleName = b.vehicleName || '';
    const vehicleManufacturer = b.vehicleManufacturer || '';
    const vehicleModel = b.vehicleModel || '';

    let vehicleModelDisplay = '________';
    if (vehicleManufacturer && vehicleName && vehicleModel) {
      vehicleModelDisplay = `${vehicleManufacturer} - ${vehicleName} (${vehicleModel})`;
    } else if (vehicleManufacturer && vehicleName) {
      vehicleModelDisplay = `${vehicleManufacturer} - ${vehicleName}`;
    } else if (vehicleName && vehicleModel) {
      vehicleModelDisplay = `${vehicleName} (${vehicleModel})`;
    } else if (vehicleName) {
      vehicleModelDisplay = vehicleName;
    } else if (vehicleModel) {
      vehicleModelDisplay = vehicleModel;
    }

    const vehicleOdometerStart =
      b.vehicleOdometerStart !== undefined &&
      b.vehicleOdometerStart !== null &&
      b.vehicleOdometerStart !== ''
        ? String(b.vehicleOdometerStart).trim()
        : '________';
    const vehicleOdometerEnd =
      b.vehicleOdometerEnd !== undefined &&
      b.vehicleOdometerEnd !== null &&
      b.vehicleOdometerEnd !== ''
        ? String(b.vehicleOdometerEnd).trim()
        : '';

    const rawPickupDateTime = b.pickupDateTime || '________';
    const rawReturnDateTime = b.returnDateTime || '________';
    const travelFrom = b.travelFrom || '________';
    const travelTo = b.travelTo || '________';

    const extraHourPrice = b.extraHourPrice || '500';
    const extraKmPrice = b.extraKmPrice || '8';

    // Use finalRentalAmount if present, else totalRentalAmount
    const rentalAmountVal =
      b.finalRentalAmount !== undefined &&
      b.finalRentalAmount !== null &&
      b.finalRentalAmount !== ''
        ? b.finalRentalAmount
        : b.totalRentalAmount || '________';

    const paymentMode = b.paymentMode || '________';

    const guarFirstName = b.guarFirstName || '';
    const guarSecondName = b.guarSecondName || '';
    const guarFatherName = b.guarFatherName || '________';
    const guarAddress = b.guarAddress || '________';

    const depositType = b.depositType || 'none';

    const doc = new jsPDF({
      unit: 'mm',
      format: [216, 356],
    });

    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    const title1 = "RAM & RAM'S CAR RENTALS";
    doc.text(title1, (pageWidth - doc.getTextWidth(title1)) / 2, y);
    y += 6.5;

    doc.setFontSize(13);
    const title2 = 'AGREEMENT';
    doc.text(title2, (pageWidth - doc.getTextWidth(title2)) / 2, y);
    y += 9;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Renter Person Details:', 15, y);
    doc.text('Rented Vehicle Details:', 115, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');

    const leftX = 15;
    const rightX = 115;

    let depositValue = 'None';
    if (depositType === 'bike') {
      const bikeDetails = [b.bikeManufacturer, b.bikeModel]
        .filter(Boolean)
        .join(' - ');
      depositValue =
        `${bikeDetails}${b.bikeRegNo ? ` (${b.bikeRegNo})` : ''}` || 'None';
    } else if (depositType === 'cash') {
      depositValue = `Rs. ${b.cashAmount || ''}`;
    } else if (depositType === 'other') {
      depositValue = `${b.otherItemName || ''} - Rs. ${b.otherItemValue || ''}`;
    }

    const odoStartFormatted =
      vehicleOdometerStart && vehicleOdometerStart !== '________'
        ? String(vehicleOdometerStart).endsWith('kms')
          ? String(vehicleOdometerStart)
          : `${vehicleOdometerStart} kms`
        : '________';

    const odoEndFormatted =
      vehicleOdometerEnd && vehicleOdometerEnd !== '________'
        ? String(vehicleOdometerEnd).endsWith('kms')
          ? String(vehicleOdometerEnd)
          : `${vehicleOdometerEnd} kms`
        : '';

    const renterPairs: [string, string, string, string][] = [
      [
        'Name',
        (renterFirstName + ' ' + renterSecondName).trim() || '________',
        'Vehicle Registered Number',
        vehicleRegNo,
      ],
      ['Father Name', renterFatherName, 'Vehicle Model', vehicleModelDisplay],
      [
        'Alternate Contact Number',
        renterAltPhone,
        'Vehicle Pickup Date & Time',
        rawPickupDateTime,
      ],
      [
        'Aadhar Number',
        renterAadhar,
        'Odometer Reading - Pickup',
        odoStartFormatted,
      ],
      [
        'Driving License Number',
        renterDL,
        'Vehicle Return Date & Time',
        rawReturnDateTime,
      ],
      [
        'Contact Number',
        renterPhone,
        'Odometer Reading - Return',
        odoEndFormatted,
      ],
      ['Address', renterAddress, 'Rental Amount', `${rentalAmountVal}`],
      ['Security Deposit', depositValue, 'Payment Mode', paymentMode],
    ];

    renterPairs.forEach(([label1, val1, label2, val2]) => {
      const leftText = label1 ? `${label1}: ${val1}` : '';
      const rightText = label2 ? `${label2}: ${val2}` : '';

      const leftWrapped = doc.splitTextToSize(leftText, 95);
      const rightWrapped = doc.splitTextToSize(rightText, 90);
      const lineCount = Math.max(leftWrapped.length, rightWrapped.length);

      for (let i = 0; i < lineCount; i++) {
        if (leftWrapped[i]) doc.text(leftWrapped[i], leftX, y);
        if (rightWrapped[i]) doc.text(rightWrapped[i], rightX, y);
        y += 5.2;
      }
    });

    y += 4;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Guarantee Person Details:', 15, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(
      `Name: ${(guarFirstName + ' ' + guarSecondName).trim() || '________'}`,
      leftX,
      y,
    );
    doc.text(`Father Name: ${guarFatherName}`, rightX, y);
    y += 5.2;

    const guarAddressText = `Address: ${guarAddress}`;
    const guarAddressWrapped = doc.splitTextToSize(guarAddressText, 185);
    guarAddressWrapped.forEach((line: string) => {
      doc.text(line, leftX, y);
      y += 5.2;
    });

    y += 5;

    const pickupDate =
      rawPickupDateTime !== '________'
        ? rawPickupDateTime.includes('T')
          ? rawPickupDateTime.split('T')[0]
          : rawPickupDateTime.split(' ')[0]
        : '________';
    const returnDate =
      rawReturnDateTime !== '________'
        ? rawReturnDateTime.includes('T')
          ? rawReturnDateTime.split('T')[0]
          : rawReturnDateTime.split(' ')[0]
        : '________';

    const fullParagraph = `For my (Renter) need I hired your above-mentioned Vehicle for Self-Drive/Driver Assisted Car/Vehicle with bearing registered number ${vehicleRegNo} from Dt. ${pickupDate} To Dt. ${returnDate} to travel from ${travelFrom} to ${travelTo}.`;

    doc.text(fullParagraph, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitParagraph = doc.splitTextToSize(fullParagraph, 185);
    y += splitParagraph.length * 5.2 + 3.5;

    const paraRest =
      'On my own assurance I will use the above-mentioned vehicle, I shall not use the vehicle for any illegal activities and also solely responsible for causing accidents or causing any damage to the vehicle. ' +
      'I will not give the vehicle to anyone other than myself without your permission. In case if any I am responsible for any actions taken by you, if I violate the Terms & Conditions mentioned in this Agreement. ' +
      "I can resolve them at my own expense. If any damage occurred to the vehicle, I'm responsible for that and I can resolve with my own expenses. Neither you (Owner of vehicle) nor your vehicle has any responsibility for the Illegal activities as stated above. " +
      'If any of my actions cause damage to you or your vehicle for that I am agreeing to compensate for the damage.';

    doc.text(paraRest, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitRest = doc.splitTextToSize(paraRest, 185);
    y += splitRest.length * 5.2 + 5.5;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, y);
    y += 5.5;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(
      'I Agree and abide the following Terms & Conditions and completely responsible for the following,',
      15,
      y,
    );
    y += 5.2;

    const terms = [
      'No Insurance is claimed or paid, in case of any damage to vehicle I (Renter) bear the complete amount.',
      'I (Renter) is/am responsible for Half Clutch Failure.',
      'I (Renter) agree to any action on my Safety Deposit in case of any damages.',
      'I (Renter) agree that I am responsible for any Criminal / Legal Police Charges / Cases during rental period.',
      'I (Renter) agree to pay rent everyday if any damage to the vehicle untill the completion of the repair/damage.',
      'I (Renter) agree that Half-day booking must be done before 9AM and should be returned by 9PM same-day.',
      'I (Renter) is/am solely responsible to check/know whick type of fuel to be filled in the vehicle at the time of Pre-agreement documentation, in case of any Engine failure due to wrong fuel filled in the vehicle, I (Renter) will take the complete responsibility of the damage occured to the vehicle.',
    ];

    terms.forEach((t) => {
      const itemText = '• ' + t;
      doc.text(itemText, 18, y, { maxWidth: 182, lineHeightFactor: 1.3 });
      const splitT = doc.splitTextToSize(itemText, 182);
      y += splitT.length * 5.0;
    });

    y += 4;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Important Notice & Extra Fee Charged:', 15, y);
    y += 5.5;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');

    const extraHourText = `• Late Fee: Rs.${extraHourPrice}/- per hour`;
    const extraKmText = `• Extra Kilometer Fee: Rs.${extraKmPrice}/- per km`;

    const feeBullets = [
      '• Extension Fee: Extra Rs.1000/- per day + Rent Amount.',
      extraHourText,
      extraKmText,
      '• Cleanliness Fee: Rs.500 to Rs.1000.',
    ];

    feeBullets.forEach((f) => {
      doc.text(f, 18, y);
      y += 5.0;
    });

    y += 5.5;

    const declarations = [
      'I agree to keep my bike or item as Security Deposit until the complete settlement of the Rent or any damage after returning the rented Vehicle/Car.',
      'I have read all the Terms & conditions and Extra charges applied upon my rental of vehicle bearing above mentioned Registration number and aggreeing to this agreement.',
      'I agree to the legal action you may take against me if I act contrary to the above terms and conditions.',
      'I am signing this with my full consent.',
    ];

    declarations.forEach((d) => {
      doc.text(d, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
      const splitD = doc.splitTextToSize(d, 185);
      y += splitD.length * 5.0 + 2.5;
    });

    y += 12;

    doc.text('Renter Signature', 130, y);

    doc.save(`Agreement_${id}.pdf`);
  }
}
