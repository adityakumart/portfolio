import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IBooking, IRRStatusReportFilter, IRRStatusReportSummary } from '@portfolio/shared-types';
import { formatToIndianDate } from '../../../shared/pipes/indian-date.pipe';
import { RRApiService } from './rr-api.service';

@Injectable({
  providedIn: 'root',
})
export class RRReportExportService {
  private rrApi = inject(RRApiService);

  /**
   * Generates and downloads a high-fidelity PDF report
   */
  exportToPdf(
    bookings: IBooking[],
    summary: IRRStatusReportSummary,
    filter: IRRStatusReportFilter,
    filterLabel: string
  ): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentUser = this.rrApi.currentUser();
    const staffName = currentUser
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.id
      : 'Operator';
    const staffRole = currentUser?.role?.toUpperCase() || 'ADMIN';
    const nowStr = formatToIndianDate(new Date(), { includeTime: true });

    // --- Header Section ---
    doc.setFillColor(8, 145, 178); // Cyan-600
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('FLEET OPERATIONS & STATUS REPORT', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const headerRight = `Generated: ${nowStr} | By: ${staffName} (${staffRole})`;
    doc.text(headerRight, pageWidth - 14 - doc.getTextWidth(headerRight), 13);

    // --- Filter Scope & Metadata Box ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Scope: ${filterLabel}`, 14, 28);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const vehicleText = filter.vehicleRegNo && filter.vehicleRegNo !== 'all'
      ? `Vehicle: ${filter.vehicleRegNo}`
      : 'Vehicle: All Fleet';
    const statusText = filter.status && filter.status !== 'all'
      ? `Status: ${filter.status}`
      : 'Status: All Statuses';
    const paymentText = filter.paymentStatus && filter.paymentStatus !== 'all'
      ? `Payment: ${filter.paymentStatus === 'settled' ? 'Settled (No Due)' : 'Pending Balance'}`
      : 'Payment: All';
    doc.text(`${vehicleText}   |   ${statusText}   |   ${paymentText}`, 14, 33);

    // --- Summary KPI Cards (Horizontal Bar) ---
    const kpiY = 37;
    const kpiHeight = 16;
    const kpiCardWidth = (pageWidth - 28 - 25) / 6;

    const kpis = [
      { label: 'TOTAL BOOKINGS', val: String(summary.totalBookings) },
      { label: 'ACTIVE FLEET', val: String(summary.activeBookings) },
      { label: 'GROSS REVENUE', val: `Rs. ${summary.totalRevenue.toLocaleString('en-IN')}` },
      { label: 'COLLECTED', val: `Rs. ${summary.totalPaid.toLocaleString('en-IN')}` },
      { label: 'PENDING DUE', val: `Rs. ${summary.totalPending.toLocaleString('en-IN')}` },
      { label: 'DISTANCE LOGGED', val: `${summary.totalKilometers.toLocaleString('en-IN')} KM` },
    ];

    kpis.forEach((kpi, idx) => {
      const x = 14 + idx * (kpiCardWidth + 5);
      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.roundedRect(x, kpiY, kpiCardWidth, kpiHeight, 1.5, 1.5, 'FD');

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, x + 3, kpiY + 5.5);

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.val, x + 3, kpiY + 12.5);
    });

    // --- Table Data Preparation ---
    const tableColumns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Vehicle', dataKey: 'vehicle' },
      { header: 'Customer', dataKey: 'customer' },
      { header: 'Pickup Date', dataKey: 'pickup' },
      { header: 'Return Date', dataKey: 'return' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Total (Rs.)', dataKey: 'total' },
      { header: 'Paid (Rs.)', dataKey: 'paid' },
      { header: 'Balance (Rs.)', dataKey: 'balance' },
      { header: 'Distance', dataKey: 'distance' },
    ];

    const tableRows = bookings.map((b) => {
      const vehDisplay = b.vehicleRegNo
        ? `${b.vehicleRegNo} (${b.vehicleManufacturer || ''} ${b.vehicleName || ''})`.trim()
        : '—';
      const custDisplay = `${b.renterFirstName || ''} ${b.renterSecondName || ''}`.trim() +
        (b.renterPhone ? `\n${b.renterPhone}` : '');
      const pickupStr = formatToIndianDate(b.pickupDateTime, { includeTime: true, fallback: '—' });
      const returnStr = formatToIndianDate(b.returnDateTime, { includeTime: true, fallback: '—' });

      const odoStart = parseFloat(String(b.vehicleOdometerStart || '0')) || 0;
      const odoEnd = parseFloat(String(b.vehicleOdometerEnd || '0')) || 0;
      const kmRun = odoEnd > odoStart ? `${odoEnd - odoStart} KM` : '—';

      return {
        id: b.id || '—',
        vehicle: vehDisplay,
        customer: custDisplay,
        pickup: pickupStr,
        return: returnStr,
        status: (b.status || 'unknown').toUpperCase(),
        total: parseFloat(String(b.finalRentalAmount || '0')).toLocaleString('en-IN'),
        paid: parseFloat(String(b.amountPaid || '0')).toLocaleString('en-IN'),
        balance: parseFloat(String(b.pendingAmount || '0')).toLocaleString('en-IN'),
        distance: kmRun,
      };
    });

    autoTable(doc, {
      columns: tableColumns,
      body: tableRows,
      startY: kpiY + kpiHeight + 6,
      margin: { left: 14, right: 14, bottom: 15 },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 23, 42], // Slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Slate-50
      },
      columnStyles: {
        id: { cellWidth: 16, fontStyle: 'bold' },
        vehicle: { cellWidth: 46 },
        customer: { cellWidth: 38 },
        pickup: { cellWidth: 30 },
        return: { cellWidth: 30 },
        status: { cellWidth: 22, halign: 'center' },
        total: { cellWidth: 22, halign: 'right' },
        paid: { cellWidth: 20, halign: 'right' },
        balance: { cellWidth: 22, halign: 'right' },
        distance: { cellWidth: 22, halign: 'center' },
      },
      didDrawPage: (data) => {
        // Page footer with number
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        const footerText = `Page ${data.pageNumber} of ${pageCount}  |  Strictly Confidential  |  RoadReady Fleet Intelligence`;
        doc.text(footerText, 14, pageHeight - 6);
      },
    });

    const safeDate = formatToIndianDate(new Date()).replace(/[/\\?%*:|"<>]/g, '-');
    const safeScope = filterLabel.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
    const fileName = `Status_Report_${safeScope}_${safeDate}.pdf`;

    doc.save(fileName);
    this.rrApi.logReportDownload('PDF', `${filterLabel} (${fileName})`).catch(() => {});
  }

  /**
   * Generates and downloads a clean UTF-8 encoded CSV / Excel compatible spreadsheet
   */
  exportToCsv(
    bookings: IBooking[],
    summary: IRRStatusReportSummary,
    filter: IRRStatusReportFilter,
    filterLabel: string
  ): void {
    const nowStr = formatToIndianDate(new Date(), { includeTime: true });
    const escapeCsv = (str: string | number | null | undefined): string => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const lines: string[] = [];
    // Header & Metadata
    lines.push('FLEET OPERATIONS & STATUS REPORT');
    lines.push(`Report Scope,${escapeCsv(filterLabel)}`);
    lines.push(`Generated On,${escapeCsv(nowStr)}`);
    lines.push(`Total Bookings,${summary.totalBookings},Gross Revenue (INR),${summary.totalRevenue}`);
    lines.push(`Total Paid (INR),${summary.totalPaid},Outstanding Receivables (INR),${summary.totalPending}`);
    lines.push(`Total KM Logged,${summary.totalKilometers},Operating Hours,${summary.totalDurationHours}`);
    lines.push(''); // blank row

    // Table Column Headers
    const headers = [
      'Booking ID',
      'Vehicle Reg No',
      'Vehicle Make & Model',
      'Customer Full Name',
      'Customer Contact Phone',
      'Pickup Date & Time (DD-MM-YYYY)',
      'Return Date & Time (DD-MM-YYYY)',
      'Duration (Hours)',
      'Booking Status',
      'Total Rental Amount (INR)',
      'Amount Paid (INR)',
      'Pending Amount (INR)',
      'Payment Mode',
      'Deposit Type',
      'Start Odometer (KM)',
      'End Odometer (KM)',
      'Distance Run (KM)',
      'Creation Timestamp (DD-MM-YYYY)',
    ];
    lines.push(headers.map(escapeCsv).join(','));

    // Table Data Rows
    bookings.forEach((b) => {
      const odoStart = parseFloat(String(b.vehicleOdometerStart || '0')) || 0;
      const odoEnd = parseFloat(String(b.vehicleOdometerEnd || '0')) || 0;
      const kmRun = odoEnd > odoStart ? odoEnd - odoStart : 0;
      const fullName = `${b.renterFirstName || ''} ${b.renterSecondName || ''}`.trim();
      const vehMakeModel = `${b.vehicleManufacturer || ''} ${b.vehicleName || ''}`.trim();

      const row = [
        b.id || '',
        b.vehicleRegNo || '',
        vehMakeModel,
        fullName,
        b.renterPhone || '',
        formatToIndianDate(b.pickupDateTime, { includeTime: true, fallback: '' }),
        formatToIndianDate(b.returnDateTime, { includeTime: true, fallback: '' }),
        b.durationHours || '0',
        (b.status || '').toUpperCase(),
        b.finalRentalAmount || '0',
        b.amountPaid || '0',
        b.pendingAmount || '0',
        b.paymentMode || '',
        b.depositType || '',
        b.vehicleOdometerStart || '',
        b.vehicleOdometerEnd || '',
        kmRun,
        formatToIndianDate(b.createdAt, { includeTime: true, fallback: '' }),
      ];
      lines.push(row.map(escapeCsv).join(','));
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const safeDate = formatToIndianDate(new Date()).replace(/[/\\?%*:|"<>]/g, '-');
    const safeScope = filterLabel.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
    const fileName = `Status_Report_${safeScope}_${safeDate}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.rrApi.logReportDownload('CSV', `${filterLabel} (${fileName})`).catch(() => {});
  }
}
