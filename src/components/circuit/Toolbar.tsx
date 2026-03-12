import React, { useState } from 'react';
import { 
  Trash2, 
  Undo2, 
  Redo2, 
  StickyNote, 
  Eye, 
  EyeOff, 
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ChevronDown,
  Play,
  Square
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Toolbar: React.FC = () => {
  const { 
    selectedId, 
    undo, 
    redo, 
    removeComponent, 
    addNote, 
    toggleNotes, 
    showNotes,
    wireSettings,
    setWireSettings,
    rotateComponent,
    flipComponent,
    isRunning,
    setRunning
  } = useStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ff4444' },
    { name: 'Orange', value: '#ff9900' },
    { name: 'Yellow', value: '#ffff44' },
    { name: 'Green', value: '#44ff44' },
    { name: 'Cyan', value: '#44ffff' },
    { name: 'Blue', value: '#4444ff' },
    { name: 'Purple', value: '#ff44ff' },
    { name: 'Pink', value: '#ff99cc' },
    { name: 'Brown', value: '#996633' },
    { name: 'Grey', value: '#999999' },
    { name: 'White', value: '#ffffff' }
  ];

  const wireTypes = [
    { name: 'Normal', value: 'curved' },
    { name: 'Hookup', value: 'straight' },
    { name: 'Alligator', value: 'curved' }, // Mocking types for UI
    { name: 'Automatic', value: 'curved' }
  ];

  return (
    <div className="absolute top-10 left-0 right-0 h-12 bg-[#f0f0f0] border-b border-gray-300 flex items-center px-4 gap-1 z-20 shadow-sm">
      {/* Simulation Control */}
      <div className="flex items-center gap-1 pr-4 mr-4 border-r border-gray-300">
        <button 
          onClick={() => setRunning(!isRunning)}
          className={`flex items-center gap-2 px-3 py-1 rounded border transition-all text-xs font-bold ${
            isRunning 
              ? 'bg-red-500 text-white border-red-600' 
              : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
          }`}
        >
          {isRunning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          {isRunning ? "STOP" : "START"}
        </button>
      </div>

      {/* Main Tools */}
      <div className="flex items-center gap-0.5">
        <button 
          onClick={() => selectedId && rotateComponent(selectedId)}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
          title="Rotate (R)"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => selectedId && removeComponent(selectedId)}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
          title="Delete (Del)"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button 
          onClick={() => undo()}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => redo()}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button 
          onClick={() => addNote("New Note", [0, 1, 0])}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors"
          title="Notes tool (N)"
        >
          <StickyNote className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => toggleNotes()}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors"
          title="Toggle notes visibility"
        >
          {showNotes ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Wire Color Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 p-1 hover:bg-gray-200 rounded transition-colors"
            title="Wire Color"
          >
            <div 
              className="w-6 h-6 rounded border border-gray-400" 
              style={{ backgroundColor: wireSettings.color }}
            />
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-xl p-2 grid grid-cols-3 gap-1 z-30">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => {
                    setWireSettings({ color: c.value });
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Wire Type Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowTypePicker(!showTypePicker)}
            className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
            title="Wire Type"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <div className={`h-0.5 w-full bg-gray-600 ${wireSettings.type === 'curved' ? 'rounded-full' : ''}`} />
            </div>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          
          {showTypePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-xl py-1 z-30 min-w-[100px]">
              {wireTypes.map(t => (
                <button
                  key={t.name}
                  onClick={() => {
                    setWireSettings({ type: t.value as any });
                    setShowTypePicker(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 transition-colors text-gray-700"
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button 
          onClick={() => selectedId && flipComponent(selectedId, 'x')}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
          title="Flip Horizontal"
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => selectedId && flipComponent(selectedId, 'z')}
          disabled={!selectedId}
          className="p-2 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 transition-colors"
          title="Flip Vertical"
        >
          <FlipVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
