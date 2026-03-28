#!/usr/bin/env node

/**
 * Utility script to generate bcrypt hashes for admin passwords
 * Usage: node scripts/hash-password.js "your-password"
 */

const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("Error: Password argument required");
  console.log("Usage: node scripts/hash-password.js 'your-password'");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Error: Password must be at least 8 characters long");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nPassword Hash (add this to your .env file ADMIN_PASSWORD_HASH):");
console.log(hash);
console.log("\nKeep this hash safe - it cannot be reversed to get the original password.");
