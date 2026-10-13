import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import api from '../services/api'
import './AiAssistantPage.css'

export default function AiAssistantPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const messagesEndRef = useRef(null)

  const samplePrompts = [
    t('aiAssistant.prompt1', 'What is the current mandi market price for Rice in AP?'),
    t('aiAssistant.prompt2', 'Which government scheme provides subsidy for solar pumps?'),
    t('aiAssistant.prompt3', 'What are non-chemical remedies for Rice Blast disease?'),
    t('aiAssistant.prompt4', 'What soil pH and temperature range are ideal for Wheat?')
  ]

  useEffect(() => {
    // Ensure token synchronization for backward-compatibility
    const kToken = localStorage.getItem('kisanmitra_token')
    if (kToken && !localStorage.getItem('token')) {
      localStorage.setItem('token', kToken)
    }
    fetchSessions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSessions = async () => {
    try {
      const res = await api.get('/ai-assistant/sessions')
      if (res.data) {
        setSessions(res.data)
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    }
  }

  const loadSessionMessages = async (sessionId) => {
    setActiveSessionId(sessionId)
    setError(null)
    setShowMobileSidebar(false)
    try {
      const res = await api.get(`/ai-assistant/sessions/${sessionId}`)
      if (res.data) {
        setMessages(res.data)
      }
    } catch (err) {
      console.error('Failed to load session messages:', err)
      setError(t('aiAssistant.errLoadMessages', 'Could not load chat session messages.'))
    }
  }

  const handleStartNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
    setError(null)
    setShowMobileSidebar(false)
  }

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    try {
      await api.delete(`/ai-assistant/sessions/${sessionId}`)
      if (activeSessionId === sessionId) {
        handleStartNewChat()
      }
      fetchSessions()
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const handleSendMessage = async (promptText) => {
    const messageToSend = promptText || inputMessage
    if (!messageToSend.trim() || loading) return

    setError(null)
    setInputMessage('')
    setLoading(true)

    // Optimistically add User Message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'USER',
      content: messageToSend,
      timestamp: new Date().toISOString()
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const res = await api.post('/ai-assistant/chat', {
        sessionId: activeSessionId,
        message: messageToSend
      })

      const data = res.data

      if (!activeSessionId) {
        setActiveSessionId(data.sessionId)
        fetchSessions()
      }

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'ASSISTANT',
        content: data.assistantReply,
        groundedSources: data.groundedSources ? (Array.isArray(data.groundedSources) ? data.groundedSources.join(', ') : data.groundedSources) : '',
        isEscalatedToKvk: data.isEscalatedToKvk,
        timestamp: data.timestamp
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.error('Chat error:', err)
      const errMessage = err.response?.data?.message || err.message || t('aiAssistant.errDefault', 'An error occurred while contacting KisanMitra AI.')
      setError(errMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-assistant-container">
      {/* Top Navbar */}
      <nav className="ai-assistant-navbar">
        <div className="navbar-brand-section">
          <button className="back-btn" onClick={() => navigate('/farmer/dashboard')}>
            {t('aiAssistant.backToDashboard', '← Back to Dashboard')}
          </button>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>
            {t('aiAssistant.title', 'KisanMitra AI Assistant')}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <LanguageSelector id="ai-assistant-language-select" />
          <span style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            {t('aiAssistant.loggedInAs', 'Logged in as:')} <strong style={{ color: '#f8fafc' }}>{user?.fullName || user?.email}</strong>
          </span>
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {t('aiAssistant.btnLogout', 'Logout')}
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="ai-assistant-main">
        {/* Sidebar */}
        <aside className={`ai-sidebar ${showMobileSidebar ? 'mobile-visible' : ''}`}>
          <button className="new-chat-btn" onClick={handleStartNewChat}>
            <span>+</span> {t('aiAssistant.newChatBtn', '+ New Chat Session')}
          </button>

          <div className="session-list-heading">{t('aiAssistant.recentConversations', 'Recent Conversations')}</div>

          <div className="session-list">
            {sessions.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem' }}>
                {t('aiAssistant.noSessions', 'No past chat sessions found.')}
              </div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`session-item ${activeSessionId === sess.id ? 'active' : ''}`}
                  onClick={() => loadSessionMessages(sess.id)}
                >
                  <div className="session-item-title" title={sess.title}>
                    💬 {sess.title}
                  </div>
                  <button
                    className="delete-session-btn"
                    title={t('aiAssistant.deleteChatTooltip', 'Delete Chat')}
                    aria-label={t('aiAssistant.deleteChatTooltip', 'Delete Chat')}
                    onClick={(e) => handleDeleteSession(e, sess.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="ai-chat-view">
          {/* Header Bar */}
          <header className="chat-header-bar">
            <div className="chat-header-title">
              <h2>{t('aiAssistant.engineTitle', 'KisanMitra Grounded Intelligence Engine')}</h2>
              <div className="chat-header-subtitle">
                {t('aiAssistant.engineSubtitle', 'Grounded in ICAR Publications, AGMARKNET Mandi Feeds & Open-Meteo Data')}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="mobile-sidebar-toggle-btn"
                onClick={() => setShowMobileSidebar((prev) => !prev)}
                aria-label={t('aiAssistant.toggleSidebar', 'Toggle History')}
              >
                📜 {t('aiAssistant.toggleSidebar', 'Toggle History')}
              </button>
              <div className="status-badge">
                <span className="status-dot"></span>
                <span>{t('aiAssistant.groundingActive', 'ICAR & AGMARKNET Live Grounding Active')}</span>
              </div>
            </div>
          </header>

          {/* Messages Body */}
          <div className="messages-scroll-area">
            {messages.length === 0 ? (
              <div className="empty-chat-welcome">
                <div className="welcome-icon">🌾</div>
                <h3 className="welcome-title">{t('aiAssistant.welcomeTitle', 'Welcome to KisanMitra AI Agricultural Assistant')}</h3>
                <p className="welcome-desc">
                  {t('aiAssistant.welcomeDesc', 'Ask any question about crop cultivation, soil health, weather forecasts, mandi commodity rates, government subsidies, or crop disease symptoms.')}
                </p>

                <div className="suggestion-chips-grid">
                  {samplePrompts.map((prompt, idx) => (
                    <div
                      key={idx}
                      className="chip-card"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      🌱 {prompt}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`chat-message-row ${msg.sender === 'USER' ? 'user' : 'assistant'}`}
                >
                  <div
                    className={`chat-avatar ${msg.sender === 'USER' ? 'user' : 'assistant'}`}
                    aria-label={msg.sender === 'USER' ? t('aiAssistant.userAvatarLabel', 'Farmer') : t('aiAssistant.assistantAvatarLabel', 'KisanMitra AI')}
                  >
                    {msg.sender === 'USER' ? '👨‍🌾' : '🤖'}
                  </div>
                  <div className="message-bubble-content">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                    {/* Grounded Sources */}
                    {msg.sender === 'ASSISTANT' && msg.groundedSources && (
                      <div className="sources-container">
                        <div className="sources-label">{t('aiAssistant.sourcesLabel', 'Verified Grounded Sources:')}</div>
                        <div className="sources-badges">
                          {msg.groundedSources.split(',').map((src, sIdx) => (
                            <span key={sIdx} className="source-badge-chip">
                              📚 {src.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* KVK Escalation Alert */}
                    {msg.sender === 'ASSISTANT' && msg.isEscalatedToKvk && (
                      <div className="kvk-alert-box">
                        🚨 <strong>{t('aiAssistant.kvkAlertTitle', '🚨 KVK Escalation Advised:')}</strong> {t('aiAssistant.kvkAlertDesc', 'Symptoms or severe conditions require physical inspection by Krishi Vigyan Kendra plant pathologists.')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="chat-message-row assistant">
                <div className="chat-avatar assistant" aria-label={t('aiAssistant.assistantAvatarLabel', 'KisanMitra AI')}>🤖</div>
                <div className="message-bubble-content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                  {t('aiAssistant.queryingRepos', 'Querying ICAR & AGMARKNET repositories...')}
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.8rem 1.2rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '0.9rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <footer className="chat-input-area">
            <form
              className="input-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
            >
              <input
                type="text"
                className="chat-text-input"
                placeholder={t('aiAssistant.inputPlaceholder', 'Ask about crops, mandi prices, weather, schemes, or disease symptoms (max 500 chars)...')}
                value={inputMessage}
                maxLength={500}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="send-btn" disabled={loading || !inputMessage.trim()}>
                {loading ? t('aiAssistant.btnSending', 'Sending...') : t('aiAssistant.btnSend', 'Send Query')}
              </button>
            </form>
            <div className="input-disclaimer-text">
              {t('aiAssistant.disclaimerText', 'KisanMitra AI answers are grounded in official Indian agricultural publications. Always verify field treatments with local KVK experts.')}
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
