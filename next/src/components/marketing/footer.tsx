export function Footer() {
  return (
    <footer className="marketing-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="footer-brand">BoloDB</span>
          <div className="footer-links">
            <a href="https://github.com/HAAHIT/bolodb/tree/master/docs" className="footer-link">Docs</a>
            <a href="https://github.com/HAAHIT/bolodb" className="footer-link">GitHub</a>
            <a href="/privacy" className="footer-link">Privacy</a>
            <a href="/terms" className="footer-link">Terms</a>
          </div>
        </div>
        <div className="footer-right">
          <p className="footer-reassurance">Your database data never leaves your machine. Anonymous product analytics only, honors Do Not Track.</p>
          <p className="footer-copy">© 2026 BoloDB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
