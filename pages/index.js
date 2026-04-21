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
  const [hoveredRow, setHoveredRow] = useState(null)

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
      alert('✓ Client record saved successfully!')
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
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Glass Morphism Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '28px 36px',
          marginBottom: '32px',
          boxShadow: '0 20px 35px -10px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📋 Client Tracking System
              </h1>
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>Track inactive clients, follow-ups, and deposits</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={() => setActiveTab('form')}
                style={{
                  padding: '10px 28px',
                  background: activeTab === 'form' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: activeTab === 'form' ? 'white' : '#64748b',
                  border: activeTab === 'form' ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'form' ? '0 4px 12px rgba(102,126,234,0.4)' : 'none'
                }}
              >➕ New Entry</button>
              <button
                onClick={() => setActiveTab('records')}
                style={{
                  padding: '10px 28px',
                  background: activeTab === 'records' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: activeTab === 'records' ? 'white' : '#64748b',
                  border: activeTab === 'records' ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '40px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'records' ? '0 4px 12px rgba(102,126,234,0.4)' : 'none'
                }}
              >📊 All Records</button>
            </div>
          </div>
        </div>

        {/* Form Tab */}
        {activeTab === 'form' && (
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: '40px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>Add New Client Entry</h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>Fill in the details below to track client interactions</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                
                {/* Date & Time */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>📅 Date & Time</label>
                  <div style={{ display: 'flex', gap: '32px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="radio" value="live" checked={dateType === 'live'} onChange={() => setDateType('live')} style={{ width: '18px', height: '18px' }} /> 
                      <span>Live (Current Time)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input type="radio" value="custom" checked={dateType === 'custom'} onChange={() => setDateType('custom')} style={{ width: '18px', height: '18px' }} /> 
                      <span>Custom Date & Time</span>
                    </label>
                  </div>
                  {dateType === 'custom' ? (
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.2s' }} />
                      <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.2s' }} />
                    </div>
                  ) : (
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', color: '#475569', fontSize: '14px', border: '1px solid #e2e8f0' }}>
                      📅 {liveDate} &nbsp;&nbsp;⏰ {liveTime}
                    </div>
                  )}
                </div>

                {/* Client Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>👤 Client Name *</label>
                  <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter full name" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.2s' }} />
                </div>

                {/* Platform */}
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>🎮 Platform *</label>
                  <select required value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white' }}>
                    <option value="">Select platform</option>
                    {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>

                {/* Agent Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>👨‍💼 Agent Name *</label>
                  <input type="text" required value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Enter agent name" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.2s' }} />
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>🏷️ Category</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="A or B" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.2s' }} />
                </div>

                {/* Deposit Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={depositMade} onChange={(e) => setDepositMade(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    <span style={{ fontWeight: '600', color: '#334155' }}>💰 Deposit Made?</span>
                  </label>
                </div>

                {/* Notes */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>📝 Notes</label>
                  <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why was the client inactive? Any follow-up needed?" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                marginTop: '32px',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 14px rgba(102,126,234,0.4)'
              }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.5)' }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 14px rgba(102,126,234,0.4)' }}>
                {loading ? 'Saving...' : '✓ Save Record'}
              </button>
            </form>
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: '40px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>All Client Records</h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>View and manage all client entries</p>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Date/Time</th>
                    <th style={{ padding: '16px 16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Client</th>
                    <th style={{ padding: '16px 16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Platform</th>
                    <th style={{ padding: '16px 16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Agent</th>
                    <th style={{ padding: '16px 16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Category</th>
                    <th style={{ padding: '16px 16px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Notes</th>
                    <th style={{ padding: '16px 16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Deposit</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                        No records yet. Add your first entry!
                      </td>
                    </tr>
                  ) : (
                    records.map((record, idx) => (
                      <tr key={record.id} style={{ 
                        borderBottom: idx === records.length - 1 ? 'none' : '1px solid #e2e8f0',
                        background: hoveredRow === record.id ? '#f8fafc' : 'white',
                        transition: 'background 0.2s ease'
                      }} onMouseEnter={() => setHoveredRow(record.id)} onMouseLeave={() => setHoveredRow(null)}>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>{record.date} {record.time}</td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#1e293b' }}>{record.client_name}</td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>{record.page_name}</td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>{record.agent_name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {record.category ? (
                            <span style={{ display: 'inline-block', padding: '4px 10px', background: record.category === 'A' ? '#dcfce7' : '#fef3c7', color: record.category === 'A' ? '#166534' : '#92400e', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{record.category}</span>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: '300px', wordBreak: 'break-word' }}>{record.notes || '-'}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <input type="checkbox" checked={record.deposit_made} onChange={() => updateDeposit(record.id, record.deposit_made)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
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
    </div>
  )
}
