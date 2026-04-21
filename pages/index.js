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

  const liveDate = new Date().toISOString().split('T')[0]
  const liveTime = new Date().toTimeString().slice(0, 5)

  useEffect(() => {
    loadPlatforms()
    loadRecords()
  }, [])

  async function loadPlatforms() {
    const { data } = await supabase.from('platforms').select('*')
    if (data) setPlatforms(data)
  }

  async function loadAgents(platformName) {
    if (!platformName) return
    const { data: platformData } = await supabase.from('platforms').select('id').eq('name', platformName).single()
    if (platformData) {
      const { data } = await supabase.from('agents').select('*').eq('platform_id', platformData.id)
      if (data) setAgents(data)
    }
  }

  async function loadRecords() {
    const { data } = await supabase.from('client_records').select('*, agents(name)').order('created_at', { ascending: false })
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
      alert('Client record saved!')
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
      alert('Deposit status updated!')
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>📋 Client Tracking System</h1>

      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h2>➕ Add New Client Entry</h2>

        <div style={{ marginBottom: '15px' }}>
          <label>Date & Time</label>
          <div>
            <label style={{ marginRight: '20px' }}>
              <input type="radio" value="live" checked={dateType === 'live'} onChange={() => setDateType('live')} /> Live (Now)
            </label>
            <label>
              <input type="radio" value="custom" checked={dateType === 'custom'} onChange={() => setDateType('custom')} /> Custom
            </label>
          </div>
          {dateType === 'custom' && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={{ padding: '8px' }} />
              <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} style={{ padding: '8px' }} />
            </div>
          )}
          {dateType === 'live' && (
            <div style={{ marginTop: '10px', color: '#555' }}>
              📅 {liveDate} | 🕐 {liveTime}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Client Name *</label>
          <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Platform (Page) *</label>
          <select required value={selectedPlatform} onChange={(e) => {
            setSelectedPlatform(e.target.value)
            loadAgents(e.target.value)
            setSelectedAgent('')
          }} style={{ width: '100%', padding: '8px' }}>
            <option value="">Select Platform</option>
            {platforms.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Agent *</label>
          <select required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} style={{ width: '100%', padding: '8px' }} disabled={agents.length === 0}>
            <option value="">Select Agent</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Category (A or B)</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="A or B" style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Notes (Inactivity reason, etc.)</label>
          <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Deposit Made?</label>
          <input type="checkbox" checked={depositMade} onChange={(e) => setDepositMade(e.target.checked)} /> Yes
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Saving...' : 'Save Record'}
        </button>
      </form>

      <h2>📊 Client Records</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date/Time</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Client</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Platform</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Agent</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Notes</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Deposit</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{record.date} {record.time}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{record.client_name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{record.page_name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{record.agents?.name}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{record.category}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{record.notes}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  <input type="checkbox" checked={record.deposit_made} onChange={() => updateDeposit(record.id, record.deposit_made)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
