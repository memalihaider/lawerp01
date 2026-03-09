/**
 * seed-users.mjs
 * Creates test Firebase Auth users + Firestore profiles for all portal roles.
 * Run: node scripts/seed-users.mjs
 */

const API_KEY = "AIzaSyDYKT5wXPLlQvhFyrFqcr48ru-x0tCLCOo";
const PROJECT_ID = "lawfirmerp-8190c";

const USERS = [
  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    email: "admin@largifylawship.com",
    password: "Admin@1234",
    displayName: "Alex Admin",
    role: "admin",
  },
  // ── Staff ──────────────────────────────────────────────────────────────────
  {
    email: "partner@largifylawship.com",
    password: "Partner@1234",
    displayName: "Patricia Partner",
    role: "partner",
    jobTitle: "Senior Partner",
    phone: "+1 (555) 200-0001",
  },
  {
    email: "attorney@largifylawship.com",
    password: "Attorney@1234",
    displayName: "James Attorney",
    role: "attorney",
    jobTitle: "Associate Attorney",
    phone: "+1 (555) 200-0002",
  },
  {
    email: "paralegal@largifylawship.com",
    password: "Paralegal@1234",
    displayName: "Paula Paralegal",
    role: "paralegal",
    jobTitle: "Senior Paralegal",
    phone: "+1 (555) 200-0003",
  },
  {
    email: "staff@largifylawship.com",
    password: "Staff@1234",
    displayName: "Steve Staff",
    role: "staff",
    jobTitle: "Office Manager",
    phone: "+1 (555) 200-0004",
  },
  // ── Clients ────────────────────────────────────────────────────────────────
  {
    email: "client1@example.com",
    password: "Client@1234",
    displayName: "Robert Chen",
    role: "client",
    phone: "+1 (555) 300-0001",
    company: "Chen Enterprises Ltd.",
  },
  {
    email: "client2@example.com",
    password: "Client@1234",
    displayName: "Sarah Johnson",
    role: "client",
    phone: "+1 (555) 300-0002",
    company: "Johnson Holdings",
  },
];

// ── Firebase Auth REST: sign up a new user ──────────────────────────────────
async function createAuthUser(email, password, displayName) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (data.error) {
    if (data.error.message === "EMAIL_EXISTS") {
      // User exists – sign in to grab uid
      return signInUser(email, password);
    }
    throw new Error(`Auth error for ${email}: ${data.error.message}`);
  }
  return { uid: data.localId, idToken: data.idToken };
}

// ── Firebase Auth REST: sign in (returns uid for existing users) ────────────
async function signInUser(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(`SignIn error for ${email}: ${data.error.message}`);
  return { uid: data.localId, idToken: data.idToken };
}

// ── Firestore REST: write user profile doc ──────────────────────────────────
async function writeFirestoreProfile(uid, idToken, profile) {
  const fields = {};
  for (const [k, v] of Object.entries(profile)) {
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Firestore error for ${uid}: ${JSON.stringify(data.error)}`);
  return data;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱  Seeding Firebase users...\n");
  const results = [];

  for (const user of USERS) {
    const { email, password, displayName, role, ...extras } = user;
    try {
      const { uid, idToken } = await createAuthUser(email, password, displayName);

      const profile = {
        uid,
        email,
        displayName,
        role,
        createdAt: new Date().toISOString(),
        ...extras,
      };

      await writeFirestoreProfile(uid, idToken, profile);

      console.log(`✅  ${role.padEnd(10)} ${email}`);
      results.push({ role, email, password, uid });
    } catch (err) {
      console.error(`❌  ${email}: ${err.message}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("📋  TEST CREDENTIALS\n");

  const groups = { admin: [], staff: [], client: [] };
  for (const r of results) {
    if (r.role === "admin") groups.admin.push(r);
    else if (r.role === "client") groups.client.push(r);
    else groups.staff.push(r);
  }

  console.log("🔐  ADMIN PORTAL  →  http://localhost:3000/auth/login");
  groups.admin.forEach((u) => console.log(`   Email: ${u.email}  |  Password: ${u.password}`));

  console.log("\n👔  STAFF PORTAL  →  http://localhost:3000/auth/login");
  groups.staff.forEach((u) =>
    console.log(`   [${u.role}]  ${u.email}  |  Password: ${u.password}`)
  );

  console.log("\n👤  CLIENT PORTAL  →  http://localhost:3000/auth/register  OR  /auth/login");
  groups.client.forEach((u) =>
    console.log(`   ${u.email}  |  Password: ${u.password}`)
  );

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨  Done! All users redirect automatically after login.");
}

seed().catch(console.error);
