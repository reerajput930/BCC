import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { chatConfig } from '../chatConfig.js'
import { getReply, pause, typingTime } from '../chatReplies.js'
import { siteInfo, whatsappUrl } from '../siteInfo.js'
import { ChatBubbleIcon, CloseIcon, ReadTicksIcon, SendIcon, WhatsAppIcon } from './ChatIcons.jsx'
import LogoMark from './LogoMark.jsx'

// On touch screens (no hover) the label slides out briefly after the page loads.
const TOUCH_LABEL_DELAY_MS = 300
const TOUCH_LABEL_DURATION_MS = 3000

// The "Talk to human" button appears after this many messages from the visitor
const HUMAN_AFTER_MESSAGES = 2

const clockTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

if (import.meta.env.DEV && !siteInfo.whatsapp.number) {
  console.warn('siteInfo.whatsapp.number is empty: WhatsApp links open without a recipient.')
}

function ReplyLink({ link, onNavigate }) {
  if (link.href.startsWith('/')) {
    return (
      <Link className="chat-msg__link" to={link.href} onClick={onNavigate}>
        {link.label}
      </Link>
    )
  }
  return (
    <a className="chat-msg__link" href={link.href} target="_blank" rel="noopener noreferrer">
      {link.label}
    </a>
  )
}

