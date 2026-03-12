import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';
import { Html, Float, Text } from '@react-three/drei';

const Pin = ({ id, position, name, onConnect }: { id: string, position: [number, number, number], name: string, onConnect: (id: string, pos: THREE.Vector3) => void }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);
  
  return (
    <group ref={ref} position={position}>
      <mesh 
        onPointerOver={() => setHovered(true)} 
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          const worldPos = new THREE.Vector3();
          ref.current?.getWorldPosition(worldPos);
          onConnect(id, worldPos);
        }}
      >
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial 
          color={hovered ? "#00ff00" : "#a0a0a0"} 
          metalness={0.8} 
          roughness={0.2}
          emissive={hovered ? "#00ff00" : "black"} 
          emissiveIntensity={0.5} 
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={5}>
          <div className="bg-black/90 text-white text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/50 whitespace-nowrap shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

export const LED: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], color?: string, state?: 'normal' | 'success' | 'failure', onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], color = 'red', state: stateProp = 'normal', onPinConnect }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { isRunning, selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = isRunning && stateProp !== 'failure' ? 2 + Math.sin(state.clock.elapsedTime * 15) * 0.5 : 0;
    }
  });

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* Plastic Base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 32, 1, false, 0, Math.PI * 1.8]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Flat side of base */}
      <mesh position={[0.22, 0.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.15]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Epoxy Bulb */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial 
          color={stateProp === 'failure' ? '#111' : color} 
          emissive={isRunning && stateProp !== 'failure' ? color : 'black'}
          emissiveIntensity={stateProp === 'failure' ? 0 : 2}
          transparent
          opacity={0.7}
          transmission={0.5}
          thickness={0.5}
          roughness={0.1}
          metalness={0}
        />
      </mesh>
      {/* Internal Anode/Cathode structure */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.05]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Pins */}
      <Pin id={`${id}-anode`} position={[-0.1, 0, 0]} name="Anode (+)" onConnect={onPinConnect} />
      <Pin id={`${id}-cathode`} position={[0.1, 0, 0]} name="Cathode (-)" onConnect={onPinConnect} />

      {isRunning && stateProp !== 'failure' && (
        <pointLight ref={lightRef} position={[0, 0.4, 0]} color={color} distance={4} decay={2} />
      )}
      
      {stateProp === 'failure' && (
        <group position={[0, 0.5, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="black" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const LightBulb: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], state?: 'normal' | 'success' | 'failure', onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], state: stateProp = 'normal', onPinConnect }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const { isRunning, selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = isRunning && stateProp !== 'failure' ? 5 + Math.sin(state.clock.elapsedTime * 20) * 0.5 : 0;
    }
  });

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* Metal Base (Screw type) */}
      <group position={[0, 0.15, 0]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Screw threads (simplified) */}
        {[0, 0.05, 0.1, -0.05, -0.1].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.01, 8, 32]} />
            <meshStandardMaterial color="#888" metalness={1} />
          </mesh>
        ))}
      </group>
      {/* Glass Bulb */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshPhysicalMaterial 
          color={isRunning && stateProp !== 'failure' ? '#fff' : '#eee'} 
          emissive={isRunning && stateProp !== 'failure' ? '#ffcc00' : 'black'}
          emissiveIntensity={isRunning && stateProp !== 'failure' ? 1.5 : 0}
          transparent
          opacity={0.4}
          transmission={0.9}
          thickness={0.5}
          roughness={0.05}
        />
      </mesh>
      {/* Filament structure */}
      <group position={[0, 0.55, 0]}>
        {/* Support wires */}
        <mesh position={[-0.05, -0.1, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh position={[0.05, -0.1, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        {/* Glowing filament */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.01, 16, 32]} />
          <meshStandardMaterial 
            color={isRunning && stateProp !== 'failure' ? '#ffaa00' : '#333'} 
            emissive={isRunning && stateProp !== 'failure' ? '#ffaa00' : 'black'}
            emissiveIntensity={isRunning && stateProp !== 'failure' ? 10 : 0}
          />
        </mesh>
      </group>
      
      {/* Pins */}
      <Pin id={`${id}-p1`} position={[-0.15, 0, 0]} name="Terminal 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0.15, 0, 0]} name="Terminal 2" onConnect={onPinConnect} />

      {isRunning && stateProp !== 'failure' && (
        <pointLight ref={lightRef} position={[0, 0.6, 0]} color="#ffcc00" distance={8} decay={2} castShadow />
      )}
    </group>
  );
};

export const Note3D: React.FC<{ id: string, text: string, position: [number, number, number] }> = ({ id, text, position }) => {
  const { showNotes } = useStore();
  if (!showNotes) return null;

  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div className="bg-yellow-200/90 text-black text-[10px] p-2 rounded shadow-xl border border-yellow-400/50 min-w-[80px] backdrop-blur-sm">
          <div className="font-bold border-b border-black/10 mb-1 pb-1">Note</div>
          {text}
        </div>
      </Html>
    </group>
  );
};

export const Resistor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* Ceramic Body */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.7, 32]} />
        <meshStandardMaterial color="#e8d8c0" roughness={0.4} />
      </mesh>
      {/* Metal Leads */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Color Bands */}
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 32]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 32]} />
        <meshStandardMaterial color="gold" metalness={0.8} />
      </mesh>
      
      {/* Pins */}
      <Pin id={`${id}-p1`} position={[-0.7, 0, 0]} name="Pin 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0.7, 0, 0]} name="Pin 2" onConnect={onPinConnect} />
    </group>
  );
};

