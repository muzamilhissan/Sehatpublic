/**
 * Intensive Sehatdoc API integration suite against a running server.
 * Usage: node scripts/api-intensive-test.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3001/api/v1';
const { PrismaClient, VerificationStatus, SampleType } = require('@prisma/client');
const prisma = new PrismaClient();

const results = [];
let passed = 0;
let failed = 0;

function ok(name, detail = '') {
  passed++;
  results.push({ name, status: 'PASS', detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  failed++;
  results.push({ name, status: 'FAIL', detail: String(detail).slice(0, 500) });
  console.error(`✗ ${name} — ${detail}`);
}

async function req(method, path, { token, body, expectStatus } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (expectStatus !== undefined && res.status !== expectStatus) {
    const err = new Error(`Expected ${expectStatus} got ${res.status}: ${text.slice(0, 400)}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return { status: res.status, json };
}

async function login(phone, fullName) {
  await req('POST', '/auth/request-otp', { body: { phone }, expectStatus: 201 });
  const { json } = await req('POST', '/auth/verify-otp', {
    body: { phone, code: '123456', fullName },
    expectStatus: 201,
  });
  const data = json.data;
  if (!data?.accessToken) throw new Error(`Login failed for ${phone}: ${JSON.stringify(json)}`);
  return data;
}

function nextSlotIso(dayOfWeek = new Date().getDay()) {
  // Pick next occurrence of dayOfWeek at 10:00 Asia/Karachi ≈ UTC+5 → 05:00Z
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 0, 0));
  // advance until matching local day (Karachi = UTC+5)
  for (let i = 0; i < 14; i++) {
    const local = new Date(d.getTime() + 5 * 60 * 60 * 1000);
    if (local.getUTCDay() === dayOfWeek && d.getTime() > Date.now() + 60 * 60 * 1000) {
      return d.toISOString();
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  // fallback tomorrow 10:00 PKT
  const t = new Date(Date.now() + 24 * 60 * 60 * 1000);
  t.setUTCHours(5, 0, 0, 0);
  return t.toISOString();
}

async function ensureLabFixtures(cityId) {
  let lab = await prisma.lab.findFirst({
    where: { slug: 'api-test-lab', deletedAt: null },
  });
  if (!lab) {
    lab = await prisma.lab.create({
      data: {
        name: 'API Test Lab',
        slug: 'api-test-lab',
        address: 'Test Street, Lahore',
        cityId,
        homeCollection: true,
        homeCollectionFee: 300,
        verificationStatus: VerificationStatus.APPROVED,
        verifiedAt: new Date(),
        isActive: true,
      },
    });
  } else if (lab.verificationStatus !== VerificationStatus.APPROVED) {
    lab = await prisma.lab.update({
      where: { id: lab.id },
      data: { verificationStatus: VerificationStatus.APPROVED, isActive: true },
    });
  }

  let test = await prisma.labTest.findUnique({ where: { code: 'CBC-API' } });
  if (!test) {
    test = await prisma.labTest.create({
      data: {
        code: 'CBC-API',
        name: 'Complete Blood Count',
        category: 'Hematology',
        sampleType: SampleType.BLOOD,
        turnaroundHours: 24,
      },
    });
  }

  await prisma.labTestPrice.upsert({
    where: { labId_labTestId: { labId: lab.id, labTestId: test.id } },
    create: { labId: lab.id, labTestId: test.id, price: 1500, isAvailable: true },
    update: { price: 1500, isAvailable: true },
  });

  let hospital = await prisma.hospital.findFirst({ where: { slug: 'api-test-hospital' } });
  if (!hospital) {
    hospital = await prisma.hospital.create({
      data: {
        name: 'API Test Hospital',
        slug: 'api-test-hospital',
        address: 'Hospital Road',
        cityId,
        verificationStatus: VerificationStatus.APPROVED,
        verifiedAt: new Date(),
        isActive: true,
      },
    });
  }

  return { lab, test, hospital };
}

async function run() {
  console.log(`\n=== Sehatdoc intensive API tests @ ${BASE} ===\n`);

  // ── Health ──────────────────────────────────────────────────────────────
  try {
    const { json } = await req('GET', '/health', { expectStatus: 200 });
    if (json.success && json.data?.status === 'ok') ok('GET /health', json.data.database);
    else fail('GET /health', JSON.stringify(json));
  } catch (e) {
    fail('GET /health', e.message);
    console.error('Server unreachable — aborting');
    process.exit(1);
  }

  // ── Auth negatives ─────────────────────────────────────────────────────
  try {
    await req('POST', '/auth/request-otp', { body: { phone: 'bad' }, expectStatus: 400 });
    ok('POST /auth/request-otp rejects invalid phone', '400');
  } catch (e) {
    fail('POST /auth/request-otp rejects invalid phone', e.message);
  }

  try {
    await req('GET', '/patients/me', { expectStatus: 401 });
    ok('Protected route without token → 401');
  } catch (e) {
    fail('Protected route without token → 401', e.message);
  }

  // ── Logins ──────────────────────────────────────────────────────────────
  let admin, doctorUser, patient;
  try {
    admin = await login('03001111111', 'Platform Admin');
    ok('Admin OTP login', `roles=${admin.user.roles.join(',')}`);
  } catch (e) {
    fail('Admin OTP login', e.message);
  }

  try {
    doctorUser = await login('03002222222', 'Dr API Tester');
    ok('Doctor candidate OTP login');
  } catch (e) {
    fail('Doctor candidate OTP login', e.message);
  }

  try {
    patient = await login('03003333333', 'Patient API Tester');
    ok('Patient OTP login');
  } catch (e) {
    fail('Patient OTP login', e.message);
  }

  if (!admin || !doctorUser || !patient) {
    console.error('Auth failed — cannot continue core flows');
    await prisma.$disconnect();
    process.exit(1);
  }

  // ── Refresh / logout ────────────────────────────────────────────────────
  try {
    const { json } = await req('POST', '/auth/refresh', {
      body: { refreshToken: doctorUser.refreshToken },
      expectStatus: 201,
    });
    if (json.data?.accessToken) {
      doctorUser.accessToken = json.data.accessToken;
      doctorUser.refreshToken = json.data.refreshToken ?? doctorUser.refreshToken;
      ok('POST /auth/refresh');
    } else fail('POST /auth/refresh', JSON.stringify(json));
  } catch (e) {
    fail('POST /auth/refresh', e.message);
  }

  // ── Geo ─────────────────────────────────────────────────────────────────
  let cityId, areaId, specialtyId;
  try {
    const { json } = await req('GET', '/geo/cities', { expectStatus: 200 });
    const cities = json.data;
    if (!Array.isArray(cities) || cities.length < 1) throw new Error('no cities');
    const lahore = cities.find((c) => c.slug === 'lahore') || cities[0];
    cityId = lahore.id;
    ok('GET /geo/cities', `${cities.length} cities`);

    const areasRes = await req('GET', `/geo/cities/${cityId}/areas`, { expectStatus: 200 });
    const areas = areasRes.json.data;
    areaId = areas[0]?.id;
    ok('GET /geo/cities/:id/areas', `${areas.length} areas`);
  } catch (e) {
    fail('Geo endpoints', e.message);
  }

  try {
    await req('GET', '/geo/cities/00000000-0000-0000-0000-000000000000/areas', {
      expectStatus: 200,
    });
    // empty array ok
    ok('GET areas for unknown city returns empty/ok');
  } catch (e) {
    // some impls 404 — either acceptable if documented; record actual
    if (e.status === 404) ok('GET areas unknown city → 404');
    else fail('GET areas unknown city', e.message);
  }

  // specialties via prisma (no public specialties list API)
  const specialty = await prisma.specialty.findFirst({ where: { isActive: true } });
  specialtyId = specialty?.id;
  if (!specialtyId) fail('Seed specialty missing', 'run prisma:seed');
  else ok('Specialty fixture available', specialty.name);

  const fixtures = cityId ? await ensureLabFixtures(cityId) : null;
  if (fixtures) ok('Lab/hospital fixtures ready', fixtures.lab.slug);

  // ── Patients ────────────────────────────────────────────────────────────
  let dependentId, addressId;
  try {
    const { json } = await req('GET', '/patients/me', {
      token: patient.accessToken,
      expectStatus: 200,
    });
    if (json.data?.id) ok('GET /patients/me', json.data.id);
    else fail('GET /patients/me', JSON.stringify(json));
  } catch (e) {
    fail('GET /patients/me', e.message);
  }

  try {
    await req('PATCH', '/patients/me', {
      token: patient.accessToken,
      body: { gender: 'MALE', bloodGroup: 'B+', cityId },
      expectStatus: 200,
    });
    ok('PATCH /patients/me');
  } catch (e) {
    fail('PATCH /patients/me', e.message);
  }

  try {
    const { json } = await req('POST', '/patients/me/dependents', {
      token: patient.accessToken,
      body: { fullName: 'Child Tester', relation: 'CHILD', gender: 'FEMALE' },
      expectStatus: 201,
    });
    dependentId = json.data?.id;
    ok('POST /patients/me/dependents', dependentId);
  } catch (e) {
    fail('POST /patients/me/dependents', e.message);
  }

  try {
    const { json } = await req('GET', '/patients/me/dependents', {
      token: patient.accessToken,
      expectStatus: 200,
    });
    ok('GET /patients/me/dependents', `count=${json.data?.length}`);
  } catch (e) {
    fail('GET /patients/me/dependents', e.message);
  }

  try {
    const { json } = await req('POST', '/patients/me/addresses', {
      token: patient.accessToken,
      body: {
        label: 'Home',
        addressLine1: '123 Test Block',
        cityId,
        areaId,
        isDefault: true,
      },
      expectStatus: 201,
    });
    addressId = json.data?.id;
    ok('POST /patients/me/addresses', addressId);
  } catch (e) {
    fail('POST /patients/me/addresses', e.message);
  }

  try {
    await req('GET', '/patients/me/addresses', {
      token: patient.accessToken,
      expectStatus: 200,
    });
    ok('GET /patients/me/addresses');
  } catch (e) {
    fail('GET /patients/me/addresses', e.message);
  }

  // ── Doctors register → verify → availability ────────────────────────────
  let doctorId;
  try {
    // may already exist from prior runs
    const me = await req('GET', '/doctors/me', { token: doctorUser.accessToken });
    if (me.status === 200 && me.json.data?.id) {
      doctorId = me.json.data.id;
      ok('GET /doctors/me (existing)', doctorId);
    } else {
      const { json } = await req('POST', '/doctors/register', {
        token: doctorUser.accessToken,
        body: {
          title: 'Dr',
          pmcNumber: `PMC-API-${Date.now()}`,
          bio: 'Integration test doctor',
          yearsExperience: 8,
          consultationFee: 2000,
          followupFee: 1000,
          cityId,
          specialtyIds: [specialtyId],
        },
        expectStatus: 201,
      });
      doctorId = json.data?.id;
      ok('POST /doctors/register', doctorId);
    }
  } catch (e) {
    // conflict if already registered
    if (e.status === 409) {
      const me = await req('GET', '/doctors/me', {
        token: doctorUser.accessToken,
        expectStatus: 200,
      });
      doctorId = me.json.data.id;
      ok('POST /doctors/register already exists → use me', doctorId);
    } else fail('POST /doctors/register', e.message);
  }

  try {
    await req('PATCH', '/admin/doctors/' + doctorId + '/verify', {
      token: patient.accessToken,
      body: { status: 'APPROVED' },
      expectStatus: 403,
    });
    ok('Admin verify as patient → 403');
  } catch (e) {
    fail('Admin verify as patient → 403', e.message);
  }

  try {
    await req('PATCH', `/admin/doctors/${doctorId}/verify`, {
      token: admin.accessToken,
      body: { status: 'APPROVED' },
      expectStatus: 200,
    });
    ok('PATCH /admin/doctors/:id/verify APPROVED');
  } catch (e) {
    fail('PATCH /admin/doctors/:id/verify APPROVED', e.message);
  }

  try {
    await req('PATCH', `/admin/doctors/${doctorId}/verify`, {
      token: admin.accessToken,
      body: { status: 'REJECTED' },
      expectStatus: 400,
    });
    // missing rejectionReason
    ok('Verify REJECTED without reason → 400');
  } catch (e) {
    // if it allowed without reason that's a fail; if 400 good. If we already approved and it accepts REJECTED without reason:
    if (e.status === 200) fail('Verify REJECTED without reason should 400', 'got 200');
    else fail('Verify REJECTED without reason → 400', e.message);
  }

  // re-approve if rejected path ran differently
  await req('PATCH', `/admin/doctors/${doctorId}/verify`, {
    token: admin.accessToken,
    body: { status: 'APPROVED' },
  }).catch(() => {});

  try {
    await req('PATCH', '/doctors/me', {
      token: doctorUser.accessToken,
      body: { isAcceptingPatients: true, bio: 'Accepting patients for API tests' },
      expectStatus: 200,
    });
    ok('PATCH /doctors/me isAcceptingPatients=true');
  } catch (e) {
    fail('PATCH /doctors/me', e.message);
  }

  try {
    const windows = [];
    for (let d = 0; d <= 6; d++) {
      windows.push({
        dayOfWeek: d,
        startTime: '09:00',
        endTime: '17:00',
        slotMinutes: 30,
        mode: 'ONLINE',
      });
    }
    await req('POST', '/doctors/me/availability', {
      token: doctorUser.accessToken,
      body: { windows },
      expectStatus: 201,
    });
    ok('POST /doctors/me/availability (all week)');
  } catch (e) {
    fail('POST /doctors/me/availability', e.message);
  }

  try {
    const { json } = await req('GET', '/doctors?page=1&limit=10', { expectStatus: 200 });
    const found = (json.data || []).some((d) => d.id === doctorId);
    if (found) ok('GET /doctors lists approved doctor');
    else fail('GET /doctors lists approved doctor', 'doctor not in public list');
  } catch (e) {
    fail('GET /doctors', e.message);
  }

  try {
    await req('GET', `/doctors/${doctorId}`, { expectStatus: 200 });
    ok('GET /doctors/:id');
  } catch (e) {
    fail('GET /doctors/:id', e.message);
  }

  let scheduledStart;
  try {
    // find a date with slots in next 7 days
    let slots = [];
    for (let i = 1; i <= 7; i++) {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() + i);
      const dateStr = day.toISOString().slice(0, 10);
      const { json } = await req('GET', `/doctors/${doctorId}/slots?date=${dateStr}`, {
        expectStatus: 200,
      });
      const list = Array.isArray(json.data) ? json.data : json.data?.slots || [];
      if (list.length) {
        slots = list;
        scheduledStart = typeof list[0] === 'string' ? list[0] : list[0].start || list[0].scheduledStart;
        ok('GET /doctors/:id/slots', `${dateStr} → ${list.length} slots`);
        break;
      }
    }
    if (!scheduledStart) {
      scheduledStart = nextSlotIso();
      fail('GET /doctors/:id/slots', 'no slots returned; using synthetic time');
    }
  } catch (e) {
    scheduledStart = nextSlotIso();
    fail('GET /doctors/:id/slots', e.message);
  }

  // ── Hospitals / Labs public ─────────────────────────────────────────────
  try {
    const { json } = await req('GET', '/hospitals', { expectStatus: 200 });
    ok('GET /hospitals', `items=${json.data?.length ?? 0}`);
    if (fixtures?.hospital?.id) {
      await req('GET', `/hospitals/${fixtures.hospital.id}`, { expectStatus: 200 });
      ok('GET /hospitals/:id');
    }
  } catch (e) {
    fail('Hospitals endpoints', e.message);
  }

  try {
    const { json } = await req('GET', '/labs', { expectStatus: 200 });
    ok('GET /labs', `items=${json.data?.length ?? 0}`);
    await req('GET', '/labs/tests', { expectStatus: 200 });
    ok('GET /labs/tests');
    if (fixtures?.lab?.id) {
      await req('GET', `/labs/${fixtures.lab.id}`, { expectStatus: 200 });
      ok('GET /labs/:id');
    }
  } catch (e) {
    fail('Labs endpoints', e.message);
  }

  // ── Appointments + CASH payment ─────────────────────────────────────────
  let appointmentId;
  try {
    const { json } = await req('POST', '/appointments', {
      token: patient.accessToken,
      body: {
        doctorId,
        mode: 'ONLINE',
        scheduledStart,
        dependentId,
      },
      expectStatus: 201,
    });
    appointmentId = json.data?.id;
    ok('POST /appointments', `${appointmentId} status=${json.data?.status}`);
  } catch (e) {
    fail('POST /appointments', e.message);
  }

  try {
    await req('POST', '/appointments', {
      token: patient.accessToken,
      body: { doctorId, mode: 'ONLINE', scheduledStart },
      expectStatus: 409,
    });
    ok('POST /appointments duplicate slot → 409');
  } catch (e) {
    // 400 also acceptable
    if (e.status === 400) ok('POST /appointments duplicate slot → 400');
    else fail('POST /appointments duplicate slot', e.message);
  }

  try {
    await req('GET', '/appointments', { token: patient.accessToken, expectStatus: 200 });
    ok('GET /appointments');
    if (appointmentId) {
      await req('GET', `/appointments/${appointmentId}`, {
        token: patient.accessToken,
        expectStatus: 200,
      });
      ok('GET /appointments/:id');
    }
  } catch (e) {
    fail('GET appointments', e.message);
  }

  try {
    if (appointmentId) {
      await req('POST', '/payments/initiate', {
        token: patient.accessToken,
        body: {
          payableType: 'APPOINTMENT',
          payableId: appointmentId,
          method: 'CASH',
        },
        expectStatus: 201,
      });
      ok('POST /payments/initiate CASH');
      const { json } = await req('GET', `/appointments/${appointmentId}`, {
        token: patient.accessToken,
        expectStatus: 200,
      });
      if (json.data?.status === 'CONFIRMED') ok('Appointment confirmed after CASH');
      else fail('Appointment confirmed after CASH', `status=${json.data?.status}`);
    }
  } catch (e) {
    fail('CASH payment flow', e.message);
  }

  // ── Second appointment + MANUAL_TRANSFER + proof ────────────────────────
  let appointment2Id, paymentId, proofId;
  try {
    // next slot 30 min later or next day
    const start2 = new Date(new Date(scheduledStart).getTime() + 30 * 60 * 1000).toISOString();
    const { json } = await req('POST', '/appointments', {
      token: patient.accessToken,
      body: { doctorId, mode: 'ONLINE', scheduledStart: start2 },
      expectStatus: 201,
    });
    appointment2Id = json.data?.id;
    ok('POST /appointments #2 for transfer flow', appointment2Id);
  } catch (e) {
    // try another day
    try {
      const alt = new Date(new Date(scheduledStart).getTime() + 24 * 60 * 60 * 1000).toISOString();
      const { json } = await req('POST', '/appointments', {
        token: patient.accessToken,
        body: { doctorId, mode: 'ONLINE', scheduledStart: alt },
        expectStatus: 201,
      });
      appointment2Id = json.data?.id;
      ok('POST /appointments #2 (alt day)', appointment2Id);
    } catch (e2) {
      fail('POST /appointments #2', e2.message);
    }
  }

  let instructionId;
  try {
    const { json } = await req('GET', '/payments/instructions', { expectStatus: 200 });
    instructionId = json.data?.[0]?.id;
    ok('GET /payments/instructions', `count=${json.data?.length}`);
  } catch (e) {
    fail('GET /payments/instructions', e.message);
  }

  try {
    if (appointment2Id && instructionId) {
      const { json } = await req('POST', '/payments/initiate', {
        token: patient.accessToken,
        body: {
          payableType: 'APPOINTMENT',
          payableId: appointment2Id,
          method: 'MANUAL_TRANSFER',
          paymentInstructionId: instructionId,
        },
        expectStatus: 201,
      });
      paymentId = json.data?.id;
      if (json.data?.status === 'AWAITING_PROOF') ok('Initiate MANUAL_TRANSFER → AWAITING_PROOF');
      else fail('Initiate MANUAL_TRANSFER status', json.data?.status);
    }
  } catch (e) {
    fail('Initiate MANUAL_TRANSFER', e.message);
  }

  try {
    await req('POST', '/payments/initiate', {
      token: patient.accessToken,
      body: {
        payableType: 'APPOINTMENT',
        payableId: appointment2Id || '00000000-0000-0000-0000-000000000001',
        method: 'MANUAL_TRANSFER',
      },
      expectStatus: 400,
    });
    ok('MANUAL_TRANSFER without instructionId → 400');
  } catch (e) {
    fail('MANUAL_TRANSFER without instructionId → 400', e.message);
  }

  try {
    if (paymentId) {
      const { json } = await req('POST', `/payments/${paymentId}/proof`, {
        token: patient.accessToken,
        body: {
          storageKey: 'proofs/test-screenshot.jpg',
          fileName: 'screenshot.jpg',
          mimeType: 'image/jpeg',
          transferReference: 'TXN-API-001',
          amountClaimed: 2000,
        },
        expectStatus: 201,
      });
      if (json.data?.status === 'PENDING_VERIFICATION') ok('Upload payment proof → PENDING_VERIFICATION');
      else ok('Upload payment proof', `status=${json.data?.status}`);
    }
  } catch (e) {
    fail('Upload payment proof', e.message);
  }

  try {
    const { json } = await req('GET', '/payments/proofs/pending', {
      token: admin.accessToken,
      expectStatus: 200,
    });
    const list = json.data || [];
    proofId = list[0]?.id;
    ok('GET /payments/proofs/pending', `count=${list.length}`);
  } catch (e) {
    fail('GET /payments/proofs/pending', e.message);
  }

  try {
    if (proofId) {
      await req('POST', `/payments/proofs/${proofId}/review`, {
        token: admin.accessToken,
        body: { decision: 'APPROVE' },
        expectStatus: 201,
      });
      ok('POST /payments/proofs/:id/review APPROVE');
      if (appointment2Id) {
        const { json } = await req('GET', `/appointments/${appointment2Id}`, {
          token: patient.accessToken,
          expectStatus: 200,
        });
        if (json.data?.status === 'CONFIRMED') ok('Appointment #2 confirmed after proof approve');
        else fail('Appointment #2 confirmed after proof', `status=${json.data?.status}`);
      }
    } else {
      fail('Review proof', 'no pending proof id');
    }
  } catch (e) {
    fail('Review proof APPROVE', e.message);
  }

  // ── Lab order + cash ────────────────────────────────────────────────────
  let labOrderId;
  try {
    if (fixtures) {
      const { json } = await req('POST', '/lab-orders', {
        token: patient.accessToken,
        body: {
          labId: fixtures.lab.id,
          collectionType: 'WALK_IN',
          items: [{ labTestId: fixtures.test.id }],
        },
        expectStatus: 201,
      });
      labOrderId = json.data?.id;
      ok('POST /lab-orders', labOrderId);
      await req('GET', '/lab-orders', { token: patient.accessToken, expectStatus: 200 });
      ok('GET /lab-orders');
      await req('GET', `/lab-orders/${labOrderId}`, {
        token: patient.accessToken,
        expectStatus: 200,
      });
      ok('GET /lab-orders/:id');

      await req('POST', '/payments/initiate', {
        token: patient.accessToken,
        body: {
          payableType: 'LAB_ORDER',
          payableId: labOrderId,
          method: 'CASH',
        },
        expectStatus: 201,
      });
      ok('Pay lab order with CASH');
    }
  } catch (e) {
    fail('Lab order flow', e.message);
  }

  // ── Cancel appointment ──────────────────────────────────────────────────
  try {
    // book a third to cancel
    const start3 = new Date(new Date(scheduledStart).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const created = await req('POST', '/appointments', {
      token: patient.accessToken,
      body: { doctorId, mode: 'ONLINE', scheduledStart: start3 },
      expectStatus: 201,
    });
    const id3 = created.json.data.id;
    await req('PATCH', `/appointments/${id3}/cancel`, {
      token: patient.accessToken,
      body: { reason: 'Changed plans' },
      expectStatus: 200,
    });
    ok('PATCH /appointments/:id/cancel');
  } catch (e) {
    fail('Cancel appointment', e.message);
  }

  // ── Cleanup deletes ─────────────────────────────────────────────────────
  try {
    if (dependentId) {
      await req('DELETE', `/patients/me/dependents/${dependentId}`, {
        token: patient.accessToken,
        expectStatus: 200,
      });
      ok('DELETE /patients/me/dependents/:id');
    }
  } catch (e) {
    // soft delete may return 204
    if (e.status === 204) ok('DELETE dependent → 204');
    else fail('DELETE dependent', e.message);
  }

  try {
    if (addressId) {
      await req('DELETE', `/patients/me/addresses/${addressId}`, {
        token: patient.accessToken,
        expectStatus: 200,
      });
      ok('DELETE /patients/me/addresses/:id');
    }
  } catch (e) {
    if (e.status === 204) ok('DELETE address → 204');
    else fail('DELETE address', e.message);
  }

  try {
    await req('POST', '/auth/logout', {
      token: patient.accessToken,
      body: { refreshToken: patient.refreshToken },
      expectStatus: 201,
    });
    ok('POST /auth/logout');
  } catch (e) {
    // some return 200
    if (e.status === 200) ok('POST /auth/logout → 200');
    else fail('POST /auth/logout', e.message);
  }

  // ── 404s ────────────────────────────────────────────────────────────────
  try {
    await req('GET', '/doctors/00000000-0000-4000-8000-000000000099', { expectStatus: 404 });
    ok('GET /doctors/:id unknown → 404');
  } catch (e) {
    fail('GET /doctors/:id unknown → 404', e.message);
  }

  // Summary
  console.log(`\n=== Results: ${passed} passed, ${failed} failed, ${passed + failed} total ===\n`);
  await prisma.$disconnect();

  const fs = require('fs');
  const out = {
    base: BASE,
    at: new Date().toISOString(),
    passed,
    failed,
    total: passed + failed,
    results,
  };
  fs.writeFileSync('scripts/api-test-results.json', JSON.stringify(out, null, 2));
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
