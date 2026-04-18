import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, AlertCircle, CheckCircle2, Cpu, Info } from 'lucide-react';
import './IsotopeSynth.css';

interface Node {
  id: number;
  rotation: number; // 0, 60, 120, 180, 240, 300
  ports: number[]; // indices 0-5
}

const IsotopeSynth: React.FC = () => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);

  const GRID_SIZE = 3; // 3x3

  // Define neighbors for each node index (0-8)
  // Directions: 0:N, 1:NE, 2:SE, 3:S, 4:SW, 5:NW
  // This is a simplified "flat-topped" hex neighbor map for a 3x3 grid
  const neighborsMap: Record<number, { index: number; dir: number; opp: number }[]> = {
    0: [{ index: 1, dir: 1, opp: 4 }, { index: 3, dir: 3, opp: 0 }],
    1: [{ index: 0, dir: 4, opp: 1 }, { index: 2, dir: 1, opp: 4 }, { index: 4, dir: 3, opp: 0 }],
    2: [{ index: 1, dir: 4, opp: 1 }, { index: 5, dir: 3, opp: 0 }],
    3: [{ index: 0, dir: 0, opp: 3 }, { index: 4, dir: 1, opp: 4 }, { index: 6, dir: 3, opp: 0 }],
    4: [{ index: 1, dir: 0, opp: 3 }, { index: 3, dir: 4, opp: 1 }, { index: 5, dir: 1, opp: 4 }, { index: 7, dir: 3, opp: 0 }],
    5: [{ index: 2, dir: 0, opp: 3 }, { index: 4, dir: 4, opp: 1 }, { index: 8, dir: 3, opp: 0 }],
    6: [{ index: 3, dir: 0, opp: 3 }, { index: 7, dir: 1, opp: 4 }],
    7: [{ index: 4, dir: 0, opp: 3 }, { index: 6, dir: 4, opp: 1 }, { index: 8, dir: 1, opp: 4 }],
    8: [{ index: 5, dir: 0, opp: 3 }, { index: 7, dir: 4, opp: 1 }],
  };

  const generateLevel = useCallback(() => {
    const newNodes: Node[] = [];
    for (let i = 0; i < 9; i++) {
      // Give each node 2-3 random ports
      const pCount = i === 4 ? 4 : 2; // Center node has more ports
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

  // Calculate active connections
  const activeConnections = useMemo(() => {
    const connections: string[] = []; // Store as "id1-id2"
    nodes.forEach(node => {
      const neighbors = neighborsMap[node.id];
      if (!neighbors) return;

      neighbors.forEach(neighbor => {
        const targetNode = nodes[neighbor.index];
        if (!targetNode) return;

        // Check if current node has a port facing the neighbor
        // Local port = (neighbor.dir - (node.rotation / 60) + 6) % 6
        const localPort = (neighbor.dir - (node.rotation / 60) + 6) % 6;
        // Check if target node has a port facing back
        const targetLocalPort = (neighbor.opp - (targetNode.rotation / 60) + 6) % 6;

        if (node.ports.includes(localPort) && targetNode.ports.includes(targetLocalPort)) {
          const pair = [node.id, targetNode.id].sort().join('-');
          if (!connections.includes(pair)) connections.push(pair);
        }
      });
    });
    return connections;
  }, [nodes]);

  const stability = useMemo(() => {
    if (nodes.length === 0) return 0;
    // Target is to have at least 8 connections in a 3x3 grid
    return Math.min(100, (activeConnections.length / 8) * 100);
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
          <span className="scientific">VANGUARD_SYNTH_v1.0</span>
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
                <p>Connect the jagged isotopes to form a stable molecular network.</p>
                <ul>
                  <li>• CLICK TO ROTATE NODES</li>
                  <li>• ALIGN PORTS TO FORM [ ENERGY_BEAMS ]</li>
                  <li>• CONNECT ALL NODES TO REACH 100% STABILITY</li>
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
                        <Zap size={20} className={stability > 50 ? 'glow-text-blue' : 'glow-text-violet'} />
                      </div>
                      {node.ports.map(p => {
                        // Determine if this port is part of an active connection
                        const isConnected = neighborsMap[node.id]?.some(neighbor => {
                           const targetNode = nodes[neighbor.index];
                           const localDir = (neighbor.dir - (node.rotation/60) + 6) % 6;
                           if (localDir !== p) return false;
                           const targetLocalDir = (neighbor.opp - (targetNode.rotation/60) + 6) % 6;
                           return targetNode.ports.includes(targetLocalDir);
                        });

                        return (
                          <div key={p} className={`hex-port port-${p} ${isConnected ? 'connected' : ''}`} />
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
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
