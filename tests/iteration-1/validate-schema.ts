/**
 * FurnSpace – Iteration 1 Schema Validation Script
 *
 * Run with:
 *   npx tsx tests/iteration-1/validate-schema.ts
 *
 * Prerequisites:
 *   - .env.local contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - schema.sql, seed.sql, triggers.sql, rls-policies.sql, storage-policies.sql
 *     have already been executed in the Supabase SQL Editor
 */

import * as dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------
const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("FATAL: .env.local not found at", envPath);
  process.exit(1);
}
dotenv.config({ path: envPath });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function pass(name: string, message = "OK"): void {
  results.push({ name, passed: true, message });
}

function fail(name: string, message: string): void {
  results.push({ name, passed: false, message });
}

// ---------------------------------------------------------------------------
// AC5 – Environment variable format check
// ---------------------------------------------------------------------------
function checkEnvVars(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.trim() === "") {
    fail("AC5 env vars", "NEXT_PUBLIC_SUPABASE_URL is missing or empty");
    return null;
  }
  if (!anonKey || anonKey.trim() === "") {
    fail("AC5 env vars", "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or empty");
    return null;
  }

  const urlPattern = /^https:\/\/.+\.supabase\.co$/;
  if (!urlPattern.test(url)) {
    fail(
      "AC5 env vars",
      `NEXT_PUBLIC_SUPABASE_URL does not match expected format (https://<project>.supabase.co): ${url}`
    );
    return null;
  }

  // Supabase anon keys are JWT tokens — start with "eyJ"
  if (!anonKey.startsWith("eyJ")) {
    fail(
      "AC5 env vars",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY does not look like a valid JWT (should start with 'eyJ')"
    );
    return null;
  }

  pass("AC5 env vars", `URL=${url}`);
  return { url, anonKey };
}

// ---------------------------------------------------------------------------
// AC1 – All 5 tables exist (readable by anon client)
// ---------------------------------------------------------------------------
async function checkTablesExist(supabase: SupabaseClient): Promise<void> {
  const tables = ["categories", "products", "users", "orders", "order_items"] as const;

  for (const table of tables) {
    // A SELECT with limit 0 verifies the table exists and anon can query it.
    const { error } = await supabase.from(table).select("id").limit(0);
    if (error) {
      fail(`AC1 table:${table}`, `Query failed: ${error.message}`);
    } else {
      pass(`AC1 table:${table}`);
    }
  }
}

// ---------------------------------------------------------------------------
// AC1 RLS – Anon INSERT into products must be blocked
// ---------------------------------------------------------------------------
async function checkRlsBlocksAnonInsert(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.from("products").insert({
    category_id: "a1000000-0000-0000-0000-000000000001",
    name: "RLS Test Product",
    slug: "rls-test-product",
    description: "Should be rejected by RLS",
    price: 1,
    stock_quantity: 0,
  });

  if (error) {
    // Any error (RLS violation, permission denied) means the insert was blocked.
    pass("AC1 RLS anon insert blocked", `Blocked with: ${error.message}`);
  } else {
    fail(
      "AC1 RLS anon insert blocked",
      "Anon INSERT into products succeeded — RLS is NOT enforced"
    );
  }
}

// ---------------------------------------------------------------------------
// AC3 – Product count >= 18 and category count == 6
// ---------------------------------------------------------------------------
async function checkSeedData(supabase: SupabaseClient): Promise<void> {
  // Products
  const { count: productCount, error: productError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  if (productError) {
    fail("AC3 product count", `Query failed: ${productError.message}`);
  } else if (productCount === null) {
    fail("AC3 product count", "Could not retrieve product count");
  } else if (productCount < 18) {
    fail("AC3 product count", `Expected >= 18 products, found ${productCount}`);
  } else {
    pass("AC3 product count", `${productCount} products found`);
  }

  // Categories — note: categories are not filtered by is_active so anon can
  // read them via the public SELECT policy.
  const { count: categoryCount, error: categoryError } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  if (categoryError) {
    fail("AC3 category count", `Query failed: ${categoryError.message}`);
  } else if (categoryCount === null) {
    fail("AC3 category count", "Could not retrieve category count");
  } else if (categoryCount !== 6) {
    fail("AC3 category count", `Expected exactly 6 categories, found ${categoryCount}`);
  } else {
    pass("AC3 category count", `${categoryCount} categories found`);
  }
}

// ---------------------------------------------------------------------------
// AC4 – product-images storage bucket is public
// ---------------------------------------------------------------------------
async function checkStorageBucket(supabase: SupabaseClient): Promise<void> {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    fail("AC4 storage bucket", `listBuckets failed: ${error.message}`);
    return;
  }

  const bucket = buckets?.find((b) => b.id === "product-images");
  if (!bucket) {
    fail("AC4 storage bucket", "Bucket 'product-images' not found");
    return;
  }

  if (!bucket.public) {
    fail("AC4 storage bucket", "Bucket 'product-images' exists but is NOT public");
  } else {
    pass("AC4 storage bucket", "Bucket 'product-images' exists and is public");
  }
}

