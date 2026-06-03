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
  { value: 'cycling', label: 'Вело', emoji: '🚴' },
  { value: 'martial_arts', label: 'Единоборства', emoji: '🥋' },
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
  cycling: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80',
  martial_arts: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&q=80',
}

const STEPS = ['Основное', 'Место и время', 'Билеты']

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
    if (!validateStep()) return
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

  if (success && step === 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#D4FF00]/10 border border-[#D4FF00]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={44} className="text-[#D4FF00]" />
          </div>
          <h2 className="font-display text-5xl text-white mb-3 tracking-wide">ГОТОВО!</h2>
          <p className="text-white/50 mb-1">{form.title}</p>
          <p className="text-white/25 mb-10 text-sm">{form.date} · {form.city}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/events')}
              className="px-7 py-3.5 bg-[#D4FF00] text-black rounded-2xl font-bold text-sm hover:bg-[#c8f000] transition-colors"
            >
              В каталог
            </button>
            <button
              onClick={() => router.push('/dashboard?tab=events')}
              className="px-7 py-3.5 border border-white/10 text-white/60 rounded-2xl font-semibold text-sm hover:bg-white/[0.06] hover:text-white transition-all"
            >
              Мои события
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Назад
      </button>

      <h1 className="font-display text-5xl text-white mb-1 tracking-wide">СОЗДАТЬ</h1>
      <p className="text-white/30 text-sm mb-8">Заполните информацию о мероприятии</p>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i < step
                  ? 'bg-[#D4FF00] text-black'
                  : i === step
                  ? 'bg-[#D4FF00] text-black ring-4 ring-[#D4FF00]/20'
                  : 'bg-white/[0.07] text-white/30 border border-white/[0.08]'
              }`}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i === step ? 'text-white' : 'text-white/25'}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px mx-4 w-10 sm:w-16 transition-all ${i < step ? 'bg-[#D4FF00]/40' : 'bg-white/[0.07]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-[#141414] border border-white/[0.07] rounded-2xl p-6">
        {/* Step 0: Basic info */}
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Название мероприятия" error={errors.title}>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Например: Летний футбольный турнир"
                className={inputCls(errors.title)}
                maxLength={100}
              />
            </Field>

            <Field label="Описание" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Расскажите о мероприятии: программа, участники, особенности..."
                className={`${inputCls(errors.description)} h-28 resize-none`}
                maxLength={1000}
              />
              <p className="text-xs text-white/20 text-right mt-1">{form.description.length}/1000</p>
            </Field>

            <Field label="Вид спорта">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {SPORTS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      set('sport', s.value)
                      set('imageUrl', SAMPLE_IMAGES[s.value])
                    }}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      form.sport === s.value
                        ? 'border-[#D4FF00]/50 bg-[#D4FF00]/[0.08]'
                        : 'border-white/[0.06] bg-white/[0.03] hover:border-white/10'
                    }`}
                  >
                    <p className="text-xl mb-0.5">{s.emoji}</p>
                    <p className="text-[10px] font-medium text-white/50">{s.label}</p>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Изображение (URL)">
              <div className="flex gap-3">
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-white/[0.06]">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover opacity-70" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <ImageIcon size={18} />
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
              <p className="text-xs text-white/20 mt-1.5">
                Оставьте пустым для автоматического изображения
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
            <Field label="Город" error={errors.city}>
              <select
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className={inputCls(errors.city)}
              >
                <option value="">Выберите город</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Место проведения" error={errors.location}>
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Стадион, арена, парк..."
                className={inputCls(errors.location)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Дата начала" error={errors.date}>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  className={inputCls(errors.date)}
                />
              </Field>
              <Field label="Дата окончания">
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
            <Field label="Цена билета (₽, 0 = бесплатно)" error={errors.price}>
              <div className="relative">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set('price', Math.max(0, +e.target.value))}
                  min={0}
                  max={100000}
                  className={`${inputCls(errors.price)} pr-8`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 text-sm">₽</span>
              </div>
            </Field>

            <Field label="Количество билетов" error={errors.totalTickets}>
              <input
                type="number"
                value={form.totalTickets}
                onChange={(e) => set('totalTickets', Math.max(1, +e.target.value))}
                min={1}
                max={100000}
                className={inputCls(errors.totalTickets)}
              />
            </Field>

            {/* Preview */}
            <div className="bg-[#D4FF00]/[0.05] border border-[#D4FF00]/15 rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#D4FF00]/60 mb-3 uppercase tracking-wider">Предпросмотр</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Цена за билет</span>
                  <span className="font-semibold text-white/70">{form.price === 0 ? 'Бесплатно' : `${form.price.toLocaleString('ru')} ₽`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Всего билетов</span>
                  <span className="font-semibold text-white/70">{form.totalTickets.toLocaleString('ru')}</span>
                </div>
                <div className="flex justify-between border-t border-[#D4FF00]/10 pt-2 mt-1">
                  <span className="text-sm text-white/40">Макс. выручка</span>
                  <span className="font-bold text-[#D4FF00]">
                    {(form.price * form.totalTickets).toLocaleString('ru')} ₽
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-5">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-3.5 border border-white/[0.08] text-white/50 rounded-2xl font-medium text-sm hover:border-white/10 hover:text-white transition-all"
          >
            <ArrowLeft size={14} />
            Назад
          </button>
        )}
        <button
          onClick={step === 2 ? handleSubmit : handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#D4FF00] text-black rounded-2xl font-bold text-sm hover:bg-[#c8f000] transition-colors"
        >
          {step === 2 ? (
            <>
              <Check size={15} />
              Опубликовать мероприятие
            </>
          ) : (
            <>
              Далее
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
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
      <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}

function inputCls(error?: string): string {
  return `w-full bg-white/[0.05] border ${error ? 'border-red-500/40' : 'border-white/[0.07]'} rounded-xl px-3.5 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#D4FF00]/30 transition-colors`
}
