import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  const [dateType, setDateType] = useState('live')
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [clientName, setClientName] = useState('')
  const [platforms, setPlatforms] = useState([])
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [depositMade, setDepositMade] = useState(false)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('form')

  const liveDate = new Date().toISOString().split('T')[0]
  const liveTime = new Date().toTimeString().slice(0, 5)

  useEffect(() => {
    loadPlatforms()
    loadRecords()
  }, [])

  async function loadPlatforms() {
    const { data } = await supabase.from('platforms').select('*').order('name')
    if (data) setPlatforms(data)
  }

  async function loadAgents(platformName) {
    if (!platformName) {
      setAgents([])
      return
    }
    const { data: platformData } = await supabase
      .from('platforms')
      .select('id')
      .eq('name', platformName)
      .single()
    
    if (platformData) {
      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('platform_id', platformData.id)
        .order('name')
      if (data) setAgents(data)
    } else {
      setAgents([])
    }
  }

  async function loadRecords() {
    const { data } = await supabase
      .from('client_records')
      .select('*, agents(name)')
      .order('created_at', { ascending: false })
    if (data) setRecords(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const finalDate = dateType === 'live' ? liveDate : customDate
    const finalTime = dateType === 'live' ? liveTime : customTime

    const { error } = await supabase.from('client_records').insert({
      agent_id: parseInt(selectedAgent),
      date: finalDate,
      time: finalTime,
      client_name: clientName,
      page_name: selectedPlatform,
      category: category,
      notes: notes,
      deposit_made: depositMade
    })

    if (!error) {
      alert('✓ Client record saved successfully!')
      loadRecords()
      setClientName('')
      setSelectedPlatform('')
      setSelectedAgent('')
      setCategory('')
      setNotes('')
      setDepositMade(false)
      setCustomDate('')
      setCustomTime('')
      setDateType('live')
      setActiveTab('records')
    } else {
      alert('✗ Error: ' + error.message)
    }
    setLoading(false)
  }

  async function updateDeposit(recordId, currentStatus) {
    const { error } = await supabase
      .from('client_records')
      .update({ deposit_made: !currentStatus })
      .eq('id', recordId)

    if (!error) {
      loadRecords()
      alert('✓ Deposit status updated!')
    } else {
      alert('✗ Error: ' + error.message)
    }
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '30px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f0f2f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px 30px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '3px solid #3b82f6'
      }}>
        <h1 style={{ margin: 0, color: '#1e293b', fontSize: '28px' }}>📋 Client Tracking System</h1>
        <p style={{ margin: '8px 0 0', color: '#64748b' }}>Track inactive clients, follow-ups, and deposits</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
        <button
          onClick={() => setActiveTab('form')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'form' ? '#3b82f6' : 'white',
            color: activeTab === 'form' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: activeTab === 'form' ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
          }}
        >➕ New Entry</button>
        <button
          onClick={() => setActiveTab('records')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'records' ? '#3b82f6' : 'white',
            color: activeTab === 'records' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >📊 All Records</button>
      </div>

      {/* Form Tab */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '25px', color: '#1e293b', fontSize: '20px' }}>➕ Add New Client Entry</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Date & Time */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>📅 Date & Time</label>
              <div style={{ display: 'flex', gap: '30px', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" value="live" checked={dateType === 'live'} onChange={() => setDateType('live')} /> Live (Now)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" value="custom" checked={dateType === 'custom'} onChange={() => setDateType('custom')} /> Custom
                </label>
              </div>
              {dateType === 'custom' ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1 }} />
                  <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1 }} />
                </div>
              ) : (
                <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '10px', color: '#475569' }}>
                  📅 {liveDate} &nbsp;&nbsp;⏰ {liveTime}
                </div>
              )}
            </div>

            {/* Client Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>👤 Client Name *</label>
              <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter client name" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            </div>

            {/* Platform */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>🎮 Platform (Page) *</label>
              <select required value={selectedPlatform} onChange={(e) => {
                setSelectedPlatform(e.target.value)
                loadAgents(e.target.value)
                setSelectedAgent('')
              }} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white' }}>
                <option value="">Select Platform</option>
                {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            {/* Agent */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>👨‍💼 Agent *</label>
              <select required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white' }} disabled={agents.length === 0}>
                <option value="">{agents.length === 0 ? 'Select platform first' : 'Select Agent'}</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>🏷️ Category (A or B)</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="A or B" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
            </div>

            {/* Deposit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={depositMade} onChange={(e) => setDepositMade(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontWeight: '500', color: '#334155' }}>💰 Deposit Made?</span>
              </label>
            </div>

            {/* Notes */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#334155' }}>📝 Notes (Inactivity reason, follow-ups, etc.)</label>
              <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why was the client inactive? Any follow-up needed?" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '25px',
            padding: '12px 28px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}>
            {loading ? 'Saving...' : '✓ Save Record'}
          </button>
        </form>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b', fontSize: '20px' }}>📊 All Client Records</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Date/Time</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Client</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Platform</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Agent</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Category</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Notes</th>
                  <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Deposit</th>
                 </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records yet. Add your first entry! 📝</td>
                  </tr>
                ) : (
                  records.map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', color: '#334155' }}>{record.date} {record.time}</td>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#1e293b' }}>{record.client_name}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{record.page_name}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{record.agents?.name}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{record.category}</td>
                      <td style={{ padding: '12px', color: '#334155', maxWidth: '250px', wordBreak: 'break-word' }}>{record.notes}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <input type="checkbox" checked={record.deposit_made} onChange={() => updateDeposit(record.id, record.deposit_made)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
