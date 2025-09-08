// src/lib/password.ts - util central de senha usando bcryptjs
export async function hashPassword(plain: string, saltRounds?: number): Promise<string> {
  const roundsEnv = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
  const rounds = Number.isFinite(saltRounds) ? Number(saltRounds) : roundsEnv;
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(plain, rounds);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(plain, hash);
}