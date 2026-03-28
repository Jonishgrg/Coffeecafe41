#!/usr/bin/env node

/**
 * QR Code Generator for CoffeeCafe Tables
 * Generates QR codes for tables 1-8
 * Usage: node scripts/generate-qr-codes.js
 */

const fs = require('fs');
const path = require('path');

// Table configuration
const TABLES = 8;
const BASE_URL = 'https://coffeecafee49.netlify.app'; // Updated to actual deployed domain

// Create QR codes directory
const qrDir = path.join(__dirname, '..', '..', 'qr-codes');
if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
}

console.log('🍽️  CoffeeCafe QR Code Generator');
console.log('================================');
console.log(`Generating QR codes for ${TABLES} tables...`);
console.log(`Base URL: ${BASE_URL}`);
console.log('');

// Generate QR codes for each table
for (let table = 1; table <= TABLES; table++) {
    const url = `${BASE_URL}?table=${table}`;
    const filename = `table-${table}.txt`;

    // Create a simple text file with the URL (you can use this with online QR generators)
    const content = `Table ${table} QR Code
==================
URL: ${url}

Instructions:
1. Copy this URL
2. Go to https://qr-code-generator.com/
3. Paste the URL
4. Download the QR code image
5. Print and place on table ${table}
`;

    fs.writeFileSync(path.join(qrDir, filename), content);
    console.log(`✅ Table ${table}: ${url}`);
}

console.log('');
console.log('📁 QR code URLs saved to: qr-codes/');
console.log('');
console.log('🖨️  To create actual QR codes:');
console.log('1. Open each .txt file in qr-codes/');
console.log('2. Copy the URL');
console.log('3. Use an online QR generator like:');
console.log('   - https://qr-code-generator.com/');
console.log('   - https://www.qr-code-generator.com/');
console.log('   - https://goqr.me/');
console.log('');
console.log('📋 Print Instructions:');
console.log('- Print QR codes on waterproof paper');
console.log('- Laminate for durability');
console.log('- Place one QR code per table');
console.log('- Test by scanning with phone camera');
console.log('');
console.log('🎯 When customers scan:');
console.log('- Takes them directly to menu');
console.log('- Table number auto-filled in checkout');
console.log('- Orders automatically assigned to their table');