import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://medicaps-backend-production.up.railway.app'

let socket = null

export function initSocket(userId) {
  if (socket?.connected) return socket
  if (socket) socket.disconnect()
  socket = io(SOCKET_URL, {
    withCredentials: true,
    query: { userId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })
  return socket
}

export function getSocket() { return socket }
export function disconnectSocket() { socket?.disconnect(); socket = null }
