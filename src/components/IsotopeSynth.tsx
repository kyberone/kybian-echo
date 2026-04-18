import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, AlertCircle, CheckCircle2, Cpu, Info } from 'lucide-react';
import './IsotopeSynth.css';

interface Node {
  id: number;
  rotation: number; // 0, 60, 120, 180, 240, 300
  ports: number[]; // indices 0-5 (corners)
}

const IsotopeSynth: React.FC = () => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Neighbor map for a 3x3 staggered hex grid (pointy-topped)
  // Grid layout:
  // 0   1   2
  //   3   4   5
  // 6   7   8
  const neighborsMap: Record<number, { index: number; sharedCorners: { local: number; target: number }[] }[]> = {
    0: [{ index: 1, sharedCorners: [{ local: 1, target: 5 }] }, { index: 3, sharedCorners: [{ local: 2, target: 0 }, { local: 3, target: 5 }] }],
    1: [{ index: 0, sharedCorners: [{ local: 5, target: 1 }] }, { index: 2, sharedCorners: [{ local: 1, target: 5 }] }, { index: 3, sharedCorners: [{ local: 4, target: 0 }] }, { index: 4, sharedCorners: [{ local: 2, target: 0 }, { local: 3, target: 5 }] }],
    2: [{ index: 1, sharedCorners: [{ local: 5, target: 1 }] }, { index: 4, sharedCorners: [{ local: 4, target: 0 }] }, { index: 5, sharedCorners: [{ local: 2, target: 0 }, { local: 3, target: 5 }] }],
    3: [{ index: 0, sharedCorners: [{ local: 0, target: 2 }, { local: 5, target: 3 }] }, { index: 1, sharedCorners: [{ local: 0, target: 4 }] }, { index: 4, sharedCorners: [{ local: 1, target: 5 }] }, { index: 6, sharedCorners: [{ local: 3, target: 1 }] }, { index: 7, sharedCorners: [{ local: 2, target: 0 }, { local: 3, target: 5 }] }],
    4: [{ index: 1, sharedCorners: [{ local: 0, target: 2 }, { local: 5, target: 3 }] }, { index: 2, sharedCorners: [{ local: 0, target: 4 }] }, { index: 3, sharedCorners: [{ local: 5, target: 1 }] }, { index: 5, sharedCorners: [{ local: 1, target: 5 }] }, { index: 7, sharedCorners: [{ local: 3, target: 1 }] }, { index: 8, sharedCorners: [{ local: 2, target: 0 }, { local: 3, target: 5 }] }],
    5: [{ index: 2, sharedCorners: [{ local: 0, target: 2 }, { local: 5, target: 3 }] }, { index: 4, sharedCorners: [{ local: 5, target: 1 }] }, { index: 8, sharedCorners: [{ local: 3, target: 1 }] }],
    6: [{ index: 3, sharedCorners: [{ local: 1, target: 3 }] }, { index: 7, sharedCorners: [{ local: 1, target: 5 }] }],
    7: [{ index: 3, sharedCorners: [{ local: 0, target: 2 }, { local: 5, target: 3 }] }, { index: 4, sharedCorners: [{ local: 1, target: 3 }] }, { index: 6, sharedCorners: [{ local: 5, target: 1 }] }, { index: 8, sharedCorners: [{ local: 1, target: 5 }] }],
    8: [{ index: 4, sharedCorners: [{ local: 0, target: 2 }, { local: 5, target: 3 }] }, { index: 5, sharedCorners: [{ local: 1, target: 3 }] }, { index: 7, sharedCorners: [{ local: 5, target: 1 }] }],
  };

  const generateLevel = useCallback(() => {
    const newNodes: Node[] = [];
    for (let i = 0; i < 9; i++) {
      const pCount = 3; 
      const ports: number[] = [];
      while (ports.length < pCount) {
        const p = Math.floor(Math.random() * 6);
        if (!ports.includes(p)) ports.push(p);
      }
      newNodes.push({
        id: i,
        rotation: Math.floor(Math.random() * 6) * 60,
        ports,
      });
    }
    setNodes(newNodes);
    setTimeRemaining(60);
    setGameState('PLAYING');
  }, []);

  const rotateNode = (id: number) => {
    if (gameState !== 'PLAYING') return;
    setNodes(prev => prev.map(n => 
      n.id === id ? { ...n, rotation: (n.rotation + 60) % 360 } : n
    ));
  };

  // Helper to get active global port indices for a node
  const getGlobalPorts = (node: Node) => {
    const offset = node.rotation / 60;
    return node.ports.map(p => (p + offset) % 6);
  };

  // Calculate active connections (where two ports meet at a shared corner)
  const activeConnections = useMemo(() => {
    const connections: { nodeA: number; nodeB: number; corner: number }[] = [];
    
    nodes.forEach(node => {
      const globalPorts = getGlobalPorts(node);
      const neighbors = neighborsMap[node.id];
      if (!neighbors) return;

      neighbors.forEach(neighbor => {
        if (neighbor.index < node.id) return; // Prevent double counting
        const targetNode = nodes[neighbor.index];
        const targetGlobalPorts = getGlobalPorts(targetNode);

        neighbor.sharedCorners.forEach(shared => {
          if (globalPorts.includes(shared.local) && targetGlobalPorts.includes(shared.target)) {
            connections.push({ nodeA: node.id, nodeB: neighbor.index, corner: shared.local });
          }
        });
      });
    });
    return connections;
  }, [nodes]);

  const stability = useMemo(() => {
    if (nodes.length === 0) return 0;
    // Goal: 10 connections for 100% stability
    return Math.min(100, (activeConnections.length / 10) * 100);
  }, [activeConnections, nodes]);

  useEffect(() => {
    if (gameState === 'PLAYING' && stability >= 100) {
      setGameState('SUCCESS');
    }
  }, [stability, gameState]);

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
          <span className="scientific">VANGUARD_SYNTH_v1.1</span>
        </div>
        <div className="synth-stats">
          <div className="stat-group">
            <span className="label">STABILITY:</span>
            <div className="bar-bg">
              <motion.div 
                className="bar-fill" 
                animate={{ width: `${stability}%`, backgroundColor: stability > 80 ? '#00d2ff' : '#9d50bb' }}
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
                <h4>SYNTHESIS_PROTOCOL:</h4>
                <p>Rotate nodes to align ports at shared vertices. Connected ports will glow white.</p>
                <ul>
                  <li>• CLICK TO ROTATE NODES</li>
                  <li>• ALIGN CORNER DOTS TO CONNECT</li>
                  <li>• REACH 100% STABILITY TO LOCK SEQUENCE</li>
                </ul>
              </div>
              <button onClick={generateLevel} className="echo-button">INITIATE_RESEARCH</button>
            </motion.div>
          )}

          {gameState === 'FAILURE' && (
            <motion.div key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="synth-overlay fatal">
              <AlertCircle size={48} color="#9d50bb" />
              <h3 className="scientific">CRITICAL_STABILITY_LOSS</h3>
              <p>Network collapsed. Temporal shockwaves detected.</p>
              <button onClick={generateLevel} className="echo-button">RE-INITIATE</button>
            </motion.div>
          )}

          {gameState === 'SUCCESS' && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="synth-overlay success">
              <CheckCircle2 size={48} color="#00d2ff" />
              <h3 className="scientific">STABLE_NETWORK_LOCKED</h3>
              <p>Resonance: 100%. Data logged to Vanguard Archive.</p>
              <button onClick={generateLevel} className="echo-button">NEXT_SEQUENCE</button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <div className="hex-grid-container">
              <div className="hex-grid">
                {nodes.map(node => {
                  const globalPorts = getGlobalPorts(node);
                  return (
                    <motion.div
                      key={node.id}
                      className="hex-node"
                      onClick={() => rotateNode(node.id)}
                      animate={{ rotate: node.rotation }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="hex-inner">
                        <div className="hex-shape" />
                        <div className="hex-center">
                          <Zap size={20} className={stability > 50 ? 'glow-text-blue' : 'glow-text-violet'} />
                        </div>
                        {node.ports.map(p => {
                          const globalP = (p + (node.rotation/60)) % 6;
                          // Check if this specific corner is connected to ANY neighbor
                          const isConnected = activeConnections.some(c => 
                            (c.nodeA === node.id && c.corner === globalP) || 
                            (c.nodeB === node.id && (neighborsMap[c.nodeA]?.find(n => n.index === node.id)?.sharedCorners.find(s => s.target === globalP)))
                          );

                          return (
                            <div key={p} className={`hex-port port-${p} ${isConnected ? 'connected' : ''}`} />
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="synth-footer">
        <Info size={14} className="glow-text-blue" />
        <span className="scientific">LINK_COUNT: {activeConnections.length} // STABILITY: {stability.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default IsotopeSynth;
