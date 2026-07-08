// Safety check: run before npm run dev
// Warns the developer if .env.local is missing (which means production database would be used)
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envLocalPath)) {
    console.error('');
    console.error('🚨 DANGER: .env.local is MISSING!');
    console.error('');
    console.error('If you run npm run dev without .env.local,');
    console.error('your laptop will connect to the PRODUCTION database');
    console.error('and consume your 5 GB egress limit.');
    console.error('');
    console.error('Fix: Create .env.local and point it to your dev Supabase project.');
    console.error('');
    process.exit(1); // Stop the dev server from starting
} else {
    // Also warn if .env.local accidentally contains the production URL
    const content = fs.readFileSync(envLocalPath, 'utf8');
    if (content.includes('jaylgsinerhwcdydcgpa')) {
        console.error('');
        console.error('🚨 DANGER: .env.local is pointing to the PRODUCTION database!');
        console.error('');
        console.error('Your .env.local contains the production Supabase URL.');
        console.error('This will consume your production 5 GB egress limit during development.');
        console.error('');
        console.error('Fix: Update .env.local to use your dadwork-dev Supabase project.');
        console.error('');
        process.exit(1);
    }
    console.log('✅ .env.local found — using dev database. Safe to develop!');
}
