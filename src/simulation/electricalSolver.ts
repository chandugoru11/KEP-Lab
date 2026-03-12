import { ComponentData, Wire } from '../store/useStore';

export interface SimulationResult {
  voltages: Record<string, number>; // pinId -> voltage
  currents: Record<string, number>; // wireId -> current
  failures: { componentId?: string; wireId?: string; reason: string }[];
}

export class ElectricalSolver {
  static solve(components: ComponentData[], wires: Wire[]): SimulationResult {
    const result: SimulationResult = {
      voltages: {},
      currents: {},
      failures: [],
    };

    // 1. Map connections (including internal breadboard connections)
    const pinToNet = new Map<string, string>();
    let netCount = 0;

    const allConnections = [...wires.map(w => ({ from: w.fromPinId, to: w.toPinId }))];

    // Add internal breadboard connections
    components.forEach(comp => {
      if (comp.name === 'Breadboard') {
        // Rows (A-E and F-J)
        for (let r = 0; r < 30; r++) {
          // A-E
          for (let c = 0; c < 4; c++) {
            allConnections.push({ from: `${comp.id}-r${r}-c${c}`, to: `${comp.id}-r${r}-c${c+1}` });
          }
          // F-J
          for (let c = 5; c < 9; c++) {
            allConnections.push({ from: `${comp.id}-r${r}-c${c}`, to: `${comp.id}-r${r}-c${c+1}` });
          }
        }
        // Power rails (horizontal)
        const rails = ['p-vcc1', 'p-gnd1', 'p-vcc2', 'p-gnd2'];
        rails.forEach(rail => {
          for (let r = 0; r < 25; r += 5) {
            allConnections.push({ from: `${comp.id}-${rail}-${r}`, to: `${comp.id}-${rail}-${r+5}` });
          }
        });
      }
    });

    allConnections.forEach(conn => {
      const netA = pinToNet.get(conn.from);
      const netB = pinToNet.get(conn.to);

      if (!netA && !netB) {
        const netId = `net_${netCount++}`;
        pinToNet.set(conn.from, netId);
        pinToNet.set(conn.to, netId);
      } else if (netA && !netB) {
        pinToNet.set(conn.to, netA);
      } else if (!netA && netB) {
        pinToNet.set(conn.from, netB);
      } else if (netA && netB && netA !== netB) {
        // Merge nets
        pinToNet.forEach((net, pin) => {
          if (net === netB) pinToNet.set(pin, netA);
        });
      }
    });

    // 2. Simple Voltage Propagation (Simplified for demo)
    // In a real SPICE engine, we'd build a matrix
    const powerSources = components.filter(c => c.type === 'power');
    
    powerSources.forEach(source => {
      const vccPin = source.pins.find(p => 
        p.name === 'VCC' || p.name === '5V' || p.name === '9V' || 
        p.name === 'Positive (+)' || p.name === 'VCC (9V)'
      );
      const gndPin = source.pins.find(p => 
        p.name === 'GND' || p.name === 'Negative (-)'
      );
      
      if (vccPin && gndPin) {
        const voltage = source.properties.voltage || 5;
        const vccNet = pinToNet.get(vccPin.id);
        const gndNet = pinToNet.get(gndPin.id);

        if (vccNet === gndNet && vccNet !== undefined) {
          result.failures.push({ componentId: source.id, reason: 'SHORT CIRCUIT DETECTED' });
        }

        // Propagate
        if (vccNet) {
          pinToNet.forEach((net, pinId) => {
            if (net === vccNet) result.voltages[pinId] = voltage;
          });
        }
        if (gndNet) {
          pinToNet.forEach((net, pinId) => {
            if (net === gndNet) result.voltages[pinId] = 0;
          });
        }
      }
    });

    // 3. Component Logic
    components.forEach(comp => {
      if (comp.name === 'LED') {
        const anode = comp.pins.find(p => p.name === 'Anode' || p.name === 'Anode (+)');
        const cathode = comp.pins.find(p => p.name === 'Cathode' || p.name === 'Cathode (-)');
        
        if (anode && cathode) {
          const vA = result.voltages[anode.id] || 0;
          const vK = result.voltages[cathode.id] || 0;
          const diff = vA - vK;

          if (diff > 0.1) {
            if (diff > 3.0) { // Overvoltage for standard LED
              result.failures.push({ componentId: comp.id, reason: 'OVERVOLTAGE: LED BURNT' });
            } else {
              // LED is ON
            }
          } else if (diff < -0.1) {
             result.failures.push({ componentId: comp.id, reason: 'REVERSE POLARITY' });
          }
        }
      }
    });

    return result;
  }
}
