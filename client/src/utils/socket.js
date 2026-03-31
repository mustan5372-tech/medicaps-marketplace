import { io } from 'socket.io-client'

let socket = null

export function initSocket(userId) {
  // Reuse existing connected socket
  if (socket?.connected) return socket

  if (socket) socket.disconnect()

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
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

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
