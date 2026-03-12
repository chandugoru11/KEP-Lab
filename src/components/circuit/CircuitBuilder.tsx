import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, PerspectiveCamera, Text, Float, Line } from '@react-three/drei';
import { useStore, ComponentData, Wire as WireType } from '../../store/useStore';
import { Cpu, Battery, Activity, Layers, MousePointer2, Plus, AlertTriangle, Zap as ZapIcon, Scissors } from 'lucide-react';
import { 
  LED, 
  Resistor, 
  ArduinoUno, 
  Battery9V, 
  Potentiometer, 
  Breadboard, 
  AABattery, 
  CoinBattery,
  Capacitor,
  Diode,
  DCMotor,
  TempSensor,
  LightBulb,
  Note3D,
  ZenerDiode,
  Pushbutton,
  Slideswitch,
  Photoresistor,
  Transistor,
  Piezo,
  SevenSegment,
  UltrasonicSensor,
  PIRSensor,
  MicroServo,
  LCD16x2,
  RGBLED,
  TiltSensor,
  GasSensor
} from '../electronics/Components3D';
import { Header } from './Header';
import { Toolbar } from './Toolbar';
import { ElectricalSolver } from '../../simulation/electricalSolver';
import * as THREE from 'three';

const Wire = ({ wire }: { wire: WireType }) => {
  const { components } = useStore();
  const [points, setPoints] = useState<THREE.Vector3[]>([]);

  useFrame(() => {
    // Extract component ID from pin ID (format: compId-pinName)
    const fromCompId = wire.fromPinId.substring(0, wire.fromPinId.lastIndexOf('-'));
    const toCompId = wire.toPinId.substring(0, wire.toPinId.lastIndexOf('-'));
    
    const fromComp = components.find(c => c.id === fromCompId);
    const toComp = components.find(c => c.id === toCompId);

    if (fromComp && toComp) {
      // Find pin relative positions (simplified for now, ideally these come from a config)
      // In a real app, we'd have a registry of pin offsets per component type
      const getPinOffset = (compId: string, pinId: string): [number, number, number] => {
        const comp = components.find(c => c.id === compId);
        if (!comp) return [0, 0, 0];
        
        let offset: [number, number, number] = [0, 0, 0];
        
        // Match pin offsets from Components3D.tsx
        if (comp.name === 'LED') offset = pinId.includes('anode') ? [-0.1, 0, 0] : [0.1, 0, 0];
        else if (comp.name === 'Resistor') offset = pinId.includes('p1') ? [-0.7, 0, 0] : [0.7, 0, 0];
        else if (comp.name === '9V Battery') offset = pinId.includes('vcc') ? [-0.2, 0.7, 0] : [0.2, 0.7, 0];
        else if (comp.name === 'AA Battery') offset = pinId.includes('pos') ? [0, 0.45, 0] : [0, -0.45, 0];
        else if (comp.name === 'Coin Battery') offset = pinId.includes('pos') ? [0, 0.1, 0] : [0, -0.1, 0];
        else if (comp.name === 'Light Bulb') offset = pinId.includes('p1') ? [-0.15, 0, 0] : [0.15, 0, 0];
        else if (comp.name === 'Capacitor') offset = pinId.includes('pos') ? [-0.05, -0.3, 0] : [0.05, -0.3, 0];
        else if (comp.name === 'Diode') offset = pinId.includes('anode') ? [-0.3, 0, 0] : [0.3, 0, 0];
        else if (comp.name === 'DC Motor') offset = pinId.includes('p1') ? [-0.2, -0.45, -0.2] : [0.2, -0.45, -0.2];
        else if (comp.name === 'Temp Sensor') {
          if (pinId.includes('vcc')) offset = [-0.1, -0.3, 0];
          else if (pinId.includes('out')) offset = [0, -0.3, 0];
          else if (pinId.includes('gnd')) offset = [0.1, -0.3, 0];
        }
        else if (comp.name === 'Potentiometer') {
          if (pinId.includes('p1')) offset = [-0.2, -0.1, 0.3];
          else if (pinId.includes('p2')) offset = [0, -0.1, 0.3];
          else if (pinId.includes('p3')) offset = [0.2, -0.1, 0.3];
        }
        else if (comp.name === 'Zener Diode') offset = pinId.includes('anode') ? [-0.25, 0, 0] : [0.25, 0, 0];
        else if (comp.name === 'Pushbutton') {
          if (pinId.includes('p1')) offset = [-0.25, -0.1, -0.25];
          else if (pinId.includes('p2')) offset = [0.25, -0.1, -0.25];
          else if (pinId.includes('p3')) offset = [-0.25, -0.1, 0.25];
          else if (pinId.includes('p4')) offset = [0.25, -0.1, 0.25];
        }
        else if (comp.name === 'Slideswitch') {
          if (pinId.includes('p1')) offset = [-0.25, -0.15, 0];
          else if (pinId.includes('p2')) offset = [0, -0.15, 0];
          else if (pinId.includes('p3')) offset = [0.25, -0.15, 0];
        }
        else if (comp.name === 'Photoresistor') offset = pinId.includes('p1') ? [-0.1, -0.2, 0] : [0.1, -0.2, 0];
        else if (comp.name === 'Transistor') {
          if (pinId.includes('emitter')) offset = [-0.1, -0.3, 0];
          else if (pinId.includes('base')) offset = [0, -0.3, 0];
          else if (pinId.includes('collector')) offset = [0.1, -0.3, 0];
        }
        else if (comp.name === 'Piezo') offset = pinId.includes('pos') ? [-0.3, -0.2, 0] : [0.3, -0.2, 0];
        else if (comp.name === '7-Segment') {
          const match = pinId.match(/-p(\d+)/);
          if (match) {
            const pinNum = parseInt(match[1]);
            if (pinNum <= 5) offset = [-0.2 + (pinNum - 1) * 0.1, 0.55, 0];
            else offset = [-0.2 + (pinNum - 6) * 0.1, -0.55, 0];
          }
        }
        else if (comp.name === 'Ultrasonic Sensor') {
          if (pinId.includes('vcc')) offset = [-0.15, -0.4, 0];
          else if (pinId.includes('trig')) offset = [-0.05, -0.4, 0];
          else if (pinId.includes('echo')) offset = [0.05, -0.4, 0];
          else if (pinId.includes('gnd')) offset = [0.15, -0.4, 0];
        }
        else if (comp.name === 'PIR Sensor') {
          if (pinId.includes('vcc')) offset = [-0.1, -0.5, 0];
          else if (pinId.includes('out')) offset = [0, -0.5, 0];
          else if (pinId.includes('gnd')) offset = [0.1, -0.5, 0];
        }
        else if (comp.name === 'Micro Servo') {
          if (pinId.includes('vcc')) offset = [-0.1, -0.5, 0];
          else if (pinId.includes('gnd')) offset = [0, -0.5, 0];
          else if (pinId.includes('sig')) offset = [0.1, -0.5, 0];
        }
        else if (comp.name === 'LCD 16x2') {
          const match = pinId.match(/-p(\d+)/);
          if (match) {
            const pinNum = parseInt(match[1]);
            offset = [-1.5 + (pinNum - 1) * 0.2, 0.6, 0];
          }
        }
        else if (comp.name === 'RGB LED') {
          if (pinId.includes('red')) offset = [-0.15, -0.2, 0];
          else if (pinId.includes('common')) offset = [-0.05, -0.2, 0];
          else if (pinId.includes('green')) offset = [0.05, -0.2, 0];
          else if (pinId.includes('blue')) offset = [0.15, -0.2, 0];
        }
        else if (comp.name === 'Tilt Sensor') offset = pinId.includes('p1') ? [-0.05, -0.3, 0] : [0.05, -0.3, 0];
        else if (comp.name === 'Gas Sensor') {
          if (pinId.includes('vcc')) offset = [-0.15, -0.2, 0];
          else if (pinId.includes('gnd')) offset = [0, -0.2, 0];
          else if (pinId.includes('out')) offset = [0.15, -0.2, 0];
        }
        else if (comp.name === 'Arduino Uno') {
          if (pinId.includes('5v')) offset = [-0.8, 0.2, 1.0];
          else if (pinId.includes('gnd')) offset = [-0.6, 0.2, 1.0];
          else if (pinId.includes('d13')) offset = [1.2, 0.2, -1.0];
          else if (pinId.includes('a0')) offset = [0.2, 0.2, 1.0];
        }
        else if (comp.name === 'Breadboard') {
          if (pinId.includes('-r')) {
            const match = pinId.match(/-r(\d+)-c(\d+)/);
            if (match) {
              const r = parseInt(match[1]);
              const c = parseInt(match[2]);
              const x = (r - 30 / 2) * 0.15;
              const z = (c - 10 / 2) * 0.15 + (c >= 5 ? 0.2 : -0.2);
              offset = [x, 0.06, z];
            }
          } else if (pinId.includes('-p-')) {
            const match = pinId.match(/-p-(vcc|gnd)(\d)-(\d+)/);
            if (match) {
              const type = match[1];
              const side = match[2];
              const r = parseInt(match[3]);
              const x = (r - 30 / 2) * 0.15;
              const z = side === '1' ? (type === 'vcc' ? 1.2 : 1.35) : (type === 'vcc' ? -1.2 : -1.35);
              offset = [x, 0.06, z];
            }
          }
        }

        if (comp.rotation) {
          const vec = new THREE.Vector3(...offset);
          const euler = new THREE.Euler(...comp.rotation);
          vec.applyEuler(euler);
          return [vec.x, vec.y, vec.z];
        }
        
        return offset;
      };

      const start = new THREE.Vector3(...fromComp.position).add(new THREE.Vector3(...getPinOffset(fromComp.id, wire.fromPinId)));
      const end = new THREE.Vector3(...toComp.position).add(new THREE.Vector3(...getPinOffset(toComp.id, wire.toPinId)));
      
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.y += 0.5;
      
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      setPoints(curve.getPoints(20));
    }
  });

  if (points.length === 0) return null;

  return (
    <Line
      points={points}
      color={wire.color}
      lineWidth={3}
      transparent
      opacity={0.8}
    />
  );
};

