import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Info, Activity, Database, Zap, Share2, CircleDot } from 'lucide-react';
import './App.css';

const timeline = [
  { year: "0 AF", event: "The Fracture: Spatial fabric torn. FTL relays severed." },
  { year: "4 AF", event: "Vanguard Defection: Scientists flee the Sovereign Mandate." },
  { year: "12 AF", event: "The Purge: Directorate launches Black Signal. Thousands lost." },
  { year: "15 AF", event: "Deep Veil Entry: First Echo-Diver engine successfully tested." },
];

function App() {
  const [telemetry, setTelemetry] = useState(52.41);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => (prev + (Math.random() - 0.5) * 0.1).toFixed(2));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="echo-container">
      {/* Background Hero */}
      <div className="hero-background" style={{ backgroundImage: `url('/images/echo-hero.png')` }} />
      <div className="vignette" />

      {/* Nav */}
      <nav className="echo-nav glass-panel">
        <div className="nav-logo">
          <Eye className="glow-text-blue" size={24} />
          <span className="scientific">KYBIAN_ECHO</span>
        </div>
        <div className="nav-links">
          <a href="#archives">ARCHIVES</a>
          <a href="#synthesis">SYNTHESIS</a>
          <a href="#telemetry">TELEMETRY</a>
          <a href="https://kybian.com" className="hub-btn">HUB_RELAY</a>
        </div>
      </nav>

      <main className="echo-main">
        <header className="echo-header">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="scientific glow-text-violet"
          >
            RESEARCH_NODE_07
          </motion.h1>
          <p className="status-tag">STATUS: ENCRYPTED // CONNECTION: STABLE</p>
        </header>

        <div className="echo-grid">
          {/* Black Signal Archive */}
          <section id="archives" className="archive-section glass-panel">
            <div className="section-head">
              <Database size={20} className="glow-text-blue" />
              <h3 className="scientific">THE BLACK SIGNAL ARCHIVE</h3>
            </div>
            <div className="timeline">
              {timeline.map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="year glow-text-blue">{item.year}</div>
                  <div className="event">{item.event}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Isotope Synthesis */}
          <section id="synthesis" className="synthesis-section glass-panel">
            <div className="section-head">
              <Zap size={20} className="glow-text-violet" />
              <h3 className="scientific">ISOTOPE_SYNTHESIS</h3>
            </div>
            <div className="molecule-wrap">
              <img src="/images/echo-diagram.png" alt="Molecule" className="molecule-img" />
              <div className="synthesis-overlay">
                <div className="synth-row">
                  <span>ALPHA_PURITY:</span>
                  <span className="glow-text-blue">98.4%</span>
                </div>
                <div className="synth-row">
                  <span>STABILITY_INDEX:</span>
                  <span className="glow-text-violet">CRITICAL</span>
                </div>
              </div>
            </div>
            <button className="echo-button full-width">INITIATE SYNTHESIS</button>
          </section>

          {/* Telemetry Section */}
          <section id="telemetry" className="telemetry-section glass-panel">
            <div className="section-head">
              <Activity size={20} className="glow-text-blue" />
              <h3 className="scientific">DEEP_VEIL_TELEMETRY</h3>
            </div>
            <div className="telemetry-body">
              <div className="telemetry-main-stat">
                <span className="label">FRACTURE_DENSITY:</span>
                <span className="value glow-text-blue">{telemetry} kS/m³</span>
              </div>
              <div className="wave-sim">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                    transition={{ repeat: Infinity, duration: 1 + Math.random() }}
                    className="wave-bar"
                  />
                ))}
              </div>
              <div className="log-window">
                <div className="log-msg">[02:44] Veil-Diver 04 signal detected</div>
                <div className="log-msg">[02:51] Temporal slippage: +0.004s</div>
                <div className="log-msg">[03:12] Particle flux normalization initiated</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="echo-footer">
        <div className="footer-line" />
        <div className="footer-wrap">
          <span>PROJECT_STABLE_ISOTOPE // VANGUARD_FIVE_LEGACY</span>
          <span>LOCATION: REDACTED</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
