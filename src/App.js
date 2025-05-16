import React, { useState, useEffect } from "react";
import "./styles.css";
import fixtures from "./fixtures.json";

function App() {
  // existing state
  const [name, setName]       = useState("");
  const [status, setStatus]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextMatch, setNextMatch]   = useState(null);

  // new state for responses
  const [responses, setResponses] = useState({ in: [], maybe: [], out: [] });

  // find nextMatch (unchanged)…
  useEffect(() => {
    const today = new Date();
    const enriched = fixtures.map(f => ({
      ...f,
      dateObj: new Date(f.date),
      dateFormatted: new Date(f.date).toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short"
      }),
      fixture: f.opponent,
      kickoff: f.time
    }));
    const upcoming = enriched
      .filter(f => f.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)[0] || null;
    setNextMatch(upcoming);
  }, []);

  // fetch responses whenever nextMatch changes
  useEffect(() => {
    if (!nextMatch) return;
    fetch(`/api/getPoll?date=${nextMatch.date}`)
      .then(res => res.json())
      .then(setResponses)
      .catch(console.error);
  }, [nextMatch]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name || !status || !nextMatch) return;
    setSubmitting(true);
    await fetch("/api/submitPoll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        status,
        date: nextMatch.date,
      }),
    });
    // Refresh responses
    const updated = await fetch(`/api/getPoll?date=${nextMatch.date}`).then(r => r.json());
    setResponses(updated);
    setSubmitting(false);
    setName("");
    setStatus("");
  };

  return (
    <div className="container">
      <h1>Monday 5-a-side</h1>
      <h2>
        {nextMatch
          ? `Next match: vs ${nextMatch.fixture} — ${nextMatch.dateFormatted} @ ${nextMatch.kickoff}`
          : "No upcoming match found"}
      </h2>

      <form onSubmit={handleSubmit} className="poll-form">
        <input
          type="text" placeholder="Your name" value={name}
          onChange={e => setName(e.target.value)} disabled={submitting}
        />
        <select
          value={status} onChange={e => setStatus(e.target.value)}
          disabled={submitting}
        >
          <option value="">Select status</option>
          <option value="Yes">Yes</option>
          <option value="Maybe">Maybe</option>
          <option value="No">No</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>

      {/* Live Responses */}
      {nextMatch && (
        <div className="responses">
          <h3>Live Responses</h3>
          <div><strong>✅ In:</strong> {responses.in.join(", ") || "–"}</div>
          <div><strong>🤷 Maybe:</strong> {responses.maybe.join(", ") || "–"}</div>
          <div><strong>❌ Out:</strong> {responses.out.join(", ") || "–"}</div>
        </div>
      )}
    </div>
  );
}

export default App;
