export type Sport =
  | 'football'
  | 'basketball'
  | 'running'
  | 'tennis'
  | 'swimming'
  | 'hockey'
  | 'volleyball'
  | 'boxing'
  | 'yoga'
  | 'skiing'
  | 'other'

export const SPORT_LABELS: Record<Sport, string> = {
  football: 'Футбол',
  basketball: 'Баскетбол',
  running: 'Бег',
  tennis: 'Теннис',
  swimming: 'Плавание',
  hockey: 'Хоккей',
  volleyball: 'Волейбол',
  boxing: 'Бокс',
  yoga: 'Йога',
  skiing: 'Лыжи',
  other: 'Другое',
}

export const SPORT_EMOJIS: Record<Sport, string> = {
  football: '⚽',
  basketball: '🏀',
  running: '🏃',
  tennis: '🎾',
  swimming: '🏊',
  hockey: '🏒',
  volleyball: '🏐',
  boxing: '🥊',
  yoga: '🧘',
  skiing: '⛷️',
  other: '🏅',
}

export const SPORT_COLORS: Record<Sport, string> = {
  football: 'bg-green-100 text-green-700',
  basketball: 'bg-orange-100 text-orange-700',
  running: 'bg-blue-100 text-blue-700',
  tennis: 'bg-yellow-100 text-yellow-700',
  swimming: 'bg-cyan-100 text-cyan-700',
  hockey: 'bg-indigo-100 text-indigo-700',
  volleyball: 'bg-purple-100 text-purple-700',
  boxing: 'bg-red-100 text-red-700',
  yoga: 'bg-pink-100 text-pink-700',
  skiing: 'bg-sky-100 text-sky-700',
  other: 'bg-gray-100 text-gray-700',
}

export interface SportEvent {
  id: string
  title: string
  description: string
  sport: Sport
  date: string
  endDate?: string
  location: string
  city: string
  price: number
  totalTickets: number
  soldTickets: number
  imageUrl: string
  organizerId: string
  organizerName: string
  featured?: boolean
  tags?: string[]
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: 'user' | 'organizer'
  avatar?: string
  createdAt: string
}

export interface Ticket {
  id: string
  eventId: string
  userId: string
  quantity: number
  totalPrice: number
  purchasedAt: string
  status: 'active' | 'used' | 'cancelled'
}

export interface AuthState {
  user: Omit<User, 'passwordHash'> | null
  isAuthenticated: boolean
}

export type FilterOptions = {
  sport: Sport | 'all'
  city: string
  dateFrom: string
  dateTo: string
  priceMin: number
  priceMax: number
  search: string
}
