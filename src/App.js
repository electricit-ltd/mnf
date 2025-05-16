import React, { useState, useEffect } from "react";
import "./styles.css";
import fixtures from "./fixtures.json";

function App() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextFixture, setNextFixture] = useState(null);

  useEffect(() => {
    const today = new Date();

    const upcoming = fixtures.find((fixture) => {
      const fixtureDate = new Date(fixture.date);
      return fixtureDate >= today;
    });

    setNextFixture(upcoming);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !status || !nextFixture) return;

    setSubmitting(true);
    await fetch("/api/submitPoll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        status,
        date: nextFixture.date,
      }),
    });
    setSubmitting(false);
    setName("");
    setStatus("");
  };

  return (
    <div className="container">
      <h1>Monday 5-a-side</h1>
      <h2>
        {nextFixture
          ? `Next match: ${nextFixture.opponent} @ ${nextFixture.time}`
          : "No upcoming match found"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select status</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="maybe">Maybe</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default App;
