import { PrismaClient, PaymentAccountChannel, AppRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const cities = [
    { name: 'Lahore', slug: 'lahore' },
    { name: 'Karachi', slug: 'karachi' },
    { name: 'Islamabad', slug: 'islamabad' },
    { name: 'Rawalpindi', slug: 'rawalpindi' },
    { name: 'Faisalabad', slug: 'faisalabad' },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      create: city,
      update: { name: city.name, isActive: true },
    });
  }

  const lahore = await prisma.city.findUniqueOrThrow({ where: { slug: 'lahore' } });
  const areas = [
    { name: 'DHA', slug: 'dha' },
    { name: 'Gulberg', slug: 'gulberg' },
    { name: 'Johar Town', slug: 'johar-town' },
    { name: 'Model Town', slug: 'model-town' },
  ];
  for (const area of areas) {
    await prisma.area.upsert({
      where: { cityId_slug: { cityId: lahore.id, slug: area.slug } },
      create: { ...area, cityId: lahore.id },
      update: { name: area.name },
    });
  }

  const specialties = [
    { name: 'General Physician', slug: 'general-physician' },
    { name: 'Gynecologist', slug: 'gynecologist' },
    { name: 'Cardiologist', slug: 'cardiologist' },
    { name: 'Dermatologist', slug: 'dermatologist' },
    { name: 'Pediatrician', slug: 'pediatrician' },
    { name: 'Orthopedic', slug: 'orthopedic' },
    { name: 'ENT Specialist', slug: 'ent-specialist' },
    { name: 'Neurologist', slug: 'neurologist' },
  ];
  for (const [i, s] of specialties.entries()) {
    await prisma.specialty.upsert({
      where: { slug: s.slug },
      create: { ...s, sortOrder: i },
      update: { name: s.name, sortOrder: i, isActive: true },
    });
  }

  const instructionCount = await prisma.paymentInstruction.count();
  if (instructionCount === 0) {
    await prisma.paymentInstruction.createMany({
      data: [
        {
          channel: PaymentAccountChannel.JAZZCASH,
          accountTitle: 'Sehatdoc Payments',
          accountNumber: '03001234567',
          instructions:
            'Transfer the exact booking amount. Put your booking ID in the note, then upload the screenshot.',
          isActive: true,
          sortOrder: 1,
        },
        {
          channel: PaymentAccountChannel.BANK,
          accountTitle: 'Sehatdoc Pvt Ltd',
          accountNumber: '0123456789',
          bankName: 'HBL',
          iban: 'PK00HABB0000000123456789',
          instructions: 'Bank transfer / IBFT. Use booking ID as reference, then upload proof.',
          isActive: true,
          sortOrder: 2,
        },
      ],
    });
  }

  // Dev platform admin (phone login via OTP still required)
  const adminPhone = '+923001111111';
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    create: {
      phone: adminPhone,
      fullName: 'Platform Admin',
      roles: { create: [{ role: AppRole.PLATFORM_ADMIN }] },
    },
    update: { fullName: 'Platform Admin' },
    include: { roles: true },
  });
  if (!admin.roles.some((r) => r.role === AppRole.PLATFORM_ADMIN)) {
    await prisma.userRole.create({
      data: { userId: admin.id, role: AppRole.PLATFORM_ADMIN },
    });
  }

  // Touch bcrypt so seed fails loudly if bcrypt is broken
  await bcrypt.hash('seed-check', 4);

  console.log('Seed complete: cities, areas, specialties, payment instructions, admin phone', adminPhone);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
