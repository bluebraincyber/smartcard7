// Script para gerar hash de senha usando bcryptjs
// Uso: BCRYPT_SALT_ROUNDS=12 node scripts/generate-password-hash.js "sua_senha_aqui"

const bcrypt = require('bcryptjs');

if (process.argv.length < 3) {
  console.log('Uso: node scripts/generate-password-hash.js "sua_senha"');
  process.exit(1);
}

const password = process.argv[2];
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
    process.exit(1);
  }
  
  console.log('Senha:', password);
  console.log('Hash:', hash);
  console.log('\nSQL para inserir usuário:');
  console.log(`INSERT INTO users (name, email, password_hash) VALUES ('Admin', 'admin@smartcard.local', '${hash}');`);
});