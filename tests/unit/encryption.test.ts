import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../src/utils/encryption';

describe('Encryption', () => {
  it('should encrypt and decrypt a string correctly', () => {
    const plaintext = 'sk-test-key-12345';
    const encrypted = encrypt(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for same input (random IV)', () => {
    const plaintext = 'same-key';
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);

    expect(encrypted1).not.toBe(encrypted2);
    expect(decrypt(encrypted1)).toBe(plaintext);
    expect(decrypt(encrypted2)).toBe(plaintext);
  });

  it('should throw on tampered ciphertext', () => {
    const encrypted = encrypt('test');
    const parts = encrypted.split(':');
    parts[2] = 'tampered';
    const tampered = parts.join(':');

    expect(() => decrypt(tampered)).toThrow();
  });
});
