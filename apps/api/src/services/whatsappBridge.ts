/**
 * WhatsApp Business API Bridge
 *
 * Sends structured complaint messages to brand WhatsApp numbers.
 * Uses the Meta WhatsApp Business API (Cloud API).
 *
 * Setup required:
 * 1. Create a Meta Business account
 * 2. Set up WhatsApp Business API
 * 3. Create message templates for complaint registration
 * 4. Get access token and phone number ID
 */

export async function sendComplaintWhatsApp(complaint: any, brand: any): Promise<void> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!apiUrl || !accessToken || !phoneNumberId) {
    throw new Error('WhatsApp API not configured');
  }

  const user = complaint.user || {};

  // Format the message
  const message = [
    `*MyComplain Service Request*`,
    `Ref: ${complaint.complaintNumber}`,
    ``,
    `*Customer:* ${user.fullName || 'N/A'}`,
    `*Phone:* ${user.phone || 'N/A'}`,
    `*City:* ${user.city || 'N/A'}`,
    `*Address:* ${user.address || complaint.serviceAddress || 'N/A'}`,
    ``,
    `*Product:* ${complaint.category?.name || 'N/A'}`,
    `*Model:* ${complaint.modelNumber || 'N/A'}`,
    `*Issue:* ${complaint.issueType?.replace(/_/g, ' ')}`,
    `*Description:* ${complaint.description}`,
    ``,
    `*Preferred Time:* ${complaint.preferredTime || 'Any'}`,
    ``,
    `Please acknowledge and assign a technician.`,
    `Reply with brand reference number.`,
  ].join('\n');

  // Send via WhatsApp Business API
  const response = await fetch(`${apiUrl}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: brand.whatsappNumber?.replace(/[^0-9]/g, ''),
      type: 'text',
      text: { body: message },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  console.log(`📱 WhatsApp complaint sent to ${brand.name}: ${complaint.complaintNumber}`);
}
