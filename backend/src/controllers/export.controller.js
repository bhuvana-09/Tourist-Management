const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const asyncHandler = require('../utils/asyncHandler');
const analyticsController = require('./analytics.controller');

// Helper to resolve report data by mocking the Express res object
const getReportData = async (report, from, to) => {
  let responseData = null;
  const mockReq = { query: { from, to } };
  const mockRes = {
    status: () => ({
      json: (payload) => {
        responseData = payload;
      }
    })
  };

  switch (report) {
    case 'overview':
      await analyticsController.getOverview(mockReq, mockRes);
      break;
    case 'revenue':
      await analyticsController.getRevenueTrend(mockReq, mockRes);
      break;
    case 'bookings':
      await analyticsController.getBookingsBreakdown(mockReq, mockRes);
      break;
    case 'destinations':
      await analyticsController.getTopDestinations(mockReq, mockRes);
      break;
    default:
      throw new Error('Invalid report type specified');
  }

  if (!responseData || !responseData.success) {
    throw new Error('Failed to retrieve analytics data');
  }

  return responseData.data;
};

// @desc    Export analytics reports in CSV, XLSX, or PDF formats
// @route   GET /api/analytics/export
// @access  Private (Admin Only)
const exportReport = asyncHandler(async (req, res) => {
  const { type = 'csv', report = 'overview', from, to } = req.query;

  // Retrieve raw data by calling the exact same aggregation queries
  const data = await getReportData(report, from, to);

  // Normalize data to arrays for formatting consistency
  let normalizedData = Array.isArray(data) ? data : [data];

  // 1. Export as CSV
  if (type === 'csv') {
    res.header('Content-Type', 'text/csv');
    res.attachment(`${report}_report_${new Date().toISOString().split('T')[0]}.csv`);

    if (normalizedData.length === 0) {
      return res.send('');
    }

    const fields = Object.keys(normalizedData[0]);
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(normalizedData);
    return res.send(csv);
  }

  // 2. Export as Excel (XLSX)
  if (type === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    if (normalizedData.length > 0) {
      const fields = Object.keys(normalizedData[0]);
      sheet.columns = fields.map(f => ({
        header: f.charAt(0).toUpperCase() + f.slice(1),
        key: f,
        width: 20
      }));

      // Add rows
      sheet.addRows(normalizedData);

      // Style header row
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' } // Dark blue
      };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${report}_report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    return res.end();
  }

  // 3. Export as PDF
  if (type === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${report}_report_${new Date().toISOString().split('T')[0]}.pdf`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // Title & Header info
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#1e3a8a').text('Tourist Portal Analytics', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#334155').text(`${report.toUpperCase()} REPORT`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text(`Export Date: ${new Date().toLocaleDateString()}`);
    if (from || to) {
      doc.text(`Filtered Range: ${from || 'All-Time'} to ${to || 'All-Time'}`);
    }
    doc.moveDown(1.5);

    // Render Data Table
    if (normalizedData.length === 0) {
      doc.fontSize(12).fillColor('#ef4444').text('No matching data found for the selected range.', { align: 'center' });
    } else {
      const keys = Object.keys(normalizedData[0]);
      
      // Draw Table Headers
      let startX = 40;
      let startY = doc.y;
      const colWidth = 520 / keys.length;

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e3a8a');
      keys.forEach((key, i) => {
        doc.text(key.toUpperCase(), startX + (i * colWidth), startY, { width: colWidth, align: 'left' });
      });

      doc.moveTo(startX, startY + 15).lineTo(560, startY + 15).strokeColor('#cbd5e1').stroke();
      doc.moveDown(1.2);

      // Draw Rows
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      normalizedData.forEach((row) => {
        const rowY = doc.y;
        keys.forEach((key, i) => {
          const val = row[key] !== null && row[key] !== undefined ? String(row[key]) : 'N/A';
          doc.text(val, startX + (i * colWidth), rowY, { width: colWidth, align: 'left' });
        });
        doc.moveDown(1.2);
      });
    }

    doc.end();
    return;
  }

  res.status(400).json({
    success: false,
    message: 'Unsupported export format'
  });
});

module.exports = {
  exportReport
};