export const CoinBattery: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.3, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* Metallic Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.15, 32]} />
        <meshStandardMaterial color="#ddd" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Engraved Text */}
      <Html position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} transform distanceFactor={2}>
        <div className="text-[8px] font-bold text-black/40 select-none pointer-events-none">CR2032 3V</div>
      </Html>
      {/* Pins */}
      <Pin id={`${id}-pos`} position={[0, 0.1, 0]} name="Positive (+)" onConnect={onPinConnect} />
      <Pin id={`${id}-neg`} position={[0, -0.1, 0]} name="Negative (-)" onConnect={onPinConnect} />
    </group>
  );
};

export const ArduinoUno: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[3.4, 0.6, 2.4]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* PCB */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.1, 2.2]} />
        <meshStandardMaterial color="#0055aa" roughness={0.6} />
      </mesh>
      {/* USB Port */}
      <mesh position={[-1.4, 0.2, 0.5]}>
        <boxGeometry args={[0.7, 0.4, 0.5]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* DC Jack */}
      <mesh position={[-1.4, 0.2, -0.6]}>
        <boxGeometry args={[0.8, 0.5, 0.6]} />
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {/* Main Chip (ATmega328P) */}
      <mesh position={[0.6, 0.1, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Headers */}
      <mesh position={[0, 0.15, 1.0]}>
        <boxGeometry args={[2.8, 0.25, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.15, -1.0]}>
        <boxGeometry args={[2.8, 0.25, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Pins */}
      <Pin id={`${id}-5v`} position={[-0.8, 0.2, 1.0]} name="5V" onConnect={onPinConnect} />
      <Pin id={`${id}-gnd`} position={[-0.6, 0.2, 1.0]} name="GND" onConnect={onPinConnect} />
      <Pin id={`${id}-d13`} position={[1.2, 0.2, -1.0]} name="D13" onConnect={onPinConnect} />
      <Pin id={`${id}-a0`} position={[0.2, 0.2, 1.0]} name="A0" onConnect={onPinConnect} />
    </group>
  );
};

