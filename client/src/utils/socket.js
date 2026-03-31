import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://medicaps-backend-production.up.railway.app'

let socket = null

export function initSocket(userId) {
  if (socket?.connected) return socket
  if (socket) socket.disconnect()

  socket = io(SOCKET_URL, {
    withCredentials: true,
    query: { userId },
    transports: ['polling', 'websocket'], // polling first for Railway
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
  })

  socket.on('connect', () => console.log('Socket connected:', socket.id))
  socket.on('connect_error', (err) => console.log('Socket error:', err.message))

  return socket
}

export function getSocket() { return socket }
export function disconnectSocket() { socket?.disconnect(); socket = null }
