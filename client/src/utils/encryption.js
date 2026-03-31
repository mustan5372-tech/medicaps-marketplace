import CryptoJS from 'crypto-js'

const SECRET = (import.meta.env.VITE_ENCRYPTION_KEY || 'medicaps-e2e-secret-2024').padEnd(32, '0').slice(0, 32)

export function encryptMessage(text) {
  const iv = CryptoJS.lib.WordArray.random(16)
  const encrypted = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Utf8.parse(SECRET),
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  )
  return { encryptedText: encrypted.toString(), iv: iv.toString(CryptoJS.enc.Hex) }
}

export function decryptMessage(encryptedText, ivHex) {
  try {
    const iv = CryptoJS.enc.Hex.parse(ivHex)
    const decrypted = CryptoJS.AES.decrypt(
      encryptedText,
      CryptoJS.enc.Utf8.parse(SECRET),
      { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    )
    return decrypted.toString(CryptoJS.enc.Utf8) || '[encrypted]'
  } catch {
    return '[encrypted]'
  }
}

export function generateChatId(buyerId, sellerId, listingId) {
  return `${buyerId}_${sellerId}_${listingId}`
}