// "Talk to human": button into WhatsApp with our team, email for anyone without WhatsApp
function Handoff() {
  return (
    <span className="chat-handoff">
      <a className="chat-handoff__whatsapp" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
        Open WhatsApp
      </a>
      <span className="chat-handoff__email">
        No WhatsApp? Email us at <a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a>
      </span>
    </span>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [labelShown, setLabelShown] = useState(false)
  const [messages, setMessages] = useState(() => [
    { id: 0, from: 'bot', text: chatConfig.welcome, time: clockTime() },
  ])
  const [draft, setDraft] = useState('')
  const [waiting, setWaiting] = useState(false)
  const sentCount = messages.filter((message) => message.from === 'user').length
  const nextId = useRef(1)
  // What the last reply was about (language, topic, dishes), sent along with the next message
  const context = useRef({})
  const wasOpen = useRef(false)
  const rootRef = useRef(null)
  const fabRef = useRef(null)
  const windowRef = useRef(null)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const windowId = useId()
  const titleId = useId()
  const inputId = useId()

  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return
    const show = setTimeout(() => setLabelShown(true), TOUCH_LABEL_DELAY_MS)
    const hide = setTimeout(() => setLabelShown(false), TOUCH_LABEL_DELAY_MS + TOUCH_LABEL_DURATION_MS)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [])

  // Once the footer's bottom row scrolls into view, ride up with it so the button
  // never sits on the legal links (and stays clear of the newsletter Join button).
  useEffect(() => {
    const root = rootRef.current
    const dock = document.querySelector('[data-floating-dock]')
    if (!dock) return

    let frame = 0
    const update = () => {
      frame = 0
      const lift = Math.max(0, window.innerHeight - dock.getBoundingClientRect().top)
      root.style.setProperty('--chat-lift', `${lift}px`)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Page height changes when navigating between pages.
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(document.body)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resizeObserver.disconnect()
    }
  }, [])

  // Move focus into the window when it opens and back to the button when it closes.
  // The `chat-open` class stops the page scrolling behind the full-screen window on phones.
  useEffect(() => {
    document.documentElement.classList.toggle('chat-open', open)
    if (open) {
      // Focusing the text box on a phone would pop up the keyboard straight away.
      const target = window.matchMedia('(hover: hover) and (pointer: fine)').matches
        ? inputRef.current
        : windowRef.current
      target.focus({ preventScroll: true })
    } else if (wasOpen.current) {
      fabRef.current.focus({ preventScroll: true })
    }
    wasOpen.current = open
  }, [open])

  useEffect(() => () => document.documentElement.classList.remove('chat-open'), [])

  // Keep the newest message in view.
  useEffect(() => {
    const body = bodyRef.current
    body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' })
  }, [messages, waiting])

  function addMessage(from, content) {
    const id = nextId.current++
    setMessages((current) => [...current, { id, from, time: clockTime(), ...content }])
  }

  // quickReply: a topic button or suggestion ({ id }); without one, `text` is sent as typed
  async function ask(text, quickReply) {
    addMessage('user', { text })
    setWaiting(true)
    try {
      const result = await getReply({ text, quickReply, context: context.current })
      context.current = result.context ?? {}
      // Several answers arrive as separate messages, with a short "typing…" in between
      for (const [i, reply] of result.replies.entries()) {
        if (i > 0) await pause(typingTime(reply.text))
        addMessage('bot', reply)
      }
    } catch {
      addMessage('bot', { text: chatConfig.errorReply, handoff: true })
    } finally {
      setWaiting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || waiting) return
    setDraft('')
    ask(text)
  }

  const close = () => setOpen(false)

  return (
    <div ref={rootRef} className={open ? 'chat-widget is-open' : 'chat-widget'}>
      <section
        id={windowId}
        ref={windowRef}
        className="chat-window"
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(event) => event.key === 'Escape' && close()}
      >
        <div className="chat-window__panel">
          <header className="chat-window__header">
            <span className="chat-window__avatar">
              <LogoMark size={40} />
            </span>
            <div className="chat-window__who">
              <h2 id={titleId} className="chat-window__title">
                {siteInfo.name}
              </h2>
              <p className="chat-window__status" aria-hidden="true">
                {waiting ? 'typing…' : 'online'}
              </p>
            </div>
            <button type="button" className="chat-window__close" aria-label="Close chat" onClick={close}>
              <CloseIcon />
            </button>
          </header>

          <div ref={bodyRef} className="chat-window__body">
            <p className="chat-chip chat-chip--day">Today</p>
            <p className="chat-chip chat-chip--note">
              You’re chatting with our assistant. Our team is on WhatsApp too.
            </p>
            <div className="chat-log" role="log" aria-label="Conversation">
              {messages.map((message, i) => (
                <Fragment key={message.id}>
                  <div
                    className={`chat-msg chat-msg--${message.from}${
                      messages[i - 1]?.from !== message.from ? ' is-first' : ''
                    }`}
                  >
                    <span className="visually-hidden">
                      {message.from === 'bot' ? `${siteInfo.name}: ` : 'You: '}
                    </span>
                    {message.text}
                    {message.link && <ReplyLink link={message.link} onNavigate={close} />}
                    {message.handoff && <Handoff />}
                    <span className="chat-msg__meta" aria-hidden="true">
                      {message.time}
                      {message.from === 'user' && <ReadTicksIcon />}
                    </span>
                  </div>
                  {/* Follow-up suggestions, only under the latest message */}
                  {message.suggestions && i === messages.length - 1 && !waiting && (
                    <div className="chat-suggestions" role="group" aria-label="Suggestions">
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.label}
                          type="button"
                          onClick={() => ask(suggestion.label, suggestion.topic && { id: suggestion.topic })}
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  )}
                </Fragment>
              ))}
              {waiting && (
                <div className="chat-msg chat-msg--bot is-first chat-typing">
                  <span className="visually-hidden">{siteInfo.name} is typing…</span>
                  <span className="chat-typing__dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              )}
            </div>

            <div className="chat-quick" role="group" aria-label="Quick replies">
              {chatConfig.quickReplies.map((quickReply) => {
                const human = quickReply.id === 'human'
                // "Talk to human" shows once the visitor has given the bot a try
                if (human && sentCount < HUMAN_AFTER_MESSAGES) return null
                return (
                  <button
                    key={quickReply.id}
                    type="button"
                    className={human ? 'chat-quick__human' : undefined}
                    disabled={waiting}
                    onClick={() => ask(quickReply.label, quickReply)}
                  >
                    {human && <WhatsAppIcon />}
                    {quickReply.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="chat-window__composer">
            <form className="chat-form" onSubmit={handleSubmit}>
              <label className="visually-hidden" htmlFor={inputId}>
                Message
              </label>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message"
                autoComplete="off"
                maxLength={500}
              />
              <button type="submit" aria-label="Send" disabled={!draft.trim() || waiting}>
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      </section>

      <button
        ref={fabRef}
        type="button"
        className={labelShown ? 'chat-fab is-labelled' : 'chat-fab'}
        aria-label="Chat with us"
        aria-expanded={open}
        aria-controls={windowId}
        onClick={() => setOpen(true)}
      >
        <span className="chat-fab__label" aria-hidden="true">
          Chat with us
        </span>
        <span className="chat-fab__icon">
          <ChatBubbleIcon />
        </span>
      </button>
    </div>
  )
}
