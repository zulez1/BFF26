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
  | 'cycling'
  | 'martial_arts'
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
  cycling: 'Велоспорт',
  martial_arts: 'Единоборства',
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
  cycling: '🚴',
  martial_arts: '🥋',
  other: '🏅',
}

export const SPORT_COLORS: Record<Sport, string> = {
  football: 'bg-green-500/10 text-green-400 border border-green-500/20',
  basketball: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  running: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  tennis: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  swimming: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  hockey: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  volleyball: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  boxing: 'bg-red-500/10 text-red-400 border border-red-500/20',
  yoga: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
  skiing: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  cycling: 'bg-lime-500/10 text-lime-400 border border-lime-500/20',
  martial_arts: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  other: 'bg-white/5 text-white/50 border border-white/10',
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
