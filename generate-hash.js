// generate-hash.js
const argon2 = require('argon2');

(async () => {
  const password = 'admin123'; // ✅ Troque aqui se quiser outra senha
  const hash = await argon2.hash(password);
  console.log('Hash gerado:\n', hash);
})();
