// src/App.js
import React, { useState, useEffect } from "react";
import "./styles.css";
import fixtures from "./fixtures.json";
import roster from "./players.json";
import AdminPanel from "./AdminPanel";

function App() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextMatch, setNextMatch] = useState(null);
  const [responses, setResponses] = useState({ in: [], maybe: [], out: [] });
  const [copied, setCopied] = useState(false);

  // 1️⃣ Determine next upcoming match
  useEffect(() => {
    const today = new Date();
    const enriched = fixtures.map((f) => {
      const dateObj = new Date(f.date);
      return {
        ...f,
        dateObj,
        dateFormatted: dateObj.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        fixture: f.opponent,
        kickoff: f.time,
      };
    });
    const upcoming =
      enriched
        .filter((f) => f.dateObj >= today)
        .sort((a, b) => a.dateObj - b.dateObj)[0] || null;
    setNextMatch(upcoming);
  }, []);

  // 2️⃣ Load live responses whenever nextMatch changes
  useEffect(() => {
    if (!nextMatch) return;
    fetch(`/api/getPoll?date=${nextMatch.date}`)
      .then((r) => r.json())
      .then(setResponses)
      .catch(console.error);
  }, [nextMatch]);

  // 3️⃣ Form submit handler with upsert
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !status || !nextMatch) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submitPoll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, date: nextMatch.date }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await fetch(`/api/getPoll?date=${nextMatch.date}`).then((r) =>
        r.json()
      );
      setResponses(updated);
      setName("");
      setStatus("");
    } catch (err) {
      console.error(err);
      alert("Error submitting: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 4️⃣ Build and copy WhatsApp summary
  const copySummary = () => {
    if (!nextMatch) return;
    const url = window.location.origin + window.location.pathname;
    const intro = `Monday 5-a-side this week: vs ${nextMatch.fixture} — ${nextMatch.dateFormatted} @ ${nextMatch.kickoff}\nWho's in? ${url}`;
    const lines = [
      intro,
      "",
      `✅ In: ${responses.in.join(", ") || "–"}`,
      `🤷 Maybe: ${responses.maybe.join(", ") || "–"}`,
      `❌ Out: ${responses.out.join(", ") || "–"}`,
    ].join("\n");
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="container">
      <h1>Monday 5-a-side</h1>

      {/* Next Match Header */}
      <h2>
        {nextMatch
          ? `Next match: vs ${nextMatch.fixture} — ${nextMatch.dateFormatted} @ ${nextMatch.kickoff}`
          : "No upcoming match found"}
      </h2>

      {/* Poll Form */}
      <form onSubmit={handleSubmit} className="poll-form">
        <label htmlFor="player-select">Name:</label>
        <select
          id="player-select"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        >
          <option value="">Select name</option>
          {roster.map((player) => (
            <option key={player} value={player}>
              {player}
            </option>
          ))}
        </select>

        <label htmlFor="status-select">Status:</label>
        <select
          id="status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
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

      {/* Live Responses & Copy Summary */}
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

          <button onClick={copySummary} className="copy-btn">
            Copy summary
          </button>
          {copied && <span className="copied-msg">Copied!</span>}
        </div>
      )}

      {/* Admin Dashboard */}
      <hr style={{ margin: "2rem 0" }} />
      <AdminPanel />
    </div>
  );
}

export default App;
