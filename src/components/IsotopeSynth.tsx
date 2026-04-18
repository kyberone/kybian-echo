import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, AlertCircle, CheckCircle2, Cpu, Info } from 'lucide-react';
import './IsotopeSynth.css';

interface Node {
  id: number;
  rotation: number; // 0, 60, 120, 180, 240, 300 degrees
  connections: number[]; // indices of sides that have ports [0-5]
  isActive: boolean;
}

const IsotopeSynth: React.FC = () => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [instability, setInstability] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(60);

  const GRID_SIZE = 9; // 3x3 grid

  const generateLevel = useCallback(() => {
    const newNodes: Node[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      // Random ports for each node
      const portsCount = Math.floor(Math.random() * 3) + 2;
      const ports: number[] = [];
      while (ports.length < portsCount) {
        const p = Math.floor(Math.random() * 6);
        if (!ports.includes(p)) ports.push(p);
      }
      
      newNodes.push({
        id: i,
        rotation: Math.floor(Math.random() * 6) * 60,
        connections: ports,
        isActive: false,
      });
    }
    setNodes(newNodes);
    setInstability(100);
    setTimeRemaining(60);
    setGameState('PLAYING');
  }, []);

  const rotateNode = (id: number) => {
    if (gameState !== 'PLAYING') return;
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, rotation: (node.rotation + 60) % 360 } : node
    ));
  };

  // Logic to check if nodes are aligned (simplified for prototype)
  // In a real game, this would check if ports of adjacent hexagons touch
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    // Check stability (simulated check)
    // If multiple nodes have specific rotations, reduce instability
    const totalRotation = nodes.reduce((sum, n) => sum + n.rotation, 0);
    const targetRotation = 720; // Dummy target
    const diff = Math.abs(totalRotation - targetRotation);
    const newInstability = Math.min(100, Math.max(0, (diff / 1000) * 100));
    
    setInstability(newInstability);

    if (newInstability < 5) {
      setGameState('SUCCESS');
    }
  }, [nodes, gameState]);

  useEffect(() => {
    let timer: number;
    if (gameState === 'PLAYING' && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('FAILURE');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeRemaining]);

  return (
    <div className="synth-game-container glass-panel">
      <div className="synth-header">
        <div className="header-top">
          <Cpu size={16} className="glow-text-violet" />
          <span className="scientific">VANGUARD_SYNTH_v0.9</span>
        </div>
        <div className="synth-stats">
          <div className="stat-group">
            <span className="label">INSTABILITY:</span>
            <div className="bar-bg">
              <motion.div 
                className="bar-fill" 
                animate={{ width: `${instability}%`, backgroundColor: instability > 50 ? '#9d50bb' : '#00d2ff' }}
              />
            </div>
          </div>
          <div className="stat-group">
            <span className="label">SLIPPAGE:</span>
            <span className={timeRemaining < 15 ? 'glow-text-violet blink' : 'glow-text-blue'}>
              {timeRemaining}s
            </span>
          </div>
        </div>
      </div>

      <div className="synth-grid-viewport">
        <AnimatePresence mode="wait">
          {gameState === 'IDLE' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="synth-overlay">
              <Zap size={40} className="glow-text-violet mb-20" />
              <h3 className="scientific">ISOTOPE_SYNTH</h3>
              <div className="synth-manual glass-panel">
                <h4>MANUAL_01:</h4>
                <p>Stabilize the jagged Kybian isotope before temporal slippage occurs.</p>
                <ul>
                  <li>• CLICK NODES TO ROTATE</li>
                  <li>• ALIGN PORTS TO REDUCE INSTABILITY</li>
                  <li>• TARGET: [ INSTABILITY &lt; 5% ]</li>
                </ul>
              </div>
              <button onClick={generateLevel} className="echo-button">INITIATE_RESEARCH</button>
            </motion.div>
          )}

          {gameState === 'FAILURE' && (
            <motion.div key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="synth-overlay fatal">
              <AlertCircle size={48} color="#9d50bb" />
              <h3 className="scientific">SYNTHESIS_CRITICAL_FAILURE</h3>
              <p>Isotope collapsed. Temporal shockwaves detected.</p>
              <button onClick={generateLevel} className="echo-button">RE-INITIATE</button>
            </motion.div>
          )}

          {gameState === 'SUCCESS' && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="synth-overlay success">
              <CheckCircle2 size={48} color="#00d2ff" />
              <h3 className="scientific">STABLE_ISOTOPE_ACHIEVED</h3>
              <p>Purity: 99.9%. Data logged to Vanguard Archive.</p>
              <button onClick={generateLevel} className="echo-button">NEXT_SEQUENCE</button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <div className="hex-grid">
              {nodes.map(node => (
                <motion.div
                  key={node.id}
                  className="hex-node"
                  onClick={() => rotateNode(node.id)}
                  animate={{ rotate: node.rotation }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="hex-inner">
                    <div className="hex-center">
                      <Zap size={20} className={instability < 20 ? 'glow-text-blue' : 'glow-text-violet'} />
                    </div>
                    {node.connections.map(p => (
                      <div key={p} className={`hex-port port-${p}`} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="synth-footer">
        <Info size={14} className="glow-text-blue" />
        <span className="scientific">RESONANCE_SCANNER: {instability.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default IsotopeSynth;