export const Breadboard: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;
  const rows = 30;
  const cols = 10;
  
  const pins = useMemo(() => {
    const p = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (r - rows / 2) * 0.15;
        const z = (c - cols / 2) * 0.15 + (c >= 5 ? 0.2 : -0.2);
        p.push({ id: `${id}-r${r}-c${c}`, pos: [x, 0.06, z] as [number, number, number], name: `Row ${r + 1}, Col ${String.fromCharCode(65 + c)}` });
      }
    }
    for (let r = 0; r < rows; r += 5) {
      const x = (r - rows / 2) * 0.15;
      p.push({ id: `${id}-p-vcc1-${r}`, pos: [x, 0.06, 1.2], name: `Power Rail +` });
      p.push({ id: `${id}-p-gnd1-${r}`, pos: [x, 0.06, 1.35], name: `Power Rail -` });
      p.push({ id: `${id}-p-vcc2-${r}`, pos: [x, 0.06, -1.2], name: `Power Rail +` });
      p.push({ id: `${id}-p-gnd2-${r}`, pos: [x, 0.06, -1.35], name: `Power Rail -` });
    }
    return p;
  }, [id]);

  return (
    <group position={position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[5, 0.12, 3]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[4.8, 0.05, 0.2]} />
        <meshStandardMaterial color="#ddd" />
      </mesh>
      <mesh position={[0, 0.061, 1.275]}>
        <boxGeometry args={[4.5, 0.001, 0.02]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0, 0.061, 1.425]}>
        <boxGeometry args={[4.5, 0.001, 0.02]} />
        <meshBasicMaterial color="#0000ff" />
      </mesh>
      {pins.map(pin => (
        <Pin key={pin.id} id={pin.id} position={pin.pos} name={pin.name} onConnect={onPinConnect} />
      ))}
    </group>
  );
};

export const Battery9V: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.0, 1.4, 0.7]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <boxGeometry args={[0.8, 1.2, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.7, 0.1, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Pin id={`${id}-vcc`} position={[-0.2, 0.7, 0]} name="VCC (9V)" onConnect={onPinConnect} />
      <Pin id={`${id}-gnd`} position={[0.2, 0.7, 0]} name="GND" onConnect={onPinConnect} />
      <Html position={[0, 0, 0.26]} transform distanceFactor={2}>
        <div className="text-[10px] font-bold text-yellow-500 bg-black/80 px-1 rounded">9V BATTERY</div>
      </Html>
    </group>
  );
};

export const Potentiometer: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const [value, setValue] = useState(0.5);
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.5, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
        <meshStandardMaterial color="#555" metalness={0.5} roughness={0.5} />
      </mesh>
      <group position={[0, 0.2, 0]} rotation={[0, (value - 0.5) * Math.PI * 1.5, 0]}>
        <mesh 
          castShadow 
          onClick={(e) => {
            e.stopPropagation();
            setValue((v) => (v + 0.1) % 1.1);
          }}
        >
          <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
          <meshStandardMaterial color="#888" metalness={0.2} roughness={0.4} />
          <mesh position={[0.15, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </mesh>
      </group>
      <Pin id={`${id}-p1`} position={[-0.2, -0.1, 0.3]} name="Terminal 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0, -0.1, 0.3]} name="Wiper" onConnect={onPinConnect} />
      <Pin id={`${id}-p3`} position={[0.2, -0.1, 0.3]} name="Terminal 2" onConnect={onPinConnect} />
    </group>
  );
};

export const Capacitor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshStandardMaterial color="#222" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.1, 0.151]}>
        <planeGeometry args={[0.1, 0.2]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <Pin id={`${id}-pos`} position={[-0.05, -0.3, 0]} name="Positive (+)" onConnect={onPinConnect} />
      <Pin id={`${id}-neg`} position={[0.05, -0.3, 0]} name="Negative (-)" onConnect={onPinConnect} />
    </group>
  );
};

export const Diode: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.081, 0.081, 0.05, 16]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
      <Pin id={`${id}-anode`} position={[-0.3, 0, 0]} name="Anode" onConnect={onPinConnect} />
      <Pin id={`${id}-cathode`} position={[0.3, 0, 0]} name="Cathode" onConnect={onPinConnect} />
    </group>
  );
};

