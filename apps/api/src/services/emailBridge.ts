import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a structured complaint email to the brand's service center.
 * Formatted to include all information the brand needs to register the complaint.
 */
export async function sendComplaintEmail(complaint: any, brand: any): Promise<void> {
  const user = complaint.user || {};

  const emailBody = `
Dear ${brand.name} Service Team,

A customer has registered a service complaint through MyComplain. Please find the details below:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLAINT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Complaint Reference: ${complaint.complaintNumber}
Date Filed: ${new Date(complaint.createdAt).toLocaleDateString('en-PK', { dateStyle: 'full' })}

CUSTOMER INFORMATION:
  Name: ${user.fullName || 'N/A'}
  Phone: ${user.phone || 'N/A'}
  City: ${user.city || 'N/A'}
  Address: ${user.address || complaint.serviceAddress || 'N/A'}

PRODUCT INFORMATION:
  Category: ${complaint.category?.name || 'N/A'}
  Model Number: ${complaint.modelNumber || 'N/A'}
  Serial Number: ${complaint.serialNumber || 'N/A'}
  Purchase Date: ${complaint.purchaseDate ? new Date(complaint.purchaseDate).toLocaleDateString() : 'N/A'}
  Purchase Source: ${complaint.purchaseSource || 'N/A'}
  Dealer: ${complaint.dealerName || 'N/A'}

ISSUE DETAILS:
  Issue Type: ${complaint.issueType?.replace(/_/g, ' ') || 'N/A'}
  Description: ${complaint.description}

PREFERRED VISIT TIME: ${complaint.preferredTime || 'Any'}
${complaint.preferredDate ? `PREFERRED DATE: ${new Date(complaint.preferredDate).toLocaleDateString()}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please acknowledge receipt and assign a technician at your earliest convenience.
The customer can be reached directly at ${user.phone || 'the number above'}.

For status updates, please reply to this email with the brand reference number.

Thank you,
MyComplain Team
www.mycomplain.pk | support@mycomplain.pk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'MyComplain <service@mycomplain.pk>',
    to: brand.serviceEmail,
    subject: `[MyComplain] Service Request: ${complaint.complaintNumber} — ${complaint.category?.name || 'Appliance'} Issue`,
    text: emailBody,
    replyTo: 'complaints@mycomplain.pk',
  });
}
