import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("yes");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const date = new Date().toISOString().split("T")[0]; // e.g. 2025-05-20

    const res = await fetch("/api/submitPoll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status, date }),
    });

    if (res.ok) setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
      <h2>5-A-Side Poll</h2>
      <p>For this coming Monday</p>
      {submitted ? (
        <p>Thanks for voting, {name}!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            required
            value={name}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <label>
            <input
              type="radio"
              value="yes"
              checked={status === "yes"}
              onChange={() => setStatus("yes")}
            />
            &nbsp;Yes, I can play
          </label>
          <br />
          <label>
            <input
              type="radio"
              value="no"
              checked={status === "no"}
              onChange={() => setStatus("no")}
            />
            &nbsp;No, not this week
          </label>
          <br />
          <button type="submit" style={{ marginTop: "1rem" }}>
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
