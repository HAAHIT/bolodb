"use client";

import { useState } from "react";

const dbs = [
  { name: "PostgreSQL", color: "#336791" },
  { name: "MySQL", color: "#4479A1" },
  { name: "SQL Server", color: "#CC2927" },
  { name: "SQLite", color: "#003B57" },
];

const connStrings: Record<string, { label: string; code: string }[]> = {
  PostgreSQL: [
    { label: "URL", code: "postgresql://user:pass@host:5432/dbname" },
    { label: "Params", code: "host=localhost port=5432 dbname=mydb user=myuser password=mypass" },
  ],
  MySQL: [
    { label: "URL", code: "mysql://user:pass@host:3306/dbname" },
    { label: "Params", code: "host=localhost port=3306 dbname=mydb user=myuser password=mypass" },
  ],
  "SQL Server": [
    { label: "URL", code: "sqlserver://host:1433;database=dbname;user=myuser;password=mypass;" },
    { label: "Params", code: "server=localhost,1433;database=mydb;user id=myuser;password=mypass;" },
  ],
  SQLite: [
    { label: "File path", code: "/path/to/your/database.db" },
    { label: "In-memory", code: ":memory:" },
  ],
};

export function Integrations() {
  const [activeDb, setActiveDb] = useState("PostgreSQL");
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  return (
    <section id="integrations" className="integrations-section">
      <h2 className="section-title">Works with every major database</h2>
      <div className="db-grid">
        {dbs.map((db) => (
          <button key={db.name} className={"db-card" + (activeDb === db.name ? " active-db" : "")} onClick={() => { setActiveDb(db.name); setActiveTabIdx(0); }}>
            <div className="db-logo-circle" style={{ background: db.color + "15", color: db.color }}>{db.name.slice(0, 2)}</div>
            <span className="db-name">{db.name}</span>
          </button>
        ))}
      </div>
      <div className="conn-strings">
        <div className="conn-tabs" role="tablist" aria-label="Connection string format">
          {connStrings[activeDb].map((tab, i) => (
            <button key={i} type="button" id={"conn-tab-" + i} className={"conn-tab" + (i === activeTabIdx ? " active-tab" : "")} role="tab" aria-selected={i === activeTabIdx} aria-controls={"conn-panel-" + i} onClick={() => setActiveTabIdx(i)}>{tab.label}</button>
          ))}
        </div>
        <div id={"conn-panel-" + activeTabIdx} role="tabpanel" tabIndex={0} aria-labelledby={"conn-tab-" + activeTabIdx}>
          <pre className="conn-code">{connStrings[activeDb][activeTabIdx].code}</pre>
        </div>
        <p className="conn-tip">Tip: use a read-only database account — BoloDB never writes to your data.</p>
      </div>
      <p className="any-db">+ any SQL database via connection string</p>
    </section>
  );
}
