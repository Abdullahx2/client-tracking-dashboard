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
  const [agentName, setAgentName] = useState('')
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

  async function loadRecords() {
    const { data } = await supabase
      .from('client_records')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setRecords(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const finalDate = dateType === 'live' ? liveDate : customDate
    const finalTime = dateType === 'live' ? liveTime : customTime

    const { error } = await supabase.from('client_records').insert({
      date: finalDate,
      time: finalTime,
      client_name: clientName,
      page_name: selectedPlatform,
      agent_name: agentName,
      category: category,
      notes: notes,
      deposit_made: depositMade
    })

    if (!error) {
      alert('✓ Record saved')
      loadRecords()
      setClientName('')
      setSelectedPlatform('')
      setAgentName('')
      setCategory('')
      setNotes('')
      setDepositMade(false)
      setCustomDate('')
      setCustomTime('')
      setDateType('live')
      setActiveTab('records')
    } else {
      alert('Error: ' + error.message)
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
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f5f7fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px 25px',
        marginBottom: '25px',
        border: '1px solid #e2e8f0'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>📋 Client Tracking System</h1>
        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>Track inactive clients, follow-ups, and deposits</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
        <button
          onClick={() => setActiveTab('form')}
          style={{
            padding: '8px 20px',
            background: activeTab === 'form' ? '#3b82f6' : 'white',
            color: activeTab === 'form' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >➕ New Entry</button>
        <button
          onClick={() => setActiveTab('records')}
          style={{
            padding: '8px 20px',
            background: activeTab === 'records' ? '#3b82f6' : 'white',
            color: activeTab === 'records' ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >📊 All Records</button>
      </div>

      {/* Form Tab */}
      {activeTab === 'form' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b' }}>Add New Entry</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Date & Time */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Date & Time</label>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                    <input type="radio" value="live" checked={dateType === 'live'} onChange={() => setDateType('live')} /> Now
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                    <input type="radio" value="custom" checked={dateType === 'custom'} onChange={() => setDateType('custom')} /> Custom
                  </label>
                </div>
                {dateType === 'custom' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                  </div>
                ) : (
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px', color: '#475569' }}>
                    {liveDate} · {liveTime}
                  </div>
                )}
              </div>

              {/* Client Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Client Name *</label>
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>

              {/* Platform */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Platform *</label>
                <select required value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white' }}>
                  <option value="">Select</option>
                  {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              {/* Agent Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Agent Name *</label>
                <input type="text" required value={agentName} onChange={(e) => setAgentName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Category (A/B)</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="A or B" style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>

              {/* Deposit Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <input type="checkbox" checked={depositMade} onChange={(e) => setDepositMade(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>Deposit Made?</label>
              </div>

              {/* Notes */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Notes</label>
                <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Inactivity reason, follow-ups needed..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: '20px',
              padding: '8px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}>
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </form>
        </div>
      )}

      {/* Records Tab */}
      {activeTab === 'records' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1e293b' }}>All Records</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Date/Time</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Client</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Platform</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Agent</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Notes</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Deposit</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records yet</td>
                  </tr>
                ) : (
                  records.map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px' }}>{record.date} {record.time}</td>
                      <td style={{ padding: '10px', fontWeight: '500' }}>{record.client_name}</td>
                      <td style={{ padding: '10px' }}>{record.page_name}</td>
                      <td style={{ padding: '10px' }}>{record.agent_name}</td>
                      <td style={{ padding: '10px' }}>{record.category || '-'}</td>
                      <td style={{ padding: '10px', maxWidth: '250px', wordBreak: 'break-word' }}>{record.notes || '-'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <input type="checkbox" checked={record.deposit_made} onChange={() => updateDeposit(record.id, record.deposit_made)} />
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
