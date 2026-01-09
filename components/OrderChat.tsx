'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'

export default function OrderChat({ orderId, userId }: { orderId: string, userId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing messages
    supabase.from('chat_messages').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
      .then(({ data }) => { if(data) setMessages(data) })

    // Subscribe to new messages
    const channel = supabase.channel(`chat-${orderId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages', 
        filter: `order_id=eq.${orderId}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!input.trim()) return
    const txt = input
    setInput('') // Optimistic clear
    await supabase.from('chat_messages').insert({ order_id: orderId, sender_id: userId, message: txt })
  }

  return (
    <div className="border border-gray-200 rounded-xl h-80 flex flex-col bg-gray-50 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={scrollRef}>
            {messages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Start the conversation</p>}
            
            {messages.map(m => {
                const isMe = m.sender_id === userId
                return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                            isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                        }`}>
                            {m.message}
                        </div>
                    </div>
                )
            })}
        </div>
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                <Send size={18} />
            </button>
        </form>
    </div>
  )
}