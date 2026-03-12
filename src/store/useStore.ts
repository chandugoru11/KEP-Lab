import { create } from 'zustand';

export type ComponentType = 'power' | 'passive' | 'diode' | 'led' | 'sensor' | 'module' | 'actuator' | 'board' | 'prototyping';

export interface Pin {
  id: string;
  name: string;
  position: [number, number, number]; // Relative to component
  voltage: number;
  current: number;
}

export interface ComponentData {
  id: string;
  type: ComponentType;
  name: string;
  modelPath?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  pins: Pin[];
  properties: Record<string, any>;
  state: 'normal' | 'success' | 'failure';
  failureReason?: string;
}

export interface Wire {
  id: string;
  fromPinId: string;
  toPinId: string;
  color: string;
  points: [number, number, number][];
}

export interface Note {
  id: string;
  text: string;
  position: [number, number, number];
}

interface SimulationState {
  components: ComponentData[];
  wires: Wire[];
  notes: Note[];
  isRunning: boolean;
  activeTab: 'circuit' | 'code' | 'dashboard';
  code: string;
  selectedId: string | null;
  clipboard: ComponentData | null;
  history: { components: ComponentData[], wires: Wire[] }[];
  historyIndex: number;
  showNotes: boolean;
  wireSettings: { color: string, type: 'curved' | 'straight' };
  
  // Actions
  addComponent: (component: ComponentData) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentData>) => void;
  addWire: (wire: Wire) => void;
  removeWire: (id: string) => void;
  setRunning: (running: boolean) => void;
  setActiveTab: (tab: 'circuit' | 'code' | 'dashboard') => void;
  setCode: (code: string) => void;
  setSelectedId: (id: string | null) => void;
  copy: () => void;
  paste: () => void;
  undo: () => void;
  redo: () => void;
  addNote: (text: string, position: [number, number, number]) => void;
  toggleNotes: () => void;
  setWireSettings: (settings: Partial<{ color: string, type: 'curved' | 'straight' }>) => void;
  rotateComponent: (id: string) => void;
  flipComponent: (id: string, axis: 'x' | 'z') => void;
}

export const useStore = create<SimulationState>((set, get) => ({
  components: [],
  wires: [],
  notes: [],
  isRunning: false,
  activeTab: 'circuit',
  code: '// Write your Arduino/ESP32 code here\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}',
  selectedId: null,
  clipboard: null,
  history: [],
  historyIndex: -1,
  showNotes: true,
  wireSettings: { color: '#ff4444', type: 'curved' },
  
  saveToHistory: () => {
    const { components, wires, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ components: JSON.parse(JSON.stringify(components)), wires: JSON.parse(JSON.stringify(wires)) });
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addComponent: (component) => {
    set((state) => ({ components: [...state.components, component] }));
    (get() as any).saveToHistory();
  },
  removeComponent: (id) => {
    set((state) => ({ 
      components: state.components.filter(c => c.id !== id),
      wires: state.wires.filter(w => !w.fromPinId.startsWith(id) && !w.toPinId.startsWith(id)),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
    (get() as any).saveToHistory();
  },
  updateComponent: (id, updates) => set((state) => ({
    components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  addWire: (wire) => {
    set((state) => ({ wires: [...state.wires, wire] }));
    (get() as any).saveToHistory();
  },
  removeWire: (id) => {
    set((state) => ({ wires: state.wires.filter(w => w.id !== id) }));
    (get() as any).saveToHistory();
  },
  setRunning: (running) => set({ isRunning: running }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCode: (code) => set({ code }),
  setSelectedId: (id) => set({ selectedId: id }),
  
  copy: () => {
    const { selectedId, components } = get();
    if (!selectedId) return;
    const comp = components.find(c => c.id === selectedId);
    if (comp) set({ clipboard: JSON.parse(JSON.stringify(comp)) });
  },
  
  paste: () => {
    const { clipboard } = get();
    if (!clipboard) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newComp = { 
      ...clipboard, 
      id: newId, 
      position: [clipboard.position[0] + 0.5, clipboard.position[1], clipboard.position[2] + 0.5] as [number, number, number]
    };
    get().addComponent(newComp);
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      set({ 
        components: JSON.parse(JSON.stringify(prev.components)), 
        wires: JSON.parse(JSON.stringify(prev.wires)), 
        historyIndex: historyIndex - 1 
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      set({ 
        components: JSON.parse(JSON.stringify(next.components)), 
        wires: JSON.parse(JSON.stringify(next.wires)), 
        historyIndex: historyIndex + 1 
      });
    }
  },
  
  addNote: (text, position) => set((state) => ({ 
    notes: [...state.notes, { id: Math.random().toString(36).substr(2, 9), text, position }] 
  })),
  
  toggleNotes: () => set((state) => ({ showNotes: !state.showNotes })),
  
  setWireSettings: (settings) => set((state) => ({ 
    wireSettings: { ...state.wireSettings, ...settings } 
  })),
  
  rotateComponent: (id) => {
    const { components } = get();
    const comp = components.find(c => c.id === id);
    if (comp) {
      const newRotation = [comp.rotation[0], comp.rotation[1] + Math.PI / 2, comp.rotation[2]] as [number, number, number];
      get().updateComponent(id, { rotation: newRotation });
      (get() as any).saveToHistory();
    }
  },

  flipComponent: (id, axis) => {
    const { components } = get();
    const comp = components.find(c => c.id === id);
    if (comp) {
      const newRotation = [...comp.rotation] as [number, number, number];
      if (axis === 'x') newRotation[0] += Math.PI;
      else newRotation[2] += Math.PI;
      get().updateComponent(id, { rotation: newRotation });
      (get() as any).saveToHistory();
    }
  }
}));
