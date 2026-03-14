import crypto from 'crypto';
import { requireEnv } from './index';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const secret = requireEnv('SESSION_SECRET');
  return crypto.scryptSync(secret, 'guardiboard-salt', KEY_LENGTH);
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(ciphertext: string): string {
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
  return salt.toString('hex') + ':' + hash.toString('hex');
}

export function verifyPassword(password: string, hashed: string): boolean {
  const parts = hashed.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const salt = Buffer.from(parts[0], 'hex');
  const hash = Buffer.from(parts[1], 'hex');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');

  return crypto.timingSafeEqual(hash, verifyHash);
}
