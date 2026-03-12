import React from 'react';
import { useStore } from './store/useStore';
import { MainLayout } from './components/layout/MainLayout';
import { CircuitBuilder } from './components/circuit/CircuitBuilder';
import { CodeEditor } from './components/editor/CodeEditor';
import { IoTDashboard } from './components/dashboard/IoTDashboard';

export default function App() {
  const { activeTab } = useStore();

  return (
    <MainLayout>
      {activeTab === 'circuit' && <CircuitBuilder />}
      {activeTab === 'code' && <CodeEditor />}
      {activeTab === 'dashboard' && <IoTDashboard />}
    </MainLayout>
  );
}
