import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Info, Activity, Database, CircleDot, Unlock, AlertCircle, RefreshCw, Cpu, Zap } from 'lucide-react';
import './App.css';

const timeline = [
  { year: "0 AF", event: "The Fracture: Spatial fabric torn. FTL relays severed.", secret: "Vanguard warnings ignored by Directorate High Command." },
  { year: "10 AF", event: "Vanguard Defection: Scientists flee the Sovereign Mandate.", secret: "Took refinement cores 01 through 05." },
  { year: "30 AF", event: "The Purge: Directorate launches Black Signal. Thousands lost.", secret: "Signal frequency: 14.4THz. Source: Sovereign Prime." },
  { year: "40 AF", event: "Deep Veil Entry: First Echo-Diver engine successfully tested.", secret: "Pilot: Sola Vane. Time dilation: 4.2%." },
];

function App() {
  const [telemetry, setTelemetry] = useState(52.41);
  const [decryptedIndices, setDecryptedIndices] = useState<number[]>([]);
  const [synthStatus, setSynthStatus] = useState<'idle' | 'running' | 'success' | 'failure' | 'glitch'>('idle');
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => (parseFloat(prev.toString()) + (Math.random() - 0.5) * 0.1).toFixed(2));
      if (Math.random() > 0.98) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleDecrypt = (index: number) => {
    if (decryptedIndices.includes(index)) {
      setDecryptedIndices(decryptedIndices.filter(i => i !== index));
    } else {
      setDecryptedIndices([...decryptedIndices, index]);
    }
  };

  const handleSynthesis = () => {
    setSynthStatus('running');
    setTimeout(() => {
      const rand = Math.random();
      if (rand > 0.8) setSynthStatus('success');
      else if (rand > 0.2) setSynthStatus('failure');
      else setSynthStatus('glitch');
      
      setTimeout(() => setSynthStatus('idle'), 3000);
    }, 2000);
  };

  return (
    <div className={`echo-container ${glitchActive ? 'glitch-mode' : ''}`}>
      <div className="scanline" />
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
          <div className="status-container">
            <span className="status-tag">STATUS: ENCRYPTED // CONNECTION: STABLE</span>
            <div className="ping-dot" />
          </div>
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
                  <div className="year-row">
                    <div className="year glow-text-blue">{item.year}</div>
                    <button 
                      className={`decrypt-btn ${decryptedIndices.includes(i) ? 'active' : ''}`}
                      onClick={() => toggleDecrypt(i)}
                    >
                      <Unlock size={12} />
                      {decryptedIndices.includes(i) ? 'RE-ENCRYPT' : 'DECRYPT'}
                    </button>
                  </div>
                  <div className="event">{item.event}</div>
                  <AnimatePresence>
                    {decryptedIndices.includes(i) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="secret-content"
                      >
                        <Info size={12} />
                        <span>{item.secret}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              <AnimatePresence mode="wait">
                {synthStatus === 'running' && (
                  <motion.div 
                    key="running"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="synth-overlay active"
                  >
                    <RefreshCw className="spin" size={32} />
                    <span>SYNTHESIZING...</span>
                  </motion.div>
                )}
                {synthStatus === 'success' && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="synth-overlay success"
                  >
                    <CircleDot size={32} />
                    <span>STABLE ISOTOPE ACHIEVED</span>
                  </motion.div>
                )}
                {synthStatus === 'failure' && (
                  <motion.div 
                    key="failure"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="synth-overlay failure"
                  >
                    <AlertCircle size={32} />
                    <span>SYNTHESIS FAILED</span>
                  </motion.div>
                )}
                {synthStatus === 'glitch' && (
                  <motion.div 
                    key="glitch"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="synth-overlay glitch"
                  >
                    <Cpu size={32} />
                    <span>@#$!%-ERROR-&^%$</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="synthesis-overlay static">
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
            <button 
              className="echo-button full-width" 
              onClick={handleSynthesis}
              disabled={synthStatus !== 'idle'}
            >
              INITIATE SYNTHESIS
            </button>
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
                <div className="log-msg"><span className="log-time">[02:44]</span> Veil-Diver 04 signal detected</div>
                <div className="log-msg"><span className="log-time">[02:51]</span> Temporal slippage: +0.004s</div>
                <div className="log-msg"><span className="log-time">[03:12]</span> Particle flux normalization initiated</div>
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

