// src/App.js
import React, { useState, useEffect } from "react";
import "./styles.css";
import fixtures from "./fixtures.json";

function App() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [match, setMatch] = useState(null);

  useEffect(() => {
    const today = new Date();
    const upcoming = fixtures
      .map((fixture) => ({
        ...fixture,
        dateObj: new Date(fixture.date),
      }))
      .filter((fixture) => fixture.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)[0];

    setMatch(upcoming || null);
  }, []);

  const handleSubmit = async () => {
    if (!name || !status) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/submitPoll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          status,
          date: match?.date,
        }),
      });

      const result = await res.json();
      alert(result.body || "Submitted");
      setName("");
      setStatus("");
    } catch (err) {
      console.error(err);
      alert("Error submitting response.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Monday 5-a-side</h2>
        {match && (
          <p className="fixture">
            <strong>{match.dateFormatted}</strong>: {match.fixture} @ {match.kickoff}
          </p>
        )}
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={submitting}
        >
          <option value="">Select status</option>
          <option value="Yes">Yes</option>
          <option value="Maybe">Maybe</option>
          <option value="No">No</option>
        </select>
        <button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default App;
