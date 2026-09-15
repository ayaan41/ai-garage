"use client";
import { useState } from 'react';

export default function TestSMS() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTest = async () => {
    setLoading(true);
    setStatus('Sending...');
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+447782194511',
          garageName: 'AIGarage',
          bookingId: 'TEST-' + Date.now()
        })
      });
      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
      if (data.messages || data.request_id) {
        alert('SMS Queued! Check your phone 07782194511 - Sender: AIGarage');
      }
    } catch (e:any) {
      setStatus('Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{padding: '40px', fontFamily: 'system-ui', background: '#000', color: '#fff', minHeight: '100vh'}}>
      <h1>Test SMS - AIGarage</h1>
      <p>Phone: 07782194511 | Sender: AIGarage</p>
      <button 
        onClick={sendTest} 
        disabled={loading}
        style={{padding: '15px 30px', background: '#FFD700', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px'}}
      >
        {loading ? 'Sending...' : 'Send Test SMS Now'}
      </button>
      <pre style={{marginTop: '20px', background: '#111', padding: '20px', borderRadius: '8px', whiteSpace: 'pre-wrap'}}>{status}</pre>
      <p style={{marginTop: '20px', color: '#888'}}>After click, check your mobile. Should come from AIGarage with tracking link.</p>
    </div>
  );
}
