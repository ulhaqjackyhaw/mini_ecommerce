import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Baca file .env.local secara manual
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

function getEnvValue(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
}

const supabaseUrl = getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
const anonKey = getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const serviceKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

console.log('\n--- Pemeriksaan Konfigurasi Supabase ---');
console.log('1. NEXT_PUBLIC_SUPABASE_URL :', supabaseUrl ? `✅ Terisi (${supabaseUrl})` : '❌ KOSONG');
console.log('2. NEXT_PUBLIC_SUPABASE_ANON_KEY :', anonKey ? `✅ Terisi (${anonKey.slice(0, 15)}...)` : '❌ KOSONG');
console.log('3. SUPABASE_SERVICE_ROLE_KEY    :', serviceKey ? `✅ Terisi (${serviceKey.slice(0, 15)}...)` : '❌ KOSONG');

if (!supabaseUrl || !serviceKey) {
  console.log('\n⚠️  Harap isi file .env.local terlebih dahulu lalu jalankan perintah ini kembali.\n');
  process.exit(1);
}

console.log('\nSedang menguji koneksi ke Supabase...');

const supabase = createClient(supabaseUrl, serviceKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('products').select('id, name, price, stock_quantity').limit(5);

    if (error) {
      console.log('❌ Gagal query ke database Supabase:');
      console.log('   Pesan Error:', error.message);
      console.log('   Tips: Pastikan isi file supabase/schema.sql sudah dijalankan di Supabase SQL Editor.');
      process.exit(1);
    }

    console.log('✅ SUKSES! API & Database Supabase berhasil terhubung.');
    console.log(`✅ Berhasil membaca ${data.length} sampel produk dari database:`);
    data.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.name} - Rp${p.price.toLocaleString('id-ID')} (Stok: ${p.stock_quantity})`);
    });
    console.log('\nAplikasi siap dijalankan dengan "npm run dev"!\n');
  } catch (err) {
    console.log('❌ Terjadi kesalahan:', err.message);
  }
}

testConnection();

