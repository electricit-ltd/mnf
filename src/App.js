import React, { useState, useEffect } from "react";
import "./styles.css";
import fixtures from "./fixtures.json";
import roster from "./players.json";

function App() {
  const [name, setName] = useState(roster[0] || "");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextMatch, setNextMatch] = useState(null);
  const [responses, setResponses] = useState({ in: [], maybe: [], out: [] });

  // 1. Determine the next upcoming match
  useEffect(() => {
    const today = new Date();
    const enriched = fixtures.map(f => {
      const dateObj = new Date(f.date);
      return {
        ...f,
        dateObj,
        dateFormatted: dateObj.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),                   // e.g. "Mon 19 May"
        fixture: f.opponent,  // map opponent
        kickoff: f.time       // map time
      };
    });
    const upcoming = enriched
      .filter(f => f.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)[0] || null;
    setNextMatch(upcoming);
  }, []);

  // 2. Load live responses whenever the next match changes
  useEffect(() => {
    if (!nextMatch) return;
    fetch(`/api/getPoll?date=${nextMatch.date}`)
      .then(res => res.json())
      .then(setResponses)
      .catch(console.error);
  }, [nextMatch]);

  // 3. Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    if (!name || !status || !nextMatch) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/submitPoll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          status,
          date: nextMatch.date,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Refresh live responses
      const updated = await fetch(`/api/getPoll?date=${nextMatch.date}`).then(r => r.json());
      setResponses(updated);

      // Reset form
      setName(roster[0] || "");
      setStatus("");
    } catch (err) {
      console.error(err);
      alert("Error submitting: " + err.message);
    } finally {
      setSubmitting(false);
    }
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
        {/* Player roster dropdown */}
        <select
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={submitting}
        >
          {roster.map(player => (
            <option key={player} value={player}>
              {player}
            </option>
          ))}
        </select>

        {/* Status dropdown */}
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
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
          <div>
            <strong>✅ In:</strong> {responses.in.join(", ") || "–"}
          </div>
          <div>
            <strong>🤷 Maybe:</strong> {responses.maybe.join(", ") || "–"}
          </div>
          <div>
            <strong>❌ Out:</strong> {responses.out.join(", ") || "–"}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
