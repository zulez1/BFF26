'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, saveEvent, generateId } from '@/lib/store'
import { CITIES } from '@/lib/mockData'
import { Sport, SPORT_LABELS, SPORT_EMOJIS, SportEvent } from '@/lib/types'
import { ArrowLeft, ArrowRight, Check, Image as ImageIcon } from 'lucide-react'

const SPORTS: { value: Sport; label: string; emoji: string }[] = [
  { value: 'football', label: 'Футбол', emoji: '⚽' },
  { value: 'basketball', label: 'Баскетбол', emoji: '🏀' },
  { value: 'running', label: 'Бег', emoji: '🏃' },
  { value: 'tennis', label: 'Теннис', emoji: '🎾' },
  { value: 'swimming', label: 'Плавание', emoji: '🏊' },
  { value: 'hockey', label: 'Хоккей', emoji: '🏒' },
  { value: 'volleyball', label: 'Волейбол', emoji: '🏐' },
  { value: 'boxing', label: 'Бокс', emoji: '🥊' },
  { value: 'yoga', label: 'Йога', emoji: '🧘' },
  { value: 'skiing', label: 'Лыжи', emoji: '⛷️' },
  { value: 'other', label: 'Другое', emoji: '🏅' },
]

const SAMPLE_IMAGES: Record<Sport, string> = {
  football: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
  basketball: 'https://images.unsplash.com/photo-1546519638405-a9c4ef0f4c8e?w=800&q=80',
  running: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
  tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
  swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
  hockey: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=800&q=80',
  volleyball: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80',
  boxing: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  skiing: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80',
}

const STEPS = ['Основное', 'Место и время', 'Билеты', 'Готово']

interface FormData {
  title: string
  description: string
  sport: Sport
  imageUrl: string
  city: string
  location: string
  date: string
  endDate: string
  price: number
  totalTickets: number
  tags: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    sport: 'football',
    imageUrl: SAMPLE_IMAGES.football,
    city: '',
    location: '',
    date: '',
    endDate: '',
    price: 500,
    totalTickets: 100,
    tags: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!getCurrentUser()) router.replace('/auth')
  }, [router])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function validateStep(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (step === 0) {
      if (!form.title.trim()) e.title = 'Введите название'
      if (!form.description.trim()) e.description = 'Введите описание'
    }
    if (step === 1) {
      if (!form.city) e.city = 'Выберите город'
      if (!form.location.trim()) e.location = 'Введите место проведения'
      if (!form.date) e.date = 'Выберите дату'
    }
    if (step === 2) {
      if (form.price < 0) e.price = 'Цена не может быть отрицательной'
      if (form.totalTickets < 1) e.totalTickets = 'Минимум 1 билет'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validateStep()) setStep((s) => s + 1)
  }

  function handleSubmit() {
    const user = getCurrentUser()
    if (!user) return

    const event: SportEvent = {
      id: `evt-${generateId()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      sport: form.sport,
      date: form.date,
      endDate: form.endDate || undefined,
      location: form.location.trim(),
      city: form.city,
      price: form.price,
      totalTickets: form.totalTickets,
      soldTickets: 0,
      imageUrl: form.imageUrl || SAMPLE_IMAGES[form.sport],
      organizerId: user.id,
      organizerName: user.name,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
    }

    saveEvent(event)
    setSuccess(true)
    setStep(3)
  }

  const user = getCurrentUser()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Назад
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Создать мероприятие</h1>
      <p className="text-gray-500 text-sm mb-8">Заполните информацию о вашем событии</p>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
              i < step ? 'bg-emerald-600 text-white' :
              i === step ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
              'bg-gray-200 text-gray-400'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`ml-2 text-xs font-medium hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 mx-3 flex-1 w-12 sm:w-16 ${i < step ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Название мероприятия" error={errors.title as string}>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Например: Летний футбольный турнир"
                className={inputCls(errors.title as string)}
                maxLength={100}
              />
            </Field>

            <Field label="Описание" error={errors.description as string}>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Расскажите о мероприятии: программа, участники, особенности..."
                className={`${inputCls(errors.description as string)} h-28 resize-none`}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/1000</p>
            </Field>

            <Field label="Вид спорта">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      set('sport', s.value)
                      set('imageUrl', SAMPLE_IMAGES[s.value])
                    }}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.sport === s.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-2xl mb-0.5">{s.emoji}</p>
                    <p className="text-xs font-medium text-gray-700">{s.label}</p>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Изображение (URL)">
              <div className="flex gap-3">
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>
                <input
                  value={form.imageUrl}
                  onChange={(e) => set('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className={`${inputCls()} flex-1`}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Оставьте пустым для автоматического изображения по виду спорта
              </p>
            </Field>

            <Field label="Теги (через запятую)">
              <input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="марафон, любители, приз"
                className={inputCls()}
              />
            </Field>
          </div>
        )}

        {/* Step 1: Location & Date */}
        {step === 1 && (
          <div className="space-y-5">
            <Field label="Город" error={errors.city as string}>
              <select
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className={inputCls(errors.city as string)}
              >
                <option value="">Выберите город</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Место проведения" error={errors.location as string}>
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Стадион, арена, парк..."
                className={inputCls(errors.location as string)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Дата начала" error={errors.date as string}>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  className={inputCls(errors.date as string)}
                />
              </Field>
              <Field label="Дата окончания (необязательно)">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                  min={form.date}
                  className={inputCls()}
                />
              </Field>
            </div>
          </div>
        )}

        {/* Step 2: Tickets */}
        {step === 2 && (
          <div className="space-y-5">
            <Field label="Цена билета (₽, 0 = бесплатно)" error={errors.price as string}>
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', Math.max(0, +e.target.value))}
                  min={0}
                  max={100000}
                  className={`${inputCls(errors.price as string)} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₽</span>
              </div>
            </Field>

            <Field label="Количество билетов" error={errors.totalTickets as string}>
              <input
                type="number"
                value={form.totalTickets}
                onChange={(e) => set('totalTickets', Math.max(1, +e.target.value))}
                min={1}
                max={100000}
                className={inputCls(errors.totalTickets as string)}
              />
            </Field>

            {/* Preview */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Предпросмотр</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Цена за билет</span>
                <span className="font-semibold">{form.price === 0 ? 'Бесплатно' : `${form.price.toLocaleString('ru')} ₽`}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Всего билетов</span>
                <span className="font-semibold">{form.totalTickets.toLocaleString('ru')}</span>
              </div>
              <div className="flex justify-between text-sm mt-1 border-t border-emerald-200 pt-2">
                <span className="text-gray-500">Макс. выручка</span>
                <span className="font-bold text-emerald-600">
                  {(form.price * form.totalTickets).toLocaleString('ru')} ₽
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && success && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Мероприятие создано!</h2>
            <p className="text-gray-500 mb-1 text-sm">{form.title}</p>
            <p className="text-gray-400 mb-8 text-xs">{form.date} · {form.city}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/events')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                Посмотреть в каталоге
              </button>
              <button
                onClick={() => router.push('/dashboard?tab=events')}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Мои события
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} />
              Назад
            </button>
          )}
          <button
            onClick={step === 2 ? handleSubmit : handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors"
          >
            {step === 2 ? (
              <>
                <Check size={16} />
                Опубликовать мероприятие
              </>
            ) : (
              <>
                Далее
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function inputCls(error?: string): string {
  return `w-full border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl px-3.5 py-2.5 text-sm text-gray-800 outline-none focus:border-emerald-500 transition-colors bg-white`
}
