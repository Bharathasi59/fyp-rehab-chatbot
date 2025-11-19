import React, { useState, useEffect, useRef } from 'react'


export default function ChatUI({ sessionId, initialReport }){
const [messages, setMessages] = useState(() => [{role:'system', text:'Welcome! Upload a video to begin.'}])
const [input, setInput] = useState('')
const [loading, setLoading] = useState(false)
const boxRef = useRef(null)


useEffect(()=>{
if (initialReport){
setMessages(m=>[...m, {role:'assistant', text:'Video analyzed. Ask me about form, reps, or rehab suggestions.'}])
}
},[initialReport])


useEffect(()=>{ if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight }, [messages])


async function send(){
if (!input.trim()) return
const text = input.trim()
setMessages(m=>[...m, {role:'user', text}])
setInput('')
setLoading(true)


try{
const resp = await fetch('http://127.0.0.1:8000/api/upload', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ session_id: sessionId, message: text })
})
if (!resp.ok) throw new Error('chat failed')
const js = await resp.json()
setMessages(m=>[...m, {role:'assistant', text: js.reply || 'No reply'}])
}catch(err){
console.error(err)
setMessages(m=>[...m, {role:'assistant', text: 'Error contacting server: ' + err.message}])
}finally{
setLoading(false)
}
}
return (
<div className="chat-root">
<h3>Chat Assistant</h3>
<div className="chat-box" ref={boxRef}>
{messages.map((m, i)=> (
<div key={i} className={`msg ${m.role}`}>
<div className="msg-role">{m.role === 'user' ? 'You' : m.role === 'assistant' ? 'Bot' : ''}</div>
<div className="msg-text">{m.text}</div>
</div>
))}
</div>


<div className="chat-input">
<input placeholder="Ask about form, reps, suggestions..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send() }} />
<button onClick={send} className="btn">{loading ? '...' : 'Send'}</button>
</div>
</div>
)
}