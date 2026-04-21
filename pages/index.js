import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  const [halls, setHalls] = useState([])
  const [categories, setCategories] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [agents, setAgents] = useState([])
  
  // Form state
  const [selectedHall, setSelectedHall] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [clientName, setClientName] = useState('')
  const [pageName, setPageName] = useState('')
  const [inactivityReason, setInactivityReason] = useState('')
  const [depositMade, setDepositMade] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  // Load data
  useEffect(() => {
    loadHalls()
    loadRecords()
    setDate(new Date().toISOString().split('T')[0])
    setTime(new Date().toTimeString().slice(0,5))
  }, [])

  async function loadHalls() {
    const { data } = await supabase.from('halls').select('*')
    if (data) setHalls(data)
  }

  async function loadCategories(hallId) {
    if (!hallId) return
    const { data } = await supabase.from('categories').select('*').eq('hall_id', hallId)
    if (data) setCategories(data)
  }

  async function loadPlatforms(categoryId) {
    if (!categoryId) return
    const { data } = await supabase.from('platforms').select('*').eq('category_id', categoryId)
    if (data) setPlatforms(data)
  }

  async function loadAgents(platformId) {
    if (!platformId) return
    const { data } = await supabase.from('agents').select('*').eq('platform_id', platformId)
    if (data) setAgents(data)
  }

  async function loadRecords() {
    const { data } = await supabase.from('client_records').select('*, agents(name)').order('date', { ascending: false })
    if (data) setRecords(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.from('client_records').insert({
      agent_id: parseInt(selectedAgent),
      date: date,
      time: time,
      client_name: clientName,
      page_name: pageName,
      inactivity_reason: inactivityReason,
      deposit_made: depositMade
    })
    
    if (!error) {
      alert('Client record saved!')
      loadRecords()
      // Reset form
      setClientName('')
      setPageName('')
      setInactivityReason('')
      setDepositMade(false)
      setSelectedHall('')
      setSelectedCategory('')
      setSelectedPlatform('')
      setSelectedAgent('')
    } else {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>📋 Client Tracking System</h1>
      
      {/* Form */}
      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h2>Add New Client Entry</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label>Hall *</label>
            <select required value={selectedHall} onChange={(e) => {
              setSelectedHall(e.target.value)
              loadCategories(e.target.value)
              setSelectedCategory('')
              setSelectedPlatform('')
              setSelectedAgent('')
            }} style={{ width: '100%', padding: '8px' }}>
              <option value="">Select Hall</option>
              {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          
          <div>
            <label>Category *</label>
            <select required value={selectedCategory} onChange={(e) => {
              setSelectedCategory(e.target.value)
              loadPlatforms(e.target.value)
              setSelectedPlatform('')
              setSelectedAgent('')
            }} style={{ width: '100%', padding: '8px' }}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label>Platform *</label>
            <select required value={selectedPlatform} onChange={(e) => {
              setSelectedPlatform(e.target.value)
              loadAgents(e.target.value)
              setSelectedAgent('')
            }} style={{ width: '100%', padding: '8px' }}>
              <option value="">Select Platform</option>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          <div>
            <label>Agent *</label>
            <select required value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="">Select Agent</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          
          <div>
            <label>Date *</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          
          <div>
            <label>Time *</label>
            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          
          <div>
            <label>Client Name *</label>
            <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          
          <div>
            <label>Page Name</label>
            <input type="text" value={pageName} onChange={(e) => setPageName(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label>Inactivity Reason</label>
            <textarea rows="3" value={inactivityReason} onChange={(e) => setInactivityReason(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          
          <div>
            <label>Deposit Made?</label>
            <input type="checkbox" checked={depositMade} onChange={(e) => setDepositMade(e.target.checked)} /> Yes
          </div>
        </div>
        
        <button type="submit" disabled={loading} style={{ marginTop: '20px', padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Saving...' : 'Save Record'}
        </button>
      </form>
      
      {/* Records Table */}
      <h2>📊 Client Records</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Client</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Agent</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Page</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reason</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Deposit</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.date} {record.time}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.client_name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.agents?.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.page_name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.inactivity_reason}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.deposit_made ? '✅ Yes' : '❌ No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
