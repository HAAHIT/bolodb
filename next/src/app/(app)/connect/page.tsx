"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectScreen } from "@/components/connect/connect-screen";
import { appState, useAppState } from "@/lib/app-state";

export default function ConnectPage() {
  const router = useRouter();
  const state = useAppState();
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);

  const isConnected = state.isLoaded && !!state.dbInfo;

  useEffect(() => {
    if (!state.isLoaded) {
      appState.init(false);
    }
  }, []);

  useEffect(() => {
    document.title = `${isConnected ? "Switch Database" : "Connect"} — BoloDB`;
  }, [isConnected]);

  function handleDisconnect() {
    setShowSwitchConfirm(false);
    appState.disconnect(router);
  }

  return (
    <div className="connect-scroll">
      {isConnected && (
        <div className="connected-banner">
          <div className="connected-banner-inner">
            <div className="connected-info">
              <span className="connected-dot"></span>
              <span className="connected-label">
                Connected to <strong>{state.dbInfo!.dialect || "database"}</strong>
                {state.dbInfo!.tables
                  ? ` · ${state.dbInfo!.tables} table${state.dbInfo!.tables === 1 ? "" : "s"}`
                  : ""}
              </span>
            </div>
            <div className="connected-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => router.push("/chat")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to chat
              </button>
              {!showSwitchConfirm ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSwitchConfirm(true)}>
                  Switch database
                </button>
              ) : (
                <div className="switch-confirm">
                  <span className="switch-confirm-text">Switch? This will disconnect the current database.</span>
                  <button className="btn btn-sm" style={{ background: "var(--c-low)", color: "#fff" }} onClick={handleDisconnect}>
                    Confirm switch
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowSwitchConfirm(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ConnectScreen
        onConnect={(isSample, res) => appState.setConnect(isSample, res, router)}
      />
    </div>
  );
}
