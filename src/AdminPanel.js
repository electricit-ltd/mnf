// src/AdminPanel.js
import React, { useState } from "react";
import fixtures from "./fixtures.json";

export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [data, setData] = useState(null);

  const login = async () => {
    const res = await fetch(`/api/getAllPolls`, {
      headers: { "x-admin-key": key }
    });
    if (res.ok) {
      const grouped = await res.json();
      setData(grouped);
    } else {
      alert("Invalid admin key");
    }
  };

  if (!data) {
    return (
      <div className="admin-login">
        <h2>Admin Dashboard</h2>
        <input
          type="password"
          placeholder="Enter admin key"
          value={key}
          onChange={e => setKey(e.target.value)}
        />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h2>All Poll Responses</h2>
      {Object.entries(groupedOrder(fixtures, data)).map(
        ([date, { fixture, dateFormatted }], idx) => {
          const resp = data[date] || { in: [], maybe: [], out: [] };
          return (
            <div key={date} className="fixture-block">
              <h3>
                {dateFormatted} – vs {fixture}
              </h3>
              <p><strong>✅ In:</strong> {resp.in.join(", ") || "–"}</p>
              <p><strong>🤷 Maybe:</strong> {resp.maybe.join(", ") || "–"}</p>
              <p><strong>❌ Out:</strong> {resp.out.join(", ") || "–"}</p>
            </div>
          );
        }
      )}
    </div>
  );
}

// utility to preserve fixture order and add formatted labels
function groupedOrder(fixtures, data) {
  return fixtures.reduce((acc, f) => {
    const dateObj = new Date(f.date);
    const dateFormatted = dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    acc[f.date] = {
      fixture: f.opponent,
      dateFormatted
    };
    return acc;
  }, {});
}
