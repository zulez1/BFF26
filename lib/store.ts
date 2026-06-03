'use client'

import { SportEvent, User, Ticket, AuthState } from './types'
import { MOCK_EVENTS } from './mockData'

const KEYS = {
  EVENTS: 'sm_events',
  USERS: 'sm_users',
  TICKETS: 'sm_tickets',
  CURRENT_USER: 'sm_current_user',
  WISHLIST: 'sm_wishlist',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// ----- Events -----

export function getEvents(): SportEvent[] {
  const stored = read<SportEvent[]>(KEYS.EVENTS, [])
  const storedIds = new Set(stored.map((e) => e.id))
  const merged = [
    ...MOCK_EVENTS.filter((e) => !storedIds.has(e.id)),
    ...stored,
  ]
  return merged.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function getEventById(id: string): SportEvent | undefined {
  return getEvents().find((e) => e.id === id)
}

export function saveEvent(event: SportEvent): void {
  const stored = read<SportEvent[]>(KEYS.EVENTS, [])
  const idx = stored.findIndex((e) => e.id === event.id)
  if (idx >= 0) {
    stored[idx] = event
  } else {
    stored.push(event)
  }
  write(KEYS.EVENTS, stored)
}

export function deleteEvent(id: string): void {
  const stored = read<SportEvent[]>(KEYS.EVENTS, [])
  write(
    KEYS.EVENTS,
    stored.filter((e) => e.id !== id)
  )
}

// ----- Users -----

function getUsers(): User[] {
  return read<User[]>(KEYS.USERS, [])
}

function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(16)
}

export function register(
  name: string,
  email: string,
  password: string,
  role: 'user' | 'organizer' = 'user'
): { ok: boolean; error?: string } {
  const users = getUsers()
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'Пользователь с таким email уже существует' }
  }
  const user: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  }
  write(KEYS.USERS, [...users, user])
  setCurrentUser(user)
  return { ok: true }
}

export function login(
  email: string,
  password: string
): { ok: boolean; error?: string } {
  const users = getUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user || user.passwordHash !== hashPassword(password)) {
    return { ok: false, error: 'Неверный email или пароль' }
  }
  setCurrentUser(user)
  return { ok: true }
}

export function logout(): void {
  localStorage.removeItem(KEYS.CURRENT_USER)
}

function setCurrentUser(user: User): void {
  const { passwordHash: _, ...safeUser } = user
  write(KEYS.CURRENT_USER, safeUser)
}

export function getCurrentUser(): AuthState['user'] {
  return read<AuthState['user']>(KEYS.CURRENT_USER, null)
}

export function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'name'>>
): void {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates }
    write(KEYS.USERS, users)
    setCurrentUser(users[idx])
  }
}

// ----- Tickets -----

export function getTickets(): Ticket[] {
  return read<Ticket[]>(KEYS.TICKETS, [])
}

export function getTicketsByUser(userId: string): Ticket[] {
  return getTickets().filter((t) => t.userId === userId)
}

export function getTicketsByEvent(eventId: string): Ticket[] {
  return getTickets().filter((t) => t.eventId === eventId)
}

export function purchaseTicket(
  eventId: string,
  userId: string,
  quantity: number
): { ok: boolean; error?: string; ticket?: Ticket } {
  const event = getEventById(eventId)
  if (!event) return { ok: false, error: 'Событие не найдено' }

  const available = event.totalTickets - event.soldTickets
  if (quantity > available) {
    return { ok: false, error: `Доступно только ${available} билетов` }
  }

  const ticket: Ticket = {
    id: `tkt-${Date.now()}`,
    eventId,
    userId,
    quantity,
    totalPrice: event.price * quantity,
    purchasedAt: new Date().toISOString(),
    status: 'active',
  }

  const tickets = getTickets()
  write(KEYS.TICKETS, [...tickets, ticket])

  const updatedEvent = { ...event, soldTickets: event.soldTickets + quantity }
  saveEvent(updatedEvent)

  return { ok: true, ticket }
}

// ----- Wishlist -----

export function getWishlist(): string[] {
  return read<string[]>(KEYS.WISHLIST, [])
}

export function toggleWishlist(eventId: string): boolean {
  const list = getWishlist()
  const idx = list.indexOf(eventId)
  if (idx >= 0) {
    write(KEYS.WISHLIST, list.filter((id) => id !== eventId))
    return false
  } else {
    write(KEYS.WISHLIST, [...list, eventId])
    return true
  }
}

export function isInWishlist(eventId: string): boolean {
  return getWishlist().includes(eventId)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