// ---------------------------------------------------------------------------
// AC2 – New auth user triggers public.users row creation
// ---------------------------------------------------------------------------
async function checkAuthTrigger(supabase: SupabaseClient): Promise<void> {
  // Use a deterministic test email so runs are idempotent.
  const testEmail = `furnspace-validate-${Date.now()}@example.com`;
  const testPassword = "ValidP@ss1!";
  const testFullName = "Validate Trigger User";

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: testFullName },
    },
  });

  if (signUpError) {
    fail("AC2 auth trigger", `signUp failed: ${signUpError.message}`);
    return;
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    fail("AC2 auth trigger", "signUp succeeded but returned no user id");
    return;
  }

  // Sign in so we can query our own row (RLS: users can SELECT own row).
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    fail("AC2 auth trigger", `signIn failed: ${signInError.message}`);
    return;
  }

  // Wait briefly for the trigger to complete (Supabase executes it
  // synchronously within the INSERT transaction, so no real delay needed,
  // but a small pause avoids any edge-case replication lag in hosted envs).
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .single();

  if (userError) {
    fail(
      "AC2 auth trigger",
      `Could not read public.users row after signup: ${userError.message}`
    );
  } else if (!userRow) {
    fail("AC2 auth trigger", "public.users row was NOT created by trigger");
  } else {
    const issues: string[] = [];
    if (userRow.email !== testEmail) {
      issues.push(`email mismatch: expected ${testEmail}, got ${userRow.email}`);
    }
    if (userRow.full_name !== testFullName) {
      issues.push(
        `full_name mismatch: expected '${testFullName}', got '${userRow.full_name}'`
      );
    }
    if (userRow.role !== "customer") {
      issues.push(`role mismatch: expected 'customer', got '${userRow.role}'`);
    }

    if (issues.length > 0) {
      fail("AC2 auth trigger", `Row created but data incorrect: ${issues.join("; ")}`);
    } else {
      pass(
        "AC2 auth trigger",
        `public.users row created correctly for ${testEmail}`
      );
    }
  }

  // Sign out to clean up session state.
  await supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log("=== FurnSpace Iteration 1 – Schema Validation ===\n");

  // AC5: env vars
  const env = checkEnvVars();
  if (!env) {
    printSummary();
    process.exit(1);
  }

  const supabase = createClient(env.url, env.anonKey);

  // Run all checks
  await checkTablesExist(supabase);
  await checkRlsBlocksAnonInsert(supabase);
  await checkSeedData(supabase);
  await checkStorageBucket(supabase);
  await checkAuthTrigger(supabase);

  printSummary();

  const anyFailed = results.some((r) => !r.passed);
  process.exit(anyFailed ? 1 : 0);
}

function printSummary(): void {
  console.log("\n--- Results ---");
  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const status = result.passed ? "PASS" : "FAIL";
    const icon = result.passed ? "✓" : "✗";
    console.log(`  ${icon} [${status}] ${result.name}: ${result.message}`);
    if (result.passed) passed++;
    else failed++;
  }

  console.log(`\n--- Summary: ${passed} passed, ${failed} failed ---`);
  if (failed === 0) {
    console.log("All checks passed. Iteration 1 schema is valid.");
  } else {
    console.log(`${failed} check(s) failed. Review the output above.`);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
