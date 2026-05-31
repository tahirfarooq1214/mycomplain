import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'refrigerator', name: 'Refrigerator', icon: '❄️' },
  { slug: 'washing_machine', name: 'Washing Machine', icon: '🌀' },
  { slug: 'ac', name: 'Air Conditioner', icon: '🌬️' },
  { slug: 'led_tv', name: 'LED / TV', icon: '📺' },
  { slug: 'microwave', name: 'Microwave Oven', icon: '🔥' },
  { slug: 'water_dispenser', name: 'Water Dispenser', icon: '💧' },
  { slug: 'deep_freezer', name: 'Deep Freezer', icon: '🧊' },
  { slug: 'air_purifier', name: 'Air Purifier', icon: '💨' },
  { slug: 'room_cooler', name: 'Room Cooler', icon: '🌊' },
  { slug: 'ups_stabilizer', name: 'UPS / Stabilizer', icon: '⚡' },
  { slug: 'geyser', name: 'Geyser / Water Heater', icon: '🔆' },
  { slug: 'iron', name: 'Iron', icon: '👔' },
  { slug: 'vacuum', name: 'Vacuum Cleaner', icon: '🧹' },
  { slug: 'fan', name: 'Fan / Ceiling Fan', icon: '🌀' },
  { slug: 'other', name: 'Other', icon: '🔧' },
];

const BRANDS: Array<{
  name: string;
  helplineNumber: string;
  serviceEmail: string | null;
  whatsappNumber: string | null;
  website: string;
  integrationTier: 'EMAIL' | 'WHATSAPP' | 'MANUAL' | 'API';
  categories: string[];
}> = [
  {
    name: 'Haier',
    helplineNumber: '0800-02345',
    serviceEmail: 'service@haier.com.pk',
    whatsappNumber: null,
    website: 'https://www.haier.com/pk/',
    integrationTier: 'EMAIL',
    categories: ['refrigerator', 'washing_machine', 'ac', 'led_tv', 'microwave', 'water_dispenser', 'deep_freezer'],
  },
  {
    name: 'PEL',
    helplineNumber: '0800-11735',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.pel.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['refrigerator', 'washing_machine', 'ac', 'microwave', 'water_dispenser', 'deep_freezer', 'fan'],
  },
  {
    name: 'Dawlance',
    helplineNumber: '111-111-229',
    serviceEmail: 'customercare@dawlance.com.pk',
    whatsappNumber: null,
    website: 'https://www.dawlance.com.pk/',
    integrationTier: 'EMAIL',
    categories: ['refrigerator', 'washing_machine', 'ac', 'microwave', 'deep_freezer'],
  },
  {
    name: 'Samsung',
    helplineNumber: '0800-72678',
    serviceEmail: 'support@samsung.com',
    whatsappNumber: null,
    website: 'https://www.samsung.com/pk/',
    integrationTier: 'EMAIL',
    categories: ['refrigerator', 'washing_machine', 'ac', 'led_tv', 'microwave'],
  },
  {
    name: 'TCL',
    helplineNumber: '0800-00825',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.tcl.com/pk/',
    integrationTier: 'MANUAL',
    categories: ['led_tv', 'ac', 'washing_machine', 'refrigerator'],
  },
  {
    name: 'Orient',
    helplineNumber: '111-676-676',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.orient.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['ac', 'led_tv', 'refrigerator', 'washing_machine', 'microwave', 'water_dispenser', 'fan'],
  },
  {
    name: 'Gree',
    helplineNumber: '042-111-474-747',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.gree.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['ac'],
  },
  {
    name: 'Waves',
    helplineNumber: '0800-00928',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.waves.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['refrigerator', 'washing_machine', 'ac', 'microwave', 'water_dispenser'],
  },
  {
    name: 'Changhong Ruba',
    helplineNumber: '042-111-111-247',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.changhongruba.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['led_tv', 'ac', 'refrigerator', 'washing_machine'],
  },
  {
    name: 'LG',
    helplineNumber: '042-111-154-154',
    serviceEmail: 'lgservice@lge.com',
    whatsappNumber: null,
    website: 'https://www.lg.com/pk/',
    integrationTier: 'EMAIL',
    categories: ['led_tv', 'refrigerator', 'washing_machine', 'ac', 'microwave'],
  },
  {
    name: 'Xiaomi',
    helplineNumber: '0800-00626',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.mi.com/pk/',
    integrationTier: 'MANUAL',
    categories: ['led_tv', 'air_purifier'],
  },
  {
    name: 'EcoStar',
    helplineNumber: '0800-32678',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.ecostar.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['led_tv', 'ac', 'refrigerator', 'washing_machine'],
  },
  {
    name: 'Super Asia',
    helplineNumber: '042-111-178-737',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.superasia.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['washing_machine', 'ac', 'water_dispenser', 'room_cooler', 'geyser', 'fan'],
  },
  {
    name: 'Kenwood',
    helplineNumber: '0800-00-536',
    serviceEmail: null,
    whatsappNumber: null,
    website: 'https://www.kenwood.com.pk/',
    integrationTier: 'MANUAL',
    categories: ['ac', 'refrigerator', 'washing_machine', 'microwave', 'led_tv'],
  },
];

async function main() {
  console.log('🌱 Seeding MyComplain database...\n');

  // Seed categories
  console.log('📦 Seeding product categories...');
  for (const cat of CATEGORIES) {
    await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`   ✅ ${CATEGORIES.length} categories seeded\n`);

  // Seed brands
  console.log('🏢 Seeding brands...');
  for (const brandData of BRANDS) {
    const { categories: catSlugs, ...brand } = brandData;

    const createdBrand = await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: brand,
    });

    // Link brand to categories
    for (const slug of catSlugs) {
      const category = await prisma.productCategory.findUnique({ where: { slug } });
      if (category) {
        await prisma.brandCategory.upsert({
          where: {
            brandId_categoryId: {
              brandId: createdBrand.id,
              categoryId: category.id,
            },
          },
          update: {},
          create: {
            brandId: createdBrand.id,
            categoryId: category.id,
          },
        });
      }
    }

    console.log(`   ✅ ${brand.name} (${brand.integrationTier}) — ${catSlugs.length} categories`);
  }

  // Create admin user
  console.log('\n👤 Creating admin user...');
  await prisma.user.upsert({
    where: { phone: '+920000000000' },
    update: {},
    create: {
      phone: '+920000000000',
      fullName: 'Admin',
      email: 'admin@mycomplain.pk',
      role: 'ADMIN',
    },
  });
  console.log('   ✅ Admin user created (phone: +920000000000)\n');

  // Create sample service provider
  console.log('🔧 Creating sample service provider...');
  await prisma.serviceProvider.upsert({
    where: { id: 'sample-provider-1' },
    update: {},
    create: {
      id: 'sample-provider-1',
      companyName: 'Taskers Company',
      contactPerson: 'Ali Ahmed',
      phone: '+923001234567',
      email: 'taskers@example.com',
      password: '$2b$10$placeholder', // TODO: hash properly
      city: 'Lahore',
      areasServed: ['DHA', 'Gulberg', 'Model Town', 'Johar Town', 'Bahria Town'],
      categoriesServed: ['ac', 'refrigerator', 'washing_machine', 'led_tv', 'microwave'],
      verificationStatus: 'VERIFIED',
      commissionRate: 15,
    },
  });
  console.log('   ✅ Sample provider created\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
