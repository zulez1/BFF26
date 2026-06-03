import { format, parseISO, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'd MMMM yyyy', { locale: ru }) : dateStr
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'd MMM', { locale: ru }) : dateStr
  } catch {
    return dateStr
  }
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Бесплатно'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export function getAvailability(total: number, sold: number) {
  const available = total - sold
  const pct = Math.round((sold / total) * 100)
  return { available, pct }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
