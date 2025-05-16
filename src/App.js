// src/App.js
import React, { useState, useEffect } from "react";
import "./styles.css";
import fixtures from "./fixtures.json";

function App() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextMatch, setNextMatch] = useState(null);

  useEffect(() => {
    const today = new Date();

    // 1. Map each fixture to include the fields your UI expects:
    const enriched = fixtures.map(f => {
      const dateObj = new Date(f.date);
      return {
        // original JSON
        ...f,
        // helper fields for rendering
        dateObj,
        dateFormatted: dateObj.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),              // e.g. "Mon 19 May"
        fixture: f.opponent,  // name your opponent as "fixture"
        kickoff: f.time,      // map "time" to "kickoff"
      };
    });

    // 2. Find the very next one
    const upcoming = enriched
      .filter(f => f.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)[0] || null;

    setNextMatch(upcoming);
  }, []);

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
      alert("Thanks! Your response has been recorded.");
      setName("");
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
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={submitting}
        />
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
    </div>
  );
}

export default App;
