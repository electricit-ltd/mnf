import React, { useState } from 'react';
import './styles.css';

function App() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !status) {
      setMessage('Please enter your name and select a status.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch('/api/submitPoll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, status, date: today })
      });

      if (response.ok) {
        setMessage(`Thanks for voting, ${name}!`);
        setName('');
        setStatus('');
      } else {
        const text = await response.text();
        setMessage(`Error: ${text}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="poll-container">
      <h1>Monday 5-a-side</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select status</option>
          <option value="in">I'm in</option>
          <option value="maybe">Maybe</option>
          <option value="out">I'm out</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      {message && (
        <div className={`message ${message.includes('Thanks') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
