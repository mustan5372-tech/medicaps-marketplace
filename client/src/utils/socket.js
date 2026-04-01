import { io } from 'socket.io-client'

// Hardcoded Railway URL - no env var dependency
const SOCKET_URL = 'https://medicaps-backend-production.up.railway.app'

let socket = null

export function initSocket(userId) {
  if (socket?.connected) return socket
  if (socket) socket.disconnect()
  socket = io(SOCKET_URL, {
    withCredentials: true,
    query: { userId },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
  })
  return socket
}

export function getSocket() { return socket }
export function disconnectSocket() { socket?.disconnect(); socket = null }