export const ZenerDiode: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.5, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
        <meshStandardMaterial color="#ff6600" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.071, 0.071, 0.04, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <Pin id={`${id}-anode`} position={[-0.25, 0, 0]} name="Anode" onConnect={onPinConnect} />
      <Pin id={`${id}-cathode`} position={[0.25, 0, 0]} name="Cathode" onConnect={onPinConnect} />
    </group>
  );
};

export const Pushbutton: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const [pressed, setPressed] = useState(false);
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.8]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* Base */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Button */}
      <mesh 
        position={[0, pressed ? 0.1 : 0.15, 0]} 
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
      >
        <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      {/* Pins */}
      <Pin id={`${id}-p1`} position={[-0.25, -0.1, -0.25]} name="Pin 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0.25, -0.1, -0.25]} name="Pin 2" onConnect={onPinConnect} />
      <Pin id={`${id}-p3`} position={[-0.25, -0.1, 0.25]} name="Pin 3" onConnect={onPinConnect} />
      <Pin id={`${id}-p4`} position={[0.25, -0.1, 0.25]} name="Pin 4" onConnect={onPinConnect} />
    </group>
  );
};

export const Slideswitch: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const [state, setState] = useState(0); // 0: left, 1: right
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.0, 0.5, 0.6]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.3, 0.4]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} />
      </mesh>
      <mesh 
        position={[state === 0 ? -0.2 : 0.2, 0.25, 0]}
        onClick={() => setState(state === 0 ? 1 : 0)}
      >
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Pin id={`${id}-p1`} position={[-0.25, -0.15, 0]} name="Terminal 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0, -0.15, 0]} name="Common" onConnect={onPinConnect} />
      <Pin id={`${id}-p3`} position={[0.25, -0.15, 0]} name="Terminal 2" onConnect={onPinConnect} />
    </group>
  );
};

export const Photoresistor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      {/* Wavy line pattern */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.01, 32]} />
        <meshStandardMaterial color="#ff0000" roughness={1} />
      </mesh>
      <Pin id={`${id}-p1`} position={[-0.1, -0.2, 0]} name="Pin 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0.1, -0.2, 0]} name="Pin 2" onConnect={onPinConnect} />
    </group>
  );
};

export const Transistor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[0.3, 0.4, 0.01]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Pin id={`${id}-emitter`} position={[-0.1, -0.3, 0]} name="Emitter" onConnect={onPinConnect} />
      <Pin id={`${id}-base`} position={[0, -0.3, 0]} name="Base" onConnect={onPinConnect} />
      <Pin id={`${id}-collector`} position={[0.1, -0.3, 0]} name="Collector" onConnect={onPinConnect} />
    </group>
  );
};

export const Piezo: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.7, 0.7, 0.5, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.4, 32]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.02, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.01, 32]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <Pin id={`${id}-pos`} position={[-0.3, -0.2, 0]} name="Positive (+)" onConnect={onPinConnect} />
      <Pin id={`${id}-neg`} position={[0.3, -0.2, 0]} name="Negative (-)" onConnect={onPinConnect} />
    </group>
  );
};

