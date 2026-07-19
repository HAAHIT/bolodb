"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { trackDemoViewed } from "@/lib/marketing/analytics";
import { motionPrefs } from "@/lib/motion/motion-prefs";

const QUESTIONS = [
  "Show me the top 3 customers this month by revenue",
  "Which products are low on stock right now?",
  "How do refunds compare to last quarter?",
];

const SQL = "SELECT name, SUM(revenue) AS total\nFROM customers\nJOIN orders ON orders.customer_id = customers.id\nWHERE orders.created_at >= date('now','start of month')\nGROUP BY customers.id\nORDER BY total DESC\nLIMIT 3;";

const ROWS: [string, string][] = [
  ["Acme Corp", "$124,500"],
  ["Globex Inc", "$98,200"],
  ["Initech", "$86,450"],
];

function addRow(rowsEl: HTMLElement, r: [string, string], animate: boolean) {
  const tr = document.createElement("tr");
  const td1 = document.createElement("td");
  td1.textContent = r[0];
  const td2 = document.createElement("td");
  td2.className = "num";
  td2.textContent = r[1];
  tr.appendChild(td1);
  tr.appendChild(td2);
  if (animate) {
    tr.className = "row-anim";
    tr.style.opacity = "0";
    tr.style.transform = "translateY(8px)";
  }
  rowsEl.appendChild(tr);
  if (animate) {
    requestAnimationFrame(() => {
      tr.style.transition = "opacity .4s var(--ease), transform .4s var(--ease)";
      tr.style.opacity = "1";
      tr.style.transform = "none";
    });
  }
}

export function LiveDemo() {
  const [typedText, setTypedText] = useState("");
  const [answerHidden, setAnswerHidden] = useState(true);
  const [thinkingHidden, setThinkingHidden] = useState(false);
  const [sqlHidden, setSqlHidden] = useState(true);
  const [resultHidden, setResultHidden] = useState(true);
  const [skip, setSkip] = useState(false);
  const [qi, setQi] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const resetState = useCallback(() => {
    clearTimers();
    setTypedText("");
    setAnswerHidden(true);
    setThinkingHidden(false);
    setSqlHidden(true);
    setResultHidden(true);
    if (tbodyRef.current) {
      tbodyRef.current.innerHTML = "";
    }
  }, [clearTimers]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (motionPrefs.reduced) {
      setTypedText(QUESTIONS[0]);
      setAnswerHidden(false);
      setThinkingHidden(true);
      setSqlHidden(false);
      setResultHidden(false);
      const tbody = tbodyRef.current;
      if (tbody) {
        ROWS.forEach((row) => addRow(tbody, row, false));
      }
      return;
    }

    if (skip) return;

    const panel = panelRef.current;
    if (!panel) return;

    const runCycle = (questionIdx: number) => {
      if (!mountedRef.current) return;
      resetState();

      const question = QUESTIONS[questionIdx];
      let i = 0;

      const typeTimer = setInterval(() => {
        if (!mountedRef.current) { clearInterval(typeTimer); return; }
        if (i < question.length) {
          setTypedText(question.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typeTimer);

          const t1 = setTimeout(() => {
            if (!mountedRef.current) return;
            setAnswerHidden(false);
            setThinkingHidden(true);
          }, 500);
          timersRef.current.push(t1);

          const t2 = setTimeout(() => {
            if (!mountedRef.current) return;
            setThinkingHidden(true);
            setSqlHidden(false);
          }, 1500);
          timersRef.current.push(t2);

          const t3 = setTimeout(() => {
            if (!mountedRef.current) return;
            setResultHidden(false);
            const tbody = tbodyRef.current;
            if (tbody) {
              ROWS.forEach((row, idx) => {
                const tr = setTimeout(() => {
                  if (mountedRef.current) addRow(tbody, row, true);
                }, idx * 160);
                timersRef.current.push(tr);
              });
            }
          }, 2500);
          timersRef.current.push(t3);

          const t4 = setTimeout(() => {
            if (!mountedRef.current) return;
            setQi((prev) => (prev + 1) % QUESTIONS.length);
          }, 6200);
          timersRef.current.push(t4);
        }
      }, 38);
      timersRef.current.push(typeTimer as unknown as ReturnType<typeof setTimeout>);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && mountedRef.current && !runningRef.current) {
            runningRef.current = true;
            runCycle(qi);
          } else if (!entry.isIntersecting) {
            clearTimers();
            runningRef.current = false;
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(panel);

    return () => {
      observer.disconnect();
      clearTimers();
      runningRef.current = false;
    };
  }, [qi, skip, resetState, clearTimers]);

  const handleSkip = useCallback(() => {
    setSkip(true);
    clearTimers();
    setTypedText(QUESTIONS[qi]);
    setAnswerHidden(false);
    setThinkingHidden(true);
    setSqlHidden(false);
    setResultHidden(false);
    const tbody = tbodyRef.current;
    if (tbody) {
      tbody.innerHTML = "";
      ROWS.forEach((row) => addRow(tbody, row, false));
    }
    trackDemoViewed();
  }, [qi, clearTimers]);

  const handlePlay = useCallback(() => {
    setSkip(false);
    setQi(0);
    resetState();
  }, [resetState]);

  return (
    <section id="demo" className="demo-section" aria-label="Product demo">
      <h2 className="section-title">See it in action</h2>
      <div className="demo-panel" ref={panelRef}>
        <div className="demo-top">
          <span className="demo-badge">Demo</span>
          <button className="skip-btn" aria-pressed={skip} onClick={skip ? handlePlay : handleSkip}>
            {skip ? "Replay" : "Skip"}
          </button>
        </div>
        <div className="demo-body">
          <div className="bubble user">
            <span>{typedText}</span><span className="caret">|</span>
          </div>
          <div className="answer" hidden={answerHidden} style={answerHidden ? { display: "none" } : {}}>
            <div className="ai-avatar" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a2 2 0 0 1 2 2c-.11.66-.54 1.18-1.07 1.57"></path>
                <path d="M15 14h6"></path>
                <path d="M15 10h6"></path>
                <circle cx="8" cy="12" r="6"></circle>
              </svg>
            </div>
            <div className="answer-body">
              <div className="thinking" hidden={thinkingHidden} style={thinkingHidden ? { display: "none" } : {}}>
                <span className="mini-spin"></span> Thinking…
              </div>
              <div className="sql-block" hidden={sqlHidden} style={sqlHidden ? { display: "none" } : {}}>
                <div className="sql-head mono">Generated SQL</div>
                <pre className="sql-code mono"><code>{SQL}</code></pre>
              </div>
              <div className="result" hidden={resultHidden} style={resultHidden ? { display: "none" } : {}}>
                <div className="result-top">
                  <span className="conf conf-high pop"><span className="dot"></span>High confidence</span>
                  <span className="result-meta mono">3 rows · 41ms</span>
                </div>
                <table className="result-table">
                  <thead><tr><th>Customer</th><th className="num">Revenue</th></tr></thead>
                  <tbody id="demo-rows" ref={tbodyRef}></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="demo-alt">BoloDB turns plain-English questions into SQL, runs them against your database, and returns results with a confidence score.</p>
    </section>
  );
}
