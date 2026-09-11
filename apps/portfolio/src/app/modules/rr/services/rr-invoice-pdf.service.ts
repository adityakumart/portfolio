import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import * as QRCode from 'qrcode';

export function formatToIndianDate(dateStr: string): string {
  if (!dateStr || dateStr === '____' || dateStr === 'N/A') return dateStr;

  const separator = dateStr.includes('T') ? 'T' : dateStr.includes(' ') ? ' ' : null;
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
    const renterFatherName = b.renterFatherName || '____';
    const renterAddress = b.renterAddress || '____';
    const renterPhone = b.renterPhone || '____';
    const renterAltPhone = b.renterAltPhone || '-';
    const renterAadhar = b.renterAadhar || '____';
    const renterDL = b.renterDL || '____';

    const vehicleRegNo = b.vehicleRegNo || '____';
    const vehicleName = b.vehicleName || '____';
    const vehicleOdometerStart = b.vehicleOdometerStart || '____';

    const rawPickupDateTime = b.pickupDateTime || '____';
    const rawReturnDateTime = b.returnDateTime || '____';
    const pickupDateTime = formatToIndianDate(rawPickupDateTime);
    const returnDateTime = formatToIndianDate(rawReturnDateTime);
    const travelFrom = b.travelFrom || '____';
    const travelTo = b.travelTo || '____';

    const extraHourPrice = b.extraHourPrice || '____';
    const extraKmPrice = b.extraKmPrice || '____';

    // Use finalRentalAmount if present, else totalRentalAmount
    const rentalAmountVal =
      b.finalRentalAmount !== undefined && b.finalRentalAmount !== null
        ? b.finalRentalAmount
        : b.totalRentalAmount || '____';

    const paymentMode = b.paymentMode || '____';

    const guarFirstName = b.guarFirstName || '';
    const guarSecondName = b.guarSecondName || '';
    const guarFatherName = b.guarFatherName || '____';
    const guarAddress = b.guarAddress || '____';

    const depositType = b.depositType || 'none';

    const doc = new jsPDF({
      unit: 'mm',
      format: [216, 356],
    });

    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    try {
      const qrData = JSON.stringify({
        bookingId: id,
        vehicle: vehicleRegNo,
        renter: `${renterFirstName} ${renterSecondName}`.trim(),
        phone: renterPhone,
        pickup: pickupDateTime,
        return: returnDateTime,
        amount: rentalAmountVal,
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 100, margin: 1 });
      doc.addImage(qrCodeUrl, 'PNG', pageWidth - 35, 8, 24, 24);
    } catch (e) {
      console.warn('QR code generation for PDF skipped:', e);
    }

    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    const title1 = "RAM & RAM'S CAR RENTALS";
    doc.text(title1, (pageWidth - doc.getTextWidth(title1)) / 2, y);
    y += 7;

    doc.setFontSize(15);
    const title2 = 'RENTAL AGREEMENT';
    doc.text(title2, (pageWidth - doc.getTextWidth(title2)) / 2, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Renter Person Details:', 15, y);
    doc.text('Rented Vehicle Details:', 115, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');

    const leftX = 15;
    const rightX = 115;

    let depositValue = 'None';
    if (depositType === 'bike') {
      depositValue = `${b.bikeManufacturer || ''} - ${b.bikeModel || ''} (${b.bikeRegNo || ''})`;
    } else if (depositType === 'cash') {
      depositValue = `Rs. ${b.cashAmount || ''}`;
    } else if (depositType === 'other') {
      depositValue = `${b.otherItemName || ''} - Rs. ${b.otherItemValue || ''}`;
    }

    const renterPairs = [
      [
        'Name',
        (renterFirstName + ' ' + renterSecondName).trim() || '____',
        'Vehicle Reg No',
        vehicleRegNo,
      ],
      ['Father Name', renterFatherName, 'Vehicle Model', vehicleName],
      [
        'Alternate Phone',
        renterAltPhone,
        'Pickup Date & Time',
        pickupDateTime,
      ],
      [
        'Aadhar Number',
        renterAadhar,
        'Odometer Reading',
        vehicleOdometerStart,
      ],
      ['Driving License', renterDL, 'Return Date & Time', returnDateTime],
      [
        'Contact Number',
        renterPhone,
        'Rental Amount',
        `Rs. ${rentalAmountVal}`,
      ],
      ['Address', renterAddress, 'Security Deposit', depositValue],
      ['Payment Mode', paymentMode, '', ''],
    ];

    renterPairs.forEach(([label1, val1, label2, val2]) => {
      const leftText = label1 ? `${label1}: ${val1}` : '';
      const rightText = label2 ? `${label2}: ${val2}` : '';

      const leftWrapped = doc.splitTextToSize(leftText, 95);
      const rightWrapped = doc.splitTextToSize(rightText, 95);
      const lineCount = Math.max(leftWrapped.length, rightWrapped.length);

      for (let i = 0; i < lineCount; i++) {
        if (leftWrapped[i]) doc.text(leftWrapped[i], leftX, y);
        if (rightWrapped[i]) doc.text(rightWrapped[i], rightX, y);
        y += 5.5;
      }
    });

    y += 5;

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Guarantee Person Details:', 15, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');
    doc.text(
      `Name: ${(guarFirstName + ' ' + guarSecondName).trim() || '____'}`,
      leftX,
      y,
    );
    doc.text(`Father Name: ${guarFatherName}`, rightX, y);
    y += 5.5;
    doc.text(`Address: ${guarAddress}`, 15, y);
    y += 10;

    const pickupDate =
      rawPickupDateTime !== '____'
        ? formatToIndianDate(rawPickupDateTime.split('T')[0])
        : '____';
    const returnDate =
      rawReturnDateTime !== '____'
        ? formatToIndianDate(rawReturnDateTime.split('T')[0])
        : '____';
    const fullParagraph = `For my (Renter) need I hired your above-mentioned Vehicle for Self-Drive/Driver Assisted Car/Vehicle bearing registration number ${vehicleRegNo} from Dt. ${pickupDate} To Dt. ${returnDate} to travel from ${travelFrom} to ${travelTo}.`;

    doc.text(fullParagraph, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitParagraph = doc.splitTextToSize(fullParagraph, 185);
    y += splitParagraph.length * 5.5 + 4;

    const paraRest =
      'On my own assurance I will use the above-mentioned vehicle, I shall not use the vehicle for any illegal activities and also solely responsible for causing accidents or causing any damage to the vehicle. ' +
      'I will not give the vehicle to anyone other than myself without your permission. In case if any I am responsible for any actions taken by you, if I violate the Terms & Conditions mentioned in this Agreement. ' +
      "I can resolve them at my own expense. If any damage occurred to the vehicle, I'm responsible for that and I can resolve with my own expenses. Neither you (Owner of vehicle) nor your vehicle has any responsibility for the Illegal activities as stated above. " +
      'If any of my actions cause damage to you or your vehicle for that I am agreeing to compensate for the damage.';

    doc.text(paraRest, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitRest = doc.splitTextToSize(paraRest, 185);
    y += splitRest.length * 5.5 + 8;

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    const terms = [
      'No Insurance is claimed or paid, in case of any damage to vehicle I (Renter) bear the complete amount.',
      'I (Renter) is/am responsible for Half Clutch Failure.',
      'I (Renter) agree to any action on my Safety Deposit in case of any damages.',
      'I (Renter) agree that I am responsible for any Criminal / Legal Police Charges / Cases during rental period.',
      'I (Renter) agree to pay rent everyday if any damage to the vehicle untill the completion of the repair/damage.',
      'I (Renter) agree that Half-day booking must be done before 9AM and should be returned by 9PM same-day.',
      'Wrong Fuel: I take full responsibility for any engine failures due to wrong fuel type filled in the vehicle.',
    ];

    terms.forEach((t) => {
      doc.text('• ' + t, 18, y, { maxWidth: 185, lineHeightFactor: 1.35 });
      const splitT = doc.splitTextToSize('• ' + t, 185);
      y += splitT.length * 5.5;
    });

    y += 5;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Extra Fee Charged Slabs:', 15, y);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.text(`• Late Return Fee: Rs. ${extraHourPrice}/- per hour`, 18, y);
    y += 5.5;
    doc.text(`• Extra Kilometer Fee: Rs. ${extraKmPrice}/- per km`, 18, y);
    y += 5.5;
    doc.text(
      `• Cleanliness Fee: Rs. 500 to Rs. 1000 in case of dirty vehicle returns`,
      18,
      y,
    );
    y += 10;

    const yy = doc.internal.pageSize.getHeight() - 25;
    doc.text('Renter Signature: _______________________', 15, yy);
    doc.text('Authorized Representative: _______________________', 115, yy);

    doc.save(`Agreement_${id}.pdf`);
  }
}