export const SevenSegment: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  const segments = [
    { pos: [0, 0.4, 0], size: [0.3, 0.05, 0.02], name: 'a' },
    { pos: [0.175, 0.225, 0], size: [0.05, 0.3, 0.02], name: 'b' },
    { pos: [0.175, -0.125, 0], size: [0.05, 0.3, 0.02], name: 'c' },
    { pos: [0, -0.3, 0], size: [0.3, 0.05, 0.02], name: 'd' },
    { pos: [-0.175, -0.125, 0], size: [0.05, 0.3, 0.02], name: 'e' },
    { pos: [-0.175, 0.225, 0], size: [0.05, 0.3, 0.02], name: 'f' },
    { pos: [0, 0.05, 0], size: [0.3, 0.05, 0.02], name: 'g' },
    { pos: [0.25, -0.3, 0], size: [0.05, 0.05, 0.02], name: 'dp' },
  ];

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.8, 1.1, 0.3]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <boxGeometry args={[0.7, 1.0, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {segments.map(seg => (
        <mesh key={seg.name} position={seg.pos as [number, number, number]}>
          <boxGeometry args={seg.size as [number, number, number]} />
          <meshStandardMaterial color="#300" emissive="#ff0000" emissiveIntensity={0.1} />
        </mesh>
      ))}
      {/* Pins: 5 top, 5 bottom */}
      <Pin id={`${id}-p1`} position={[-0.2, 0.55, 0]} name="G" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[-0.1, 0.55, 0]} name="F" onConnect={onPinConnect} />
      <Pin id={`${id}-p3`} position={[0, 0.55, 0]} name="Common" onConnect={onPinConnect} />
      <Pin id={`${id}-p4`} position={[0.1, 0.55, 0]} name="A" onConnect={onPinConnect} />
      <Pin id={`${id}-p5`} position={[0.2, 0.55, 0]} name="B" onConnect={onPinConnect} />
      
      <Pin id={`${id}-p6`} position={[-0.2, -0.55, 0]} name="E" onConnect={onPinConnect} />
      <Pin id={`${id}-p7`} position={[-0.1, -0.55, 0]} name="D" onConnect={onPinConnect} />
      <Pin id={`${id}-p8`} position={[0, -0.55, 0]} name="Common" onConnect={onPinConnect} />
      <Pin id={`${id}-p9`} position={[0.1, -0.55, 0]} name="C" onConnect={onPinConnect} />
      <Pin id={`${id}-p10`} position={[0.2, -0.55, 0]} name="DP" onConnect={onPinConnect} />
    </group>
  );
};

export const DCMotor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { isRunning, selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;
  const shaftRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (shaftRef.current && isRunning) {
      shaftRef.current.rotation.y += 0.5;
    }
  });

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1.0, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 32]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} />
      </mesh>
      <group ref={shaftRef} position={[0, 0, 0.5]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
          <meshStandardMaterial color="#888" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.02, 0.2, 0.02]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
      <Pin id={`${id}-p1`} position={[-0.2, -0.45, -0.2]} name="Terminal 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0.2, -0.45, -0.2]} name="Terminal 2" onConnect={onPinConnect} />
    </group>
  );
};

export const TempSensor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh>
          <boxGeometry args={[0.4, 0.5, 0.4]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.4, 0.15]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Pin id={`${id}-vcc`} position={[-0.1, -0.3, 0]} name="VCC" onConnect={onPinConnect} />
      <Pin id={`${id}-out`} position={[0, -0.3, 0]} name="OUT" onConnect={onPinConnect} />
      <Pin id={`${id}-gnd`} position={[0.1, -0.3, 0]} name="GND" onConnect={onPinConnect} />
    </group>
  );
};

export const AABattery: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} />
      </mesh>
      <Pin id={`${id}-pos`} position={[0, 0.45, 0]} name="Positive (+)" onConnect={onPinConnect} />
      <Pin id={`${id}-neg`} position={[0, -0.45, 0]} name="Negative (-)" onConnect={onPinConnect} />
    </group>
  );
};

export const UltrasonicSensor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[1.4, 0.8, 0.4]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* PCB */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#0055aa" />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.35, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} />
      </mesh>
      <mesh position={[0.35, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 32]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} />
      </mesh>
      {/* Pins */}
      <Pin id={`${id}-vcc`} position={[-0.15, -0.4, 0]} name="VCC" onConnect={onPinConnect} />
      <Pin id={`${id}-trig`} position={[-0.05, -0.4, 0]} name="Trig" onConnect={onPinConnect} />
      <Pin id={`${id}-echo`} position={[0.05, -0.4, 0]} name="Echo" onConnect={onPinConnect} />
      <Pin id={`${id}-gnd`} position={[0.15, -0.4, 0]} name="GND" onConnect={onPinConnect} />
    </group>
  );
};

