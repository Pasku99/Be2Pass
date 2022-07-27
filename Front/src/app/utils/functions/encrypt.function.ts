import * as CryptoJS from 'crypto-js';

export function encrypt(
  textToCipher: string,
  masterPassword: string,
  privateKeyEncrypted: string
): string {
  // Decrypt private key
  let keyBytes = CryptoJS.AES.decrypt(privateKeyEncrypted, masterPassword, {
    mode: CryptoJS.mode.CTR,
  });
  const decryptedPrivateKey = keyBytes.toString(CryptoJS.enc.Utf8);
  // Encrypt key with decrypted privated key
  const encryptedUserKey = CryptoJS.AES.encrypt(
    textToCipher,
    decryptedPrivateKey,
    { mode: CryptoJS.mode.CTR }
  ).toString();
  return encryptedUserKey;
}
