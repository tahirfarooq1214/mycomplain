// ============================================================
// MYCOMPLAIN — SHARED CONSTANTS
// ============================================================

export const APP_NAME = 'MyComplain';
export const APP_VERSION = '1.0.0';

// ── BRAND SEED DATA (Pakistan Market) ──────────────────────

export const BRANDS_SEED = [
  {
    name: 'Haier',
    helplineNumber: '0800-02345',
    serviceEmail: 'service@haier.com.pk',
    whatsappNumber: null,
    website: 'https://www.haier.com/pk/',
    integrationTier: 'email' as const,
    categories: ['refrigerator', 'washing_machine', 'ac', 'led_tv', 'microwave', 'water_dispenser'],
  },
  {
    name: 'PEL',
    helplineNumber: '0800-11735',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.pel.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['refrigerator', 'washing_machine', 'ac', 'microwave', 'water_dispenser'],
  },
  {
    name: 'Dawlance',
    helplineNumber: '111-111-229',
    serviceEmail: 'customercare@dawlance.com.pk',
    whatsappNumber: null,
    website: 'https://www.dawlance.com.pk/',
    integrationTier: 'email' as const,
    categories: ['refrigerator', 'washing_machine', 'ac', 'microwave', 'deep_freezer'],
  },
  {
    name: 'Samsung',
    helplineNumber: '0800-72678',
    serviceEmail: 'support@samsung.com',
    whatsappNumber: null,
    website: 'https://www.samsung.com/pk/',
    integrationTier: 'email' as const,
    categories: ['refrigerator', 'washing_machine', 'ac', 'led_tv', 'microwave'],
  },
  {
    name: 'TCL',
    helplineNumber: '0800-00825',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.tcl.com/pk/',
    integrationTier: 'manual' as const,
    categories: ['led_tv', 'ac', 'washing_machine', 'refrigerator'],
  },
  {
    name: 'Orient',
    helplineNumber: '111-676-676',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.orient.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['ac', 'led_tv', 'refrigerator', 'washing_machine', 'microwave', 'water_dispenser'],
  },
  {
    name: 'Gree',
    helplineNumber: '042-111-474-747',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.gree.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['ac'],
  },
  {
    name: 'Waves',
    helplineNumber: '0800-00928',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.waves.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['refrigerator', 'washing_machine', 'ac', 'microwave', 'water_dispenser'],
  },
  {
    name: 'Changhong Ruba',
    helplineNumber: '042-111-111-247',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.changhongruba.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['led_tv', 'ac', 'refrigerator', 'washing_machine'],
  },
  {
    name: 'LG',
    helplineNumber: '042-111-154-154',
    serviceEmail: 'lgservice@lge.com',
    whatsappNumber: null,
    website: 'https://www.lg.com/pk/',
    integrationTier: 'email' as const,
    categories: ['led_tv', 'refrigerator', 'washing_machine', 'ac', 'microwave'],
  },
  {
    name: 'Xiaomi',
    helplineNumber: '0800-00626',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.mi.com/pk/',
    integrationTier: 'manual' as const,
    categories: ['led_tv', 'air_purifier'],
  },
  {
    name: 'Ecostar',
    helplineNumber: '0800-32678',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.ecostar.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['led_tv', 'ac', 'refrigerator', 'washing_machine'],
  },
  {
    name: 'Super Asia',
    helplineNumber: '042-111-178-737',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.superasia.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['washing_machine', 'ac', 'water_dispenser', 'room_cooler'],
  },
  {
    name: 'Kenwood',
    helplineNumber: '0800-00-536',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.kenwood.com.pk/',
    integrationTier: 'manual' as const,
    categories: ['ac', 'refrigerator', 'washing_machine', 'microwave', 'led_tv'],
  },
];

