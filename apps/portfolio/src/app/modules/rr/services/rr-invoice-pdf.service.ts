import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { maskAadhar } from '../shared/utils/aadhar-mask.util';

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
    const renterAadhar = maskAadhar(b.renterAadhar) || '________';
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
    const guarAadhar = b.guarAadhar ? maskAadhar(b.guarAadhar) : '';

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
    y += 8.5;

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
        y += 5.6;
      }
      y += 1.0;
    });

    y += 3;

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
    y += 5.8;

    if (guarAadhar) {
      doc.text(`Aadhar No: ${guarAadhar}`, leftX, y);
      y += 5.8;
    }

    const guarAddressText = `Address: ${guarAddress}`;
    const guarAddressWrapped = doc.splitTextToSize(guarAddressText, 185);
    guarAddressWrapped.forEach((line: string) => {
      doc.text(line, leftX, y);
      y += 5.8;
    });

    y += 3;

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

    doc.text(fullParagraph, 15, y, { maxWidth: 185, lineHeightFactor: 1.5 });
    const splitParagraph = doc.splitTextToSize(fullParagraph, 185);
    y += splitParagraph.length * 5.4 + 4;

    const paraRest =
      'On my own assurance I will use the above-mentioned vehicle, I shall not use the vehicle for any illegal activities and also solely responsible for causing accidents or causing any damage to the vehicle. ' +
      'I will not give the vehicle to anyone other than myself without your permission. In case if any I am responsible for any actions taken by you, if I violate the Terms & Conditions mentioned in this Agreement. ' +
      "I can resolve them at my own expense. If any damage occurred to the vehicle, I'm responsible for that and I can resolve with my own expenses. Neither you (Owner of vehicle) nor your vehicle has any responsibility for the Illegal activities as stated above. " +
      'If any of my actions cause damage to you or your vehicle for that I am agreeing to compensate for the damage.';

    doc.text(paraRest, 15, y, { maxWidth: 185, lineHeightFactor: 1.5 });
    const splitRest = doc.splitTextToSize(paraRest, 185);
    y += splitRest.length * 5.4 + 5;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(
      'I Agree and abide the following Terms & Conditions and completely responsible for the following,',
      15,
      y,
    );
    y += 5.8;

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
      doc.text(itemText, 18, y, { maxWidth: 182, lineHeightFactor: 1.45 });
      const splitT = doc.splitTextToSize(itemText, 182);
      y += splitT.length * 5.2 + 1.6;
    });

    y += 2;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Important Notice & Extra Fee Charged:', 15, y);
    y += 6;

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
      y += 5.6;
    });

    y += 3;

    const declarations = [
      'I agree to keep my bike or item as Security Deposit until the complete settlement of the Rent or any damage after returning the rented Vehicle/Car.',
      'I have read all the Terms & conditions and Extra charges applied upon my rental of vehicle bearing above mentioned Registration number and aggreeing to this agreement.',
      'I agree to the legal action you may take against me if I act contrary to the above terms and conditions.',
      'I am signing this with my full consent.',
    ];

    declarations.forEach((d) => {
      doc.text(d, 15, y, { maxWidth: 185, lineHeightFactor: 1.45 });
      const splitD = doc.splitTextToSize(d, 185);
      y += splitD.length * 5.2 + 2.0;
    });

    y += 8;

    doc.setFont('Helvetica', 'bold');
    doc.text('Renter Signature', 130, y);

    doc.save(`Agreement_${id}.pdf`);
  }

  async printInvoicePdf(b: any): Promise<void> {
    if (!b) return;

    const id = b.id || 'N/A';
    const renterName =
      `${b.renterFirstName || ''} ${b.renterSecondName || ''}`.trim() ||
      'Valued Customer';
    const renterPhone = b.renterPhone || 'N/A';
    const renterAltPhone =
      b.renterAltPhone && b.renterAltPhone !== '-' ? b.renterAltPhone : '';
    const renterFatherName = b.renterFatherName || 'N/A';
    const renterAadhar = maskAadhar(b.renterAadhar) || 'N/A';
    const renterDL = b.renterDL || 'N/A';
    const renterAddress = b.renterAddress || 'N/A';

    const vehicleRegNo = b.vehicleRegNo || 'N/A';
    const vehicleManufacturer = b.vehicleManufacturer || '';
    const vehicleName = b.vehicleName || '';
    const vehicleModel = b.vehicleModel || '';
    const fullVehicleTitle = [
      vehicleManufacturer,
      vehicleName,
      vehicleModel ? `(${vehicleModel})` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const odoStart = Number(b.vehicleOdometerStart) || 0;
    const odoEnd = Number(b.vehicleOdometerEnd) || odoStart;
    const totalKmsDriven = odoEnd >= odoStart ? odoEnd - odoStart : 0;
    const kmLimit = Number(b.totalKmLimit) || 0;

    const pickupDateTime = formatToIndianDate(b.pickupDateTime || '');
    const returnDateTimeActual = formatToIndianDate(
      b.returnDateTimeActual || b.returnDateTime || '',
    );

    const baseRent = Number(b.totalRentalAmount) || 0;
    const extraKmPrice = Number(b.extraKmPrice) || 8;
    const extraKms = Number(b.extraKmsTravelled) || 0;
    const extraKmFee = Number(b.extraKmFee) || 0;

    const extraHourPrice = Number(b.extraHourPrice) || 500;
    const extraHours = Number(b.extraHoursTaken) || 0;
    const extraHourFee = Number(b.extraHourFee) || 0;

    const cleanlinessFee = Number(b.cleanlinessFee) || 0;
    const challanaAmount = Number(b.challanaAmount) || 0;
    const tollAmount = Number(b.tollAmount) || 0;
    const challanTollTotal =
      Number(b.challanaTollFinesTotal) || challanaAmount + tollAmount;
    const nonIntimationFine = Number(b.nonIntimationFine) || 0;

    const damages = Array.isArray(b.damages) ? b.damages : [];
    const damagesTotal =
      Number(b.damagesTotal) ||
      damages.reduce((acc: number, d: any) => acc + (Number(d.amount) || 0), 0);

    const discount = Number(b.discount) || 0;
    const finalTotal = Number(b.finalRentalAmount) || 0;
    const amountPaid = Number(b.amountPaid) || 0;
    const pendingAmount = Number(b.pendingAmount) || 0;
    const paymentMode = b.paymentMode || 'Cash';
    const depositType = b.depositType || 'none';

    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210
    const pageHeight = doc.internal.pageSize.getHeight(); // 297
    const leftMargin = 14;
    const rightMargin = 196;
    const contentWidth = rightMargin - leftMargin; // 182

    // Top primary accent bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 5, 'F');
    doc.setFillColor(2, 132, 199); // cyan-600
    doc.rect(0, 5, pageWidth, 1.5, 'F');

    let y = 16;

    // Company Header Left
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("RAM & RAM'S CAR RENTALS", leftMargin, y);

    y += 5.5;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(
      'Premium Self-Drive Fleet & Corporate Mobility Solutions',
      leftMargin,
      y,
    );

    y += 4.5;
    doc.setFontSize(8);
    doc.text(
      'Helpdesk: +91 99887 76655  |  support@ramandrams.com  |  www.ramandrams.com',
      leftMargin,
      y,
    );

    // Header Right: Invoice Title & Metadata
    const headerRightX = 142;
    let rY = 16;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(2, 132, 199); // cyan-600
    doc.text('TAX INVOICE', headerRightX, rY);

    rY += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Invoice No: INV-${id}`, headerRightX, rY);

    rY += 4.5;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    doc.text(`Date: ${todayStr}`, headerRightX, rY);

    rY += 4.5;
    doc.text(`Booking Ref: #${id}`, headerRightX, rY);

    // Status Pill
    rY += 2;
    if (pendingAmount <= 0) {
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(52, 211, 153); // emerald-400
      doc.roundedRect(headerRightX, rY, 40, 6, 1.5, 1.5, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text('PAID IN FULL', headerRightX + 20, rY + 4.2, {
        align: 'center',
      });
    } else {
      doc.setFillColor(255, 241, 242); // rose-50
      doc.setDrawColor(251, 113, 133); // rose-400
      doc.roundedRect(headerRightX, rY, 52, 6, 1.5, 1.5, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text(
        `DUE: Rs. ${pendingAmount.toLocaleString('en-IN')}`,
        headerRightX + 26,
        rY + 4.2,
        { align: 'center' },
      );
    }

    y = Math.max(y + 8, rY + 11);

    // Divider Line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(leftMargin, y, rightMargin, y);
    y += 5;

    // Two Information Panels (Billed To vs Vehicle & Trip)
    const cardWidth = 88;
    const cardHeight = 48;
    const cardRadius = 2.5;

    // Left Card: Customer Details
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(
      leftMargin,
      y,
      cardWidth,
      cardHeight,
      cardRadius,
      cardRadius,
      'FD',
    );

    // Header bar inside left card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(leftMargin, y, cardWidth, 7, cardRadius, cardRadius, 'F');
    doc.rect(leftMargin, y + 4, cardWidth, 3, 'F'); // square bottom of card header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('BILLED TO (CUSTOMER DETAILS)', leftMargin + 4, y + 5);

    let cY = y + 12;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(renterName, leftMargin + 4, cY);

    cY += 5;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Phone: ${renterPhone}${renterAltPhone ? ` / ${renterAltPhone}` : ''}`,
      leftMargin + 4,
      cY,
    );

    cY += 4.8;
    doc.text(`Father Name: ${renterFatherName}`, leftMargin + 4, cY);

    cY += 4.8;
    doc.text(
      `Aadhar No: ${renterAadhar}  |  DL No: ${renterDL}`,
      leftMargin + 4,
      cY,
    );

    cY += 4.8;
    const addrLines = doc.splitTextToSize(
      `Address: ${renterAddress}`,
      cardWidth - 8,
    );
    addrLines.slice(0, 2).forEach((l: string) => {
      doc.text(l, leftMargin + 4, cY);
      cY += 4.4;
    });

    // Right Card: Vehicle & Trip Telemetry
    const rightCardX = leftMargin + cardWidth + 6; // 14 + 88 + 6 = 108
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(
      rightCardX,
      y,
      cardWidth,
      cardHeight,
      cardRadius,
      cardRadius,
      'FD',
    );

    // Header bar inside right card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(rightCardX, y, cardWidth, 7, cardRadius, cardRadius, 'F');
    doc.rect(rightCardX, y + 4, cardWidth, 3, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('VEHICLE & JOURNEY TELEMETRY', rightCardX + 4, y + 5);

    let vY = y + 12;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(fullVehicleTitle, rightCardX + 4, vY);

    vY += 5;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Reg No: ${vehicleRegNo}`, rightCardX + 4, vY);

    vY += 4.8;
    doc.text(`Pickup: ${pickupDateTime} (${odoStart} KM)`, rightCardX + 4, vY);

    vY += 4.8;
    doc.text(
      `Return: ${returnDateTimeActual} (${odoEnd} KM)`,
      rightCardX + 4,
      vY,
    );

    vY += 4.8;
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Distance: ${totalKmsDriven} KM`, rightCardX + 4, vY);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`(Allotted Limit: ${kmLimit} KM)`, rightCardX + 50, vY);

    y += cardHeight + 6;

    // Itemized Table Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(leftMargin, y, contentWidth, 7, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('#', leftMargin + 3, y + 4.8);
    doc.text('CHARGE DESCRIPTION', leftMargin + 12, y + 4.8);
    doc.text('RATE / BASIS', leftMargin + 105, y + 4.8);
    doc.text('AMOUNT (INR)', rightMargin - 4, y + 4.8, { align: 'right' });

    y += 7;

    // Table Line Items List
    const lineItems: {
      desc: string;
      basis: string;
      amount: number;
      isDeduction?: boolean;
    }[] = [
      {
        desc: `Base Rental Tariff (${b.durationDays || 0} Day(s), ${
          b.durationHours || 0
        } Hr(s))`,
        basis: `Plan Package`,
        amount: baseRent,
      },
    ];

    if (extraKms > 0 || extraKmFee > 0) {
      lineItems.push({
        desc: `Extra Kilometers Overrun`,
        basis: `${extraKms} KM @ Rs. ${extraKmPrice}/KM`,
        amount: extraKmFee,
      });
    }

    if (extraHours > 0 || extraHourFee > 0) {
      lineItems.push({
        desc: `Extra Time / Late Handover Fee`,
        basis: `${extraHours} Hr(s) @ Rs. ${extraHourPrice}/HR`,
        amount: extraHourFee,
      });
    }

    if (cleanlinessFee > 0) {
      lineItems.push({
        desc: `Cleanliness & Interior Sanitization Fee`,
        basis: `Vehicle Detailing`,
        amount: cleanlinessFee,
      });
    }

    if (challanTollTotal > 0) {
      lineItems.push({
        desc: `FASTag Tolls, Traffic Challans & Penalties`,
        basis: `Electronic Transit Fee`,
        amount: challanTollTotal,
      });
    }

    if (damagesTotal > 0) {
      const descList = damages
        .map(
          (d: any) => `${d.description || d.desc || 'Repair'} (Rs.${d.amount})`,
        )
        .join(', ');
      lineItems.push({
        desc: `Vehicle Damage & Repair Assessments`,
        basis: descList
          ? descList.length > 35
            ? descList.slice(0, 32) + '...'
            : descList
          : 'Physical Damages',
        amount: damagesTotal,
      });
    }

    if (nonIntimationFine > 0) {
      lineItems.push({
        desc: `Non-Intimation Delay Surcharge`,
        basis: `Overtime Penalty`,
        amount: nonIntimationFine,
      });
    }

    if (discount > 0) {
      lineItems.push({
        desc: `Promotional Rebate / Discount`,
        basis: `Special Voucher`,
        amount: discount,
        isDeduction: true,
      });
    }

    // Render Table Rows
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);

    lineItems.forEach((item, index) => {
      const isEven = index % 2 === 0;
      doc.setFillColor(
        isEven ? 255 : 248,
        isEven ? 255 : 250,
        isEven ? 255 : 252,
      );
      doc.rect(leftMargin, y, contentWidth, 7.5, 'F');

      doc.setTextColor(100, 116, 139);
      doc.text(String(index + 1), leftMargin + 3, y + 5.1);

      doc.setTextColor(30, 41, 59);
      doc.text(item.desc, leftMargin + 12, y + 5.1);

      doc.setTextColor(100, 116, 139);
      doc.text(item.basis, leftMargin + 105, y + 5.1);

      doc.setFont('Helvetica', 'bold');
      if (item.isDeduction) {
        doc.setTextColor(22, 163, 74); // green-600
        doc.text(
          `- Rs. ${item.amount.toLocaleString('en-IN')}`,
          rightMargin - 4,
          y + 5.1,
          { align: 'right' },
        );
      } else {
        doc.setTextColor(15, 23, 42);
        doc.text(
          `Rs. ${item.amount.toLocaleString('en-IN')}`,
          rightMargin - 4,
          y + 5.1,
          { align: 'right' },
        );
      }
      doc.setFont('Helvetica', 'normal');

      // Subtle bottom line
      doc.setDrawColor(241, 245, 249);
      doc.line(leftMargin, y + 7.5, rightMargin, y + 7.5);

      y += 7.5;
    });

    y += 4;

    // Bottom Section: Left (Security Deposit & Notes) + Right (Financial Summary Box)
    const summaryWidth = 85;
    const summaryX = rightMargin - summaryWidth; // 196 - 85 = 111
    const summaryHeight = 48;

    // Left: Security Deposit & Handover Note Box
    const noteWidth = summaryX - leftMargin - 6; // 111 - 14 - 6 = 91
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(leftMargin, y, noteWidth, summaryHeight, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('SECURITY DEPOSIT & HANDOVER CLEARANCE', leftMargin + 4, y + 6);

    let depY = y + 13;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    let depText = 'No security deposit was held for this booking.';
    if (depositType === 'bike') {
      const bikeStr = [
        b.bikeManufacturer,
        b.bikeModel,
        b.bikeRegNo ? `(${b.bikeRegNo})` : '',
      ]
        .filter(Boolean)
        .join(' ');
      depText = `Vehicle Deposit: ${
        bikeStr || 'Two-Wheeler'
      } has been returned and released back to the customer upon inspection.`;
    } else if (depositType === 'cash') {
      depText = `Cash Deposit of Rs. ${
        b.cashAmount || '0'
      } has been adjusted / returned upon complete account settlement.`;
    } else if (depositType === 'other') {
      depText = `Physical Deposit (${
        b.otherItemName || 'Item'
      }) released back to customer.`;
    }

    const splitDep = doc.splitTextToSize(depText, noteWidth - 8);
    splitDep.forEach((l: string) => {
      doc.text(l, leftMargin + 4, depY);
      depY += 4.8;
    });

    depY += 2;
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('[Handover Inspection Verified & Cleared]', leftMargin + 4, depY);

    // Right: Summary Computation Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(summaryX, y, summaryWidth, summaryHeight, 2, 2, 'FD');

    let sY = y + 6.5;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Total Rental & Charges:', summaryX + 4, sY);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Rs. ${(baseRent + Number(b.totalAdditionalFees || 0)).toLocaleString(
        'en-IN',
      )}`,
      rightMargin - 4,
      sY,
      { align: 'right' },
    );

    if (discount > 0) {
      sY += 5.2;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(22, 163, 74);
      doc.text('Discount Applied:', summaryX + 4, sY);
      doc.setFont('Helvetica', 'bold');
      doc.text(
        `- Rs. ${discount.toLocaleString('en-IN')}`,
        rightMargin - 4,
        sY,
        { align: 'right' },
      );
    }

    sY += 5.2;
    doc.setDrawColor(226, 232, 240);
    doc.line(summaryX + 4, sY, rightMargin - 4, sY);

    sY += 5.2;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Grand Total Payable:', summaryX + 4, sY);
    doc.text(`Rs. ${finalTotal.toLocaleString('en-IN')}`, rightMargin - 4, sY, {
      align: 'right',
    });

    sY += 5.2;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Total Amount Paid:', summaryX + 4, sY);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`Rs. ${amountPaid.toLocaleString('en-IN')}`, rightMargin - 4, sY, {
      align: 'right',
    });

    sY += 5.2;
    doc.setDrawColor(226, 232, 240);
    doc.line(summaryX + 4, sY, rightMargin - 4, sY);

    sY += 5.5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    if (pendingAmount <= 0) {
      doc.setTextColor(5, 150, 105);
      doc.text('Balance Due:', summaryX + 4, sY);
      doc.text('Rs. 0 (Fully Settled)', rightMargin - 4, sY, {
        align: 'right',
      });
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text('Balance Due / Outstanding:', summaryX + 4, sY);
      doc.text(
        `Rs. ${pendingAmount.toLocaleString('en-IN')}`,
        rightMargin - 4,
        sY,
        { align: 'right' },
      );
    }

    sY += 4.8;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Settlement Mode: ${paymentMode}`, summaryX + 4, sY);

    y += summaryHeight + 8;

    // Signatures Section
    const sigY = y + 14;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(leftMargin + 5, sigY, leftMargin + 65, sigY);
    doc.line(rightMargin - 65, sigY, rightMargin - 5, sigY);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Customer Signature', leftMargin + 35, sigY + 4.5, {
      align: 'center',
    });
    doc.text('Authorized Signatory & Stamp', rightMargin - 35, sigY + 4.5, {
      align: 'center',
    });

    // Bottom Footer note
    y = pageHeight - 12;
    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, y, rightMargin, y);

    y += 4.5;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      "Thank you for traveling with RoadReady Rental's Car Rentals. Drive responsibly and safely!",
      pageWidth / 2,
      y,
      { align: 'center' },
    );
    doc.text(
      'This is a computer-generated tax invoice and requires no physical seal.',
      pageWidth / 2,
      y + 3.5,
      {
        align: 'center',
      },
    );

    doc.save(`Invoice_${id}.pdf`);
  }
}
