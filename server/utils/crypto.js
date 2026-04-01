// Server-side crypto utility (preview only, not full decrypt)
function decryptMessage(encryptedText) {
  // Server intentionally does NOT decrypt — E2E encryption
  return '[encrypted message]'
}

module.exports = { decryptMessage }
