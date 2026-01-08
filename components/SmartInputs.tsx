'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Sparkles, Loader2, Globe } from 'lucide-react'
import { improveTextAction } from '@/app/actions/aiActions'

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

interface SmartProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: 'ingredient' | 'instruction'
}

// Language Options
const LANGUAGES = [
  { code: 'en-US', label: 'EN' },
  { code: 'ms-MY', label: 'BM' },
  { code: 'zh-CN', label: 'CN' },
]

// --- SHARED LOGIC HOOK ---
function useSmartInput(value: string, onChange: (val: string) => void, type: 'ingredient' | 'instruction') {
  const [isListening, setIsListening] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  
  // New State: Default to English, user can toggle
  const [langIndex, setLangIndex] = useState(0)
  const currentLang = LANGUAGES[langIndex]

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          const newText = value ? `${value} ${transcript}` : transcript
          onChange(newText)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech error", event)
          setIsListening(false)
        }

        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [value, onChange])

  const toggleListening = () => {
    if (!recognitionRef.current) return alert("Voice input not supported in this browser.")
    
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      // SET LANGUAGE RIGHT BEFORE STARTING
      recognitionRef.current.lang = currentLang.code
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const cycleLanguage = () => {
    setLangIndex((prev) => (prev + 1) % LANGUAGES.length)
  }

  const handleMagicFix = async () => {
    if (!value.trim()) return
    setIsFixing(true)
    const result = await improveTextAction(value, type)
    if (result.refined) onChange(result.refined)
    setIsFixing(false)
  }

  return { isListening, isFixing, toggleListening, handleMagicFix, cycleLanguage, currentLang }
}

// --- COMPONENT 1: SMART INPUT (Single Line) ---
export function SmartInput({ value, onChange, placeholder, type = 'ingredient' }: SmartProps) {
  const { isListening, isFixing, toggleListening, handleMagicFix, cycleLanguage, currentLang } = useSmartInput(value, onChange, type)

  return (
    <div className="relative group">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full border-2 border-gray-200 p-4 pr-32 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
        suppressHydrationWarning
      />
      
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 items-center bg-white pl-2">
        {/* Language Toggle Button */}
        <button
          type="button"
          onClick={cycleLanguage}
          className="text-xs font-bold text-gray-500 hover:text-orange-600 border border-gray-200 rounded px-2 py-1 transition mr-1 w-8 text-center"
          title="Switch Language"
        >
          {currentLang.label}
        </button>

        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          title={`Speak in ${currentLang.label}`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        
        <button
          type="button"
          onClick={handleMagicFix}
          disabled={isFixing || !value}
          className={`p-2 rounded-lg transition-all ${isFixing ? 'bg-orange-100 text-orange-600' : 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'}`}
          title="AI Grammar Fix"
        >
          {isFixing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
      </div>
    </div>
  )
}

// --- COMPONENT 2: SMART TEXTAREA (Multi Line) ---
export function SmartTextarea({ value, onChange, placeholder, type = 'instruction' }: SmartProps) {
  const { isListening, isFixing, toggleListening, handleMagicFix, cycleLanguage, currentLang } = useSmartInput(value, onChange, type)

  return (
    <div className="relative group">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full border-2 border-gray-200 p-4 pb-12 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all text-gray-900 placeholder:text-gray-400"
        rows={3}
        suppressHydrationWarning
      />
      
      <div className="absolute right-3 bottom-3 flex gap-2 items-center">
        {/* Language Toggle Button */}
        <button
          type="button"
          onClick={cycleLanguage}
          className="text-xs font-bold text-gray-500 hover:text-orange-600 border border-gray-200 rounded px-2 py-1.5 transition bg-white"
          title="Switch Language"
        >
          {currentLang.label}
        </button>

        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          title={`Speak in ${currentLang.label}`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        
        <button
          type="button"
          onClick={handleMagicFix}
          disabled={isFixing || !value}
          className={`p-2 rounded-lg transition-all ${isFixing ? 'bg-orange-100 text-orange-600' : 'bg-orange-50 text-orange-400 hover:text-orange-600 hover:bg-orange-100'}`}
          title="AI Grammar Fix"
        >
          {isFixing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
      </div>
    </div>
  )
}