// ── PRODUCT CATEGORIES ──────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  { id: 'refrigerator', name: 'Refrigerator', icon: '❄️' },
  { id: 'washing_machine', name: 'Washing Machine', icon: '🌀' },
  { id: 'ac', name: 'Air Conditioner', icon: '🌬️' },
  { id: 'led_tv', name: 'LED / TV', icon: '📺' },
  { id: 'microwave', name: 'Microwave Oven', icon: '🔥' },
  { id: 'water_dispenser', name: 'Water Dispenser', icon: '💧' },
  { id: 'deep_freezer', name: 'Deep Freezer', icon: '🧊' },
  { id: 'air_purifier', name: 'Air Purifier', icon: '💨' },
  { id: 'room_cooler', name: 'Room Cooler', icon: '🌊' },
  { id: 'ups_stabilizer', name: 'UPS / Stabilizer', icon: '⚡' },
  { id: 'geyser', name: 'Geyser / Water Heater', icon: '🔆' },
  { id: 'iron', name: 'Iron', icon: '👔' },
  { id: 'vacuum', name: 'Vacuum Cleaner', icon: '🧹' },
  { id: 'fan', name: 'Fan / Ceiling Fan', icon: '🌀' },
  { id: 'other', name: 'Other', icon: '🔧' },
];

// ── ISSUE TYPES ──────────────────────────────────────────────

export const ISSUE_TYPES = [
  { id: 'not_working', name: 'Not Working / Dead', icon: '🔴' },
  { id: 'electrical', name: 'Electrical Issue', icon: '⚡' },
  { id: 'noise_vibration', name: 'Noise / Vibration', icon: '🔊' },
  { id: 'leaking', name: 'Leaking', icon: '💧' },
  { id: 'cooling_issue', name: 'Cooling Issue', icon: '🧊' },
  { id: 'heating_issue', name: 'Heating Issue', icon: '🔥' },
  { id: 'physical_damage', name: 'Physical Damage', icon: '📦' },
  { id: 'display_issue', name: 'Display Issue', icon: '🖥️' },
  { id: 'performance', name: 'Poor Performance', icon: '📉' },
  { id: 'other', name: 'Other', icon: '🔧' },
];

// ── CITIES (Pakistan) ────────────────────────────────────────

export const CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sahiwal',
  'Abbottabad',
  'Mardan',
  'Sukkur',
  'Larkana',
  'Mingora',
  'Rahim Yar Khan',
];

// ── COMPLAINT NUMBER GENERATION ──────────────────────────────

export function generateComplaintNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MC-${datePart}-${randomPart}`;
}

// ── STATUS DISPLAY CONFIG ────────────────────────────────────

export const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  submitted: { label: 'Submitted', color: '#3B82F6', description: 'Your complaint has been received' },
  in_queue: { label: 'In Queue', color: '#F59E0B', description: 'Waiting to be processed by our team' },
  being_processed: { label: 'Being Processed', color: '#F59E0B', description: 'Our team is registering your complaint' },
  received_by_brand: { label: 'Received by Brand', color: '#8B5CF6', description: 'Brand has acknowledged your complaint' },
  registered_with_brand: { label: 'Registered with Brand', color: '#8B5CF6', description: 'Complaint registered at brand service center' },
  technician_assigned: { label: 'Technician Assigned', color: '#6366F1', description: 'A technician has been assigned to your case' },
  visit_scheduled: { label: 'Visit Scheduled', color: '#6366F1', description: 'Technician visit has been scheduled' },
  in_progress: { label: 'In Progress', color: '#0EA5E9', description: 'Your appliance is being repaired' },
  resolved: { label: 'Resolved', color: '#10B981', description: 'Your issue has been resolved!' },
  closed: { label: 'Closed', color: '#6B7280', description: 'This complaint has been closed' },
  escalated: { label: 'Escalated', color: '#EF4444', description: 'Your complaint has been escalated for priority resolution' },
  cancelled: { label: 'Cancelled', color: '#6B7280', description: 'This complaint was cancelled' },
  assigned_to_provider: { label: 'Assigned to Provider', color: '#8B5CF6', description: 'A service provider has been assigned' },
  provider_acknowledged: { label: 'Provider Acknowledged', color: '#6366F1', description: 'Service provider has accepted your request' },
  provider_en_route: { label: 'Provider En Route', color: '#0EA5E9', description: 'Technician is on the way' },
  diagnosis_complete: { label: 'Diagnosis Complete', color: '#0EA5E9', description: 'Issue has been diagnosed' },
  quote_sent: { label: 'Quote Sent', color: '#F59E0B', description: 'A repair quote has been sent for your approval' },
  quote_approved: { label: 'Quote Approved', color: '#10B981', description: 'You approved the repair quote' },
  repair_in_progress: { label: 'Repair In Progress', color: '#0EA5E9', description: 'Your appliance is being repaired' },
  repair_complete: { label: 'Repair Complete', color: '#10B981', description: 'Repair is complete!' },
};