const FailureEffect = ({ position, reason }: { position: [number, number, number], reason: string }) => {
  return (
    <group position={[position[0], position[1] + 1, position[2]]}>
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <Text
          fontSize={0.2}
          color="red"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="white"
        >
          {reason}
        </Text>
      </Float>
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="orange" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const ComponentSidebar = () => {
  const { addComponent } = useStore();
  
  const categories = [
    { name: 'Power', icon: Battery, items: [
      { name: '9V Battery', type: 'power', props: { voltage: 9 } },
      { name: 'AA Battery', type: 'power', props: { voltage: 1.5 } },
      { name: 'Coin Battery', type: 'power', props: { voltage: 3 } }
    ]},
    { name: 'Passive', icon: Activity, items: [
      { name: 'LED', type: 'led', props: { color: 'red' } },
      { name: 'RGB LED', type: 'led', props: {} },
      { name: 'Light Bulb', type: 'led', props: {} },
      { name: 'Resistor', type: 'passive', props: { resistance: 220 } },
      { name: 'Capacitor', type: 'passive', props: { capacitance: 0.0001 } },
      { name: 'Potentiometer', type: 'passive', props: { resistance: 10000 } },
      { name: 'Photoresistor', type: 'sensor', props: {} }
    ]},
    { name: 'Diodes', icon: Cpu, items: [
      { name: 'Diode', type: 'diode', props: {} },
      { name: 'Zener Diode', type: 'diode', props: {} }
    ]},
    { name: 'Input', icon: MousePointer2, items: [
      { name: 'Pushbutton', type: 'input', props: {} },
      { name: 'Slideswitch', type: 'input', props: {} },
      { name: 'Tilt Sensor', type: 'sensor', props: {} }
    ]},
    { name: 'Sensors', icon: Activity, items: [
      { name: 'Temp Sensor', type: 'sensor', props: {} },
      { name: 'Ultrasonic Sensor', type: 'sensor', props: {} },
      { name: 'PIR Sensor', type: 'sensor', props: {} },
      { name: 'Gas Sensor', type: 'sensor', props: {} }
    ]},
    { name: 'Actuators', icon: Cpu, items: [
      { name: 'DC Motor', type: 'actuator', props: {} },
      { name: 'Micro Servo', type: 'actuator', props: {} },
      { name: 'Piezo', type: 'actuator', props: {} }
    ]},
    { name: 'Display', icon: Layers, items: [
      { name: '7-Segment', type: 'display', props: {} },
      { name: 'LCD 16x2', type: 'display', props: {} }
    ]},
    { name: 'Boards', icon: Cpu, items: [
      { name: 'Arduino Uno', type: 'board', props: {} },
      { name: 'Breadboard', type: 'prototyping', props: {} },
      { name: 'Transistor', type: 'semiconductor', props: {} }
    ]},
  ];

  const handleAdd = (item: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    addComponent({
      id,
      name: item.name,
      type: item.type,
      position: [(Math.random() - 0.5) * 4, 0.1, (Math.random() - 0.5) * 2],
      rotation: [0, 0, 0],
      pins: [], 
      properties: item.props,
      state: 'normal'
    });
  };

  return (
    <div className="absolute left-0 top-[88px] bottom-0 w-72 bg-[#ffffff] border-r border-gray-300 flex flex-col z-10 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#f8f8f8]">
        <h2 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Components</h2>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
            <Layers className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {categories.map((cat) => (
          <div key={cat.name} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <cat.icon className="w-3 h-3" />
              {cat.name}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {cat.items.map((item) => {
                const seed = item.name.replace(/\s+/g, '-').toLowerCase();
                const iconPath = `https://loremflickr.com/100/100/electronics,${seed}/all`;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleAdd(item)}
                    className="group flex flex-col items-center gap-1.5 p-1 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 transition-all text-center"
                  >
                    <div className="relative w-full aspect-square bg-gray-50 rounded-md flex items-center justify-center p-1 overflow-hidden border border-gray-100 group-hover:border-emerald-100 transition-colors">
                      <img 
                        src={iconPath} 
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all"
                      />
                    </div>
                    
                    <span className="text-[8px] font-medium text-gray-500 group-hover:text-emerald-700 leading-tight line-clamp-2">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CircuitBuilder: React.FC = () => {
  const { components, wires, notes, isRunning, updateComponent, addWire, removeWire, wireSettings } = useStore();
  const [failures, setFailures] = useState<any[]>([]);
  const [pendingWire, setPendingWire] = useState<{ id: string, pos: THREE.Vector3 } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePinConnect = (pinId: string, pos: THREE.Vector3) => {
    if (isDragging) return; // Prevent connecting while dragging
    if (!pendingWire) {
      setPendingWire({ id: pinId, pos });
    } else {
      if (pendingWire.id !== pinId) {
        addWire({
          id: Math.random().toString(36).substr(2, 9),
          fromPinId: pendingWire.id,
          toPinId: pinId,
          color: wireSettings.color,
          points: [] // Points are now dynamic
        });
      }
      setPendingWire(null);
    }
  };

  const PendingWire = ({ startPos }: { startPos: THREE.Vector3 }) => {
    const { camera, mouse, raycaster } = useThree();
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    useFrame(() => {
      raycaster.setFromCamera(mouse, camera);
      const endPos = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, endPos);
      
      const mid = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
      mid.y += 0.5;
      
      const curve = new THREE.CatmullRomCurve3([startPos, mid, endPos]);
      setPoints(curve.getPoints(20));
    });

    return (
      <Line
        points={points}
        color={wireSettings.color}
        lineWidth={2}
        dashed
        dashScale={5}
        dashSize={0.2}
        gapSize={0.1}
      />
    );
  };

  const Draggable = ({ children, id, position }: { children: React.ReactNode, id: string, position: [number, number, number] }) => {
    const { camera, mouse, raycaster } = useThree();
    const [dragging, setDragging] = useState(false);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    return (
      <group
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging(true);
          setIsDragging(true);
          (e.target as any).setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          setDragging(false);
          setIsDragging(false);
          (e.target as any).releasePointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          e.stopPropagation();
          
          raycaster.setFromCamera(mouse, camera);
          const intersectPoint = new THREE.Vector3();
          raycaster.ray.intersectPlane(plane, intersectPoint);
          
          updateComponent(id, { position: [intersectPoint.x, 0.1, intersectPoint.z] });
        }}
      >
        {children}
      </group>
    );
  };

  useEffect(() => {
    if (isRunning) {
      const result = ElectricalSolver.solve(components, wires);
      setFailures(result.failures);
      
      result.failures.forEach(f => {
        if (f.componentId) {
          updateComponent(f.componentId, { state: 'failure', failureReason: f.reason });
        }
      });
    } else {
      setFailures([]);
      components.forEach(c => {
        if (c.state === 'failure') updateComponent(c.id, { state: 'normal', failureReason: undefined });
      });
    }
  }, [isRunning, components.length, wires.length]);

  return (
    <div className="w-full h-full relative bg-[#e0e0e0]">
      <Header />
      <Toolbar />
      <ComponentSidebar />
      
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={35} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} enabled={!isDragging} />
        
        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          fadeStrength={5} 
          cellSize={0.5} 
          sectionSize={2.5} 
          sectionThickness={1.5} 
          sectionColor="#999999" 
          cellColor="#cccccc"
        />

        <ambientLight intensity={0.4} />
        <spotLight position={[15, 20, 10]} angle={0.2} penumbra={1} intensity={3} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={1.5} color="#4488ff" />

        <Suspense fallback={null}>
          <group>
            {components.map((comp) => (
              <Draggable key={comp.id} id={comp.id} position={comp.position}>
                {comp.name === 'LED' && (
                  <LED 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    color={comp.properties.color} 
                    state={comp.state} 
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Light Bulb' && (
                  <LightBulb 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    state={comp.state} 
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Resistor' && (
                  <Resistor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Arduino Uno' && (
                  <ArduinoUno 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === '9V Battery' && (
                  <Battery9V 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'AA Battery' && (
                  <AABattery 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Coin Battery' && (
                  <CoinBattery 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Potentiometer' && (
                  <Potentiometer 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Breadboard' && (
                  <Breadboard 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Capacitor' && (
                  <Capacitor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Diode' && (
                  <Diode 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'DC Motor' && (
                  <DCMotor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Temp Sensor' && (
                  <TempSensor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Zener Diode' && (
                  <ZenerDiode 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Pushbutton' && (
                  <Pushbutton 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Slideswitch' && (
                  <Slideswitch 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Photoresistor' && (
                  <Photoresistor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Transistor' && (
                  <Transistor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Piezo' && (
                  <Piezo 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === '7-Segment' && (
                  <SevenSegment 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Ultrasonic Sensor' && (
                  <UltrasonicSensor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'PIR Sensor' && (
                  <PIRSensor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Micro Servo' && (
                  <MicroServo 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'LCD 16x2' && (
                  <LCD16x2 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'RGB LED' && (
                  <RGBLED 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Tilt Sensor' && (
                  <TiltSensor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                {comp.name === 'Gas Sensor' && (
                  <GasSensor 
                    id={comp.id} 
                    position={comp.position} 
                    rotation={comp.rotation}
                    onPinConnect={handlePinConnect}
                  />
                )}
                
                {comp.state === 'failure' && (
                  <FailureEffect position={comp.position} reason={comp.failureReason || 'ERROR'} />
                )}
              </Draggable>
            ))}
            {wires.map(wire => (
              <Wire key={wire.id} wire={wire} />
            ))}
            {pendingWire && <PendingWire startPos={pendingWire.pos} />}
            {notes.map(note => (
              <Note3D key={note.id} id={note.id} text={note.text} position={note.position} />
            ))}
          </group>
          <Environment preset="studio" />
          <ContactShadows position={[0, -0.05, 0]} opacity={0.6} scale={25} blur={2.5} far={5} />
        </Suspense>
      </Canvas>

      {pendingWire && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-500 text-black text-[10px] font-bold rounded-full animate-pulse">
          SELECT SECOND PIN TO CONNECT
        </div>
      )}

      {failures.length > 0 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-red-50 backdrop-blur-xl rounded-2xl border border-red-200 text-red-600 text-xs font-bold animate-bounce shadow-xl">
          <AlertTriangle className="w-4 h-4" />
          CRITICAL FAILURE DETECTED: {failures[0].reason}
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <div className="px-8 py-3 bg-white/80 backdrop-blur-xl rounded-full border border-gray-300 text-gray-500 text-[10px] font-mono tracking-[0.3em] uppercase shadow-lg">
          {isRunning ? "Engine Running" : "Design Mode"}
        </div>
      </div>
    </div>
  );
};
