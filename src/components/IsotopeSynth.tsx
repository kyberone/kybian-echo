import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, AlertCircle, CheckCircle2, Cpu, Info } from 'lucide-react';
import './IsotopeSynth.css';

interface Node {
  id: number;
  rotation: number; // 0, 60, 120, 180, 240, 300
  ports: number[]; // local vertex indices 0-5
  gridX: number;
  gridY: number;
}

const IsotopeSynth: React.FC = () => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);

  // Constants for spatial calculation
  const HEX_WIDTH = 110;
  const HEX_HEIGHT = 120;
  const RADIUS = 60;

  const generateLevel = useCallback(() => {
    const newNodes: Node[] = [];
    // 3x3 Grid
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      
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
        gridX: col,
        gridY: row,
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

  // Calculate the world-space position of a specific vertex
  const getVertexWorldPos = (node: Node, vertexIndex: number) => {
    // Center of the hexagon in a staggered grid
    // Column spacing is HEX_WIDTH, but staggered rows offset the middle column
    let cx = node.gridX * HEX_WIDTH;
    let cy = node.gridY * (HEX_HEIGHT * 0.75 + 15); // Approximate vertical spacing
    
    // Middle column (gridX === 1) is staggered down
    if (node.gridX === 1) {
      cy += 60; // From CSS: transform: translateY(60px)
    }

    // Angle of the vertex considering rotation
    // Pointy-topped: index 0 is at -90deg (top)
    const angleDeg = (vertexIndex * 60) + node.rotation - 90;
    const angleRad = (Math.PI / 180) * angleDeg;

    return {
      x: Math.round(cx + RADIUS * Math.cos(angleRad)),
      y: Math.round(cy + RADIUS * Math.sin(angleRad)),
    };
  };

  // Find all vertex-to-vertex connections
  const connections = useMemo(() => {
    const active: { nodeId: number; portIndex: number; key: string }[] = [];
    const worldMap: Record<string, { nodeId: number; portIndex: number }[]> = {};

    nodes.forEach(node => {
      node.ports.forEach(p => {
        const pos = getVertexWorldPos(node, p);
        const key = `${pos.x},${pos.y}`;
        if (!worldMap[key]) worldMap[key] = [];
        worldMap[key].push({ nodeId: node.id, portIndex: p });
      });
    });

    // A connection exists if 2 or more ports occupy the same world-space key
    Object.entries(worldMap).forEach(([key, occupants]) => {
      if (occupants.length >= 2) {
        occupants.forEach(occ => active.push({ ...occ, key }));
      }
    });

    return active;
  }, [nodes]);

  const stability = useMemo(() => {
    if (nodes.length === 0) return 0;
    // Goal: 10 connections for 100% stability
    // divide by 2 because each connection has 2 ports
    return Math.min(100, (connections.length / 20) * 100);
  }, [connections, nodes]);

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
          <span className="scientific">VANGUARD_SYNTH_v1.2</span>
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
                      <div className="hex-shape" />
                      <div className="hex-center">
                        <Zap size={20} className={stability > 50 ? 'glow-text-blue' : 'glow-text-violet'} />
                      </div>
                      {node.ports.map(p => {
                        const isConnected = connections.some(c => c.nodeId === node.id && c.portIndex === p);
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
        <span className="scientific">LINK_COUNT: {connections.length / 2} // STABILITY: {stability.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default IsotopeSynth;
