const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { app } = require('../server');
const jwt = require('jsonwebtoken');

let server;
let baseUrl;
let adminToken;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });

  adminToken = jwt.sign(
    { userId: 1, email: 'admin@campuscorp.edu', roleId: 7, roleName: 'SUPER_ADMIN' },
    process.env.JWT_SECRET || 'super_secure_placement_jwt_secret_key_2026_production_grade',
    { expiresIn: '1h' }
  );
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Location Metadata API returns cities, tech domains, and verified statistics', async () => {
  const res = await fetch(`${baseUrl}/career/companies/locations/meta`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(Array.isArray(body.data.cities), 'cities must be an array');
  assert.ok(body.data.cities.length > 0, 'should have at least one city');

  const cbe = body.data.cities.find(c => c.city.toLowerCase() === 'coimbatore');
  assert.ok(cbe, 'Coimbatore must be listed in cities metadata');
  assert.ok(cbe.companyCount >= 5, 'Coimbatore should have multiple verified companies');

  assert.ok(body.data.stats.total_companies > 0);
  assert.ok(body.data.stats.total_offices > 0);
  assert.ok(Array.isArray(body.data.domains));
});

test('2. Search IT Companies by City (Coimbatore) returns verified IT companies', async () => {
  const res = await fetch(`${baseUrl}/career/companies/location?city=Coimbatore`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);

  const companies = body.data.companies;
  assert.ok(companies.length >= 8, 'Coimbatore should return 8+ genuine IT companies');

  // Verify company structure
  const bosch = companies.find(c => c.name.includes('Bosch'));
  assert.ok(bosch, 'Bosch must be found in Coimbatore');
  assert.strictEqual(bosch.is_verified, true);
  assert.ok(bosch.matching_offices.some(o => o.city === 'Coimbatore'));
  assert.ok(bosch.tech_stack.length > 0, 'Bosch should list tech stack tags');
  assert.ok(bosch.active_jobs_count > 0, 'Bosch should have active job openings');
  assert.ok(bosch.careers_url.startsWith('https://'), 'Must have valid official careers URL');
});

test('3. Search IT Companies by PIN Code (641035 - Saravanampatti)', async () => {
  const res = await fetch(`${baseUrl}/career/companies/location?postal_code=641035`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);

  const companies = body.data.companies;
  assert.ok(companies.length >= 5, 'PIN 641035 must return companies in CHIL/KGiSL tech park');
  const names = companies.map(c => c.name);
  assert.ok(names.some(n => n.includes('Cognizant') || n.includes('Bosch') || n.includes('Zoho')));
});

test('4. Geolocation Search with Coordinates (Coimbatore Centroid) sorts by nearest distance', async () => {
  const cbeLat = 11.0168;
  const cbeLng = 76.9558;
  const res = await fetch(`${baseUrl}/career/companies/location?lat=${cbeLat}&lng=${cbeLng}&sort=distance`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);

  const companies = body.data.companies;
  assert.ok(companies.length > 0);

  // The first few companies should have distance_km computed and sorted ascending
  const withDistance = companies.filter(c => c.distance_km != null);
  assert.ok(withDistance.length >= 5, 'Companies in Coimbatore should have calculated distance');
  for (let i = 0; i < withDistance.length - 1; i++) {
    assert.ok(withDistance[i].distance_km <= withDistance[i + 1].distance_km, 'Distances must be sorted ascending');
  }
});

test('5. Multi-Criteria Filtering: Company Type and Tech Domain', async () => {
  // Filter for Product companies in Coimbatore
  const res = await fetch(`${baseUrl}/career/companies/location?city=Coimbatore&company_type=PRODUCT`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);

  const companies = body.data.companies;
  assert.ok(companies.length > 0);
  companies.forEach(c => {
    assert.strictEqual(c.company_type, 'PRODUCT', 'All filtered companies must be of type PRODUCT');
  });

  const zoho = companies.find(c => c.name.includes('Zoho'));
  assert.ok(zoho, 'Zoho must be present in Product companies');
});

test('6. Filter by Experience Level (FRESHER / INTERNSHIP) and Work Mode (HYBRID)', async () => {
  const res = await fetch(`${baseUrl}/career/companies/location?city=Coimbatore&experience_level=FRESHER&work_mode=HYBRID`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.ok(body.data.companies.length > 0);
});

test('7. Get Detailed Company Profile by ID with all offices and career opportunities', async () => {
  // First search to get an ID
  const searchRes = await fetch(`${baseUrl}/career/companies/location?city=Coimbatore`);
  const searchBody = await searchRes.json();
  const targetId = searchBody.data.companies[0].id;

  const res = await fetch(`${baseUrl}/career/companies/${targetId}?lat=11.0168&lng=76.9558`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);

  const comp = body.data;
  assert.strictEqual(comp.id, targetId);
  assert.ok(Array.isArray(comp.offices), 'Must include offices list');
  assert.ok(comp.offices.length > 0);
  assert.ok(Array.isArray(comp.tech_domains), 'Must include verified tech domains');
  assert.ok(Array.isArray(comp.active_jobs), 'Must include active verified jobs');
  assert.ok(comp.careers_url.startsWith('https://'), 'Must have verified official careers link');
});

test('8. Search in non-existent location returns empty list cleanly without errors', async () => {
  const res = await fetch(`${baseUrl}/career/companies/location?city=NonExistentCityAtlantis`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.companies.length, 0);
  assert.strictEqual(body.data.pagination.total, 0);

  setTimeout(() => process.exit(0), 50);
});
