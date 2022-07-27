import * as CryptoJS from 'crypto-js';

export function decrypt(cipherText: string, key: string): string {
  let bytes = CryptoJS.AES.decrypt(cipherText, key, {
    mode: CryptoJS.mode.CTR,
  });
  try {
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return '';
  }
}