export const PIRSensor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[1.0, 1.0, 0.5]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* PCB */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#0055aa" />
      </mesh>
      {/* Dome */}
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.8} />
      </mesh>
      {/* Pins */}
      <Pin id={`${id}-vcc`} position={[-0.1, -0.5, 0]} name="VCC" onConnect={onPinConnect} />
      <Pin id={`${id}-out`} position={[0, -0.5, 0]} name="OUT" onConnect={onPinConnect} />
      <Pin id={`${id}-gnd`} position={[0.1, -0.5, 0]} name="GND" onConnect={onPinConnect} />
    </group>
  );
};

export const MicroServo: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.6, 0.6, 1.0]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial color="#0055ff" />
      </mesh>
      {/* Horn Shaft */}
      <mesh position={[0, 0.3, 0.2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Horn */}
      <mesh position={[0, 0.3, 0.35]}>
        <boxGeometry args={[0.8, 0.1, 0.05]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Pins */}
      <Pin id={`${id}-vcc`} position={[-0.1, -0.5, 0]} name="VCC (Red)" onConnect={onPinConnect} />
      <Pin id={`${id}-gnd`} position={[0, -0.5, 0]} name="GND (Brown)" onConnect={onPinConnect} />
      <Pin id={`${id}-sig`} position={[0.1, -0.5, 0]} name="Signal (Orange)" onConnect={onPinConnect} />
    </group>
  );
};

export const LCD16x2: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[2.6, 1.2, 0.4]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      {/* PCB */}
      <mesh castShadow>
        <boxGeometry args={[3.2, 1.4, 0.1]} />
        <meshStandardMaterial color="#0055aa" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[2.8, 1.0, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[2.6, 0.8, 0.01]} />
        <meshStandardMaterial color="#00ff00" transparent opacity={0.3} emissive="#00ff00" emissiveIntensity={0.2} />
      </mesh>
      {/* Pins: 16 pins along the top */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Pin 
          key={i} 
          id={`${id}-p${i + 1}`} 
          position={[-1.5 + i * 0.2, 0.6, 0]} 
          name={`Pin ${i + 1}`} 
          onConnect={onPinConnect} 
        />
      ))}
    </group>
  );
};

export const RGBLED: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.6, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#fff" transparent opacity={0.7} transmission={0.5} thickness={0.5} />
      </mesh>
      {/* Pins */}
      <Pin id={`${id}-red`} position={[-0.15, -0.2, 0]} name="Red" onConnect={onPinConnect} />
      <Pin id={`${id}-common`} position={[-0.05, -0.2, 0]} name="Common" onConnect={onPinConnect} />
      <Pin id={`${id}-green`} position={[0.05, -0.2, 0]} name="Green" onConnect={onPinConnect} />
      <Pin id={`${id}-blue`} position={[0.15, -0.2, 0]} name="Blue" onConnect={onPinConnect} />
    </group>
  );
};

export const TiltSensor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
        <meshStandardMaterial color="#111" metalness={0.8} />
      </mesh>
      <Pin id={`${id}-p1`} position={[-0.05, -0.3, 0]} name="Pin 1" onConnect={onPinConnect} />
      <Pin id={`${id}-p2`} position={[0.05, -0.3, 0]} name="Pin 2" onConnect={onPinConnect} />
    </group>
  );
};

export const GasSensor: React.FC<{ id: string, position: [number, number, number], rotation?: [number, number, number], onPinConnect: (pinId: string, pos: THREE.Vector3) => void }> = ({ id, position, rotation = [0, 0, 0], onPinConnect }) => {
  const { selectedId, setSelectedId } = useStore();
  const isSelected = selectedId === id;

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); setSelectedId(id); }}>
      {isSelected && (
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Mesh top */}
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Pin id={`${id}-vcc`} position={[-0.15, -0.2, 0]} name="VCC" onConnect={onPinConnect} />
      <Pin id={`${id}-gnd`} position={[0, -0.2, 0]} name="GND" onConnect={onPinConnect} />
      <Pin id={`${id}-out`} position={[0.15, -0.2, 0]} name="OUT" onConnect={onPinConnect} />
    </group>
  );
};
