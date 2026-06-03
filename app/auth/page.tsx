'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login, register, getCurrentUser } from '@/lib/store'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react'

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [role, setRole] = useState<'user' | 'organizer'>('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getCurrentUser()) router.replace('/')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 600))

    const result =
      mode === 'login'
        ? login(email, password)
        : register(name, email, password, role)

    setLoading(false)

    if (result.ok) {
      window.dispatchEvent(new Event('auth-change'))
      router.push('/dashboard')
    } else {
      setError(result.error || 'Ошибка')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-800 to-teal-700 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <span className="text-3xl">⚡</span>
            <span className="font-display font-bold text-2xl tracking-wide">SportMarket</span>
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight mb-6">
            Спорт объединяет<br />людей
          </h1>
          <p className="text-emerald-200 text-lg leading-relaxed">
            Присоединяйтесь к тысячам любителей спорта, которые находят и покупают билеты на любимые мероприятия.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { num: '10+', label: 'Мероприятий' },
            { num: '5', label: 'Городов' },
            { num: '24K', label: 'Билетов' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="font-display font-bold text-2xl mb-1">{s.num}</p>
              <p className="text-emerald-200 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex bg-gray-200 rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Добро пожаловать' : 'Создайте аккаунт'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {mode === 'login' ? 'Войдите в свой аккаунт' : 'Быстрая регистрация за 30 секунд'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <FormField
                label="Ваше имя"
                icon={<User size={16} />}
                type="text"
                value={name}
                onChange={setName}
                placeholder="Иван Иванов"
                required
              />
            )}

            <FormField
              label="Email"
              icon={<Mail size={16} />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ivan@example.ru"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
              <div className="relative flex items-center bg-white border border-gray-200 rounded-xl focus-within:border-emerald-500 transition-colors">
                <div className="pl-3 text-gray-400"><Lock size={16} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  className="flex-1 px-3 py-3 text-sm text-gray-800 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип аккаунта</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'user', label: '🎫 Участник', desc: 'Покупаю билеты' },
                    { value: 'organizer', label: '📋 Организатор', desc: 'Создаю события' },
                  ] as const).map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-3 text-left rounded-xl border-2 transition-all text-sm ${
                        role === r.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-800">{r.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Нажимая кнопку, вы соглашаетесь с{' '}
            <span className="text-emerald-600 cursor-pointer hover:underline">условиями использования</span>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700 font-medium mb-1">💡 Демо-режим</p>
            <p className="text-xs text-blue-600">
              Данные хранятся в браузере. Создайте любой аккаунт для тестирования.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  icon: React.ReactNode
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center bg-white border border-gray-200 rounded-xl focus-within:border-emerald-500 transition-colors">
        <div className="pl-3 text-gray-400">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 px-3 py-3 text-sm text-gray-800 outline-none bg-transparent"
        />
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  )
}
