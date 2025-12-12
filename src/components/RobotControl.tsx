// src/components/RobotControl.tsx
import { useState, useEffect } from 'react';
import { robotService } from '../services/robotService'; // <--- Importação nova
import { Wifi, Cpu, Activity } from 'lucide-react';
import type { SignalRMessage, TelemetryData } from '../types';
import { useChat } from '../context/chatContext';

interface LogEntry {
  time: Date;
  text: string;
  type: 'info' | 'error' | 'success';
}

interface RobotControlProps {
  thingCode?: string;
}

export default function RobotControl({ thingCode = "ExpoBot_Felipe" }: RobotControlProps) {
  const { isChatOpen } = useChat();
  
  const [connectionStatus, setConnectionStatus] = useState({
    aws: false,
    robot: false
  });
  const [speed, setSpeed] = useState<number>(200);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  // Conexão SignalR via RobotService
  useEffect(() => {
    const connection = robotService.createSignalRConnection(thingCode);

    connection.start()
      .then(() => addLog("✅ Conectado ao Hub SignalR", "success"))
      .catch(err => addLog(`❌ Erro SignalR: ${err}`, "error"));

    connection.on("ReceiveMessage", (msg: SignalRMessage) => {
      if(msg.thingCode && msg.thingCode !== thingCode) return;

      if (msg.type === "connection" && msg.status) {
        setConnectionStatus({
          aws: msg.status.awsIot,
          robot: msg.status.esp8266Connected
        });
      }
      else if (msg.type === "heartbeat" && msg.data) {
        setTelemetry(msg.data as TelemetryData);
        setConnectionStatus(prev => ({ ...prev, robot: true }));
      }
      else if (msg.type === "speed_update" && msg.data) {
        // Tipagem defensiva para msg.data
        const data = msg.data as any; 
        if(data.source === "ps2_controller") setSpeed(data.speed);
      }
    });

    return () => {
      connection.stop();
    };
  }, [thingCode]);

  const addLog = (text: string, type: 'info' | 'error' | 'success' = "info") => {
    setLogs(prev => [{ time: new Date(), text, type }, ...prev].slice(0, 50));
  };

  // Envio de comando via RobotService
  const handleCommand = async (cmd: string) => {
    addLog(`📤 ${cmd}`, "info");
    
    // O callApi dentro do service já trata o erro visual (Toast)
    // Mas mantemos o try/catch aqui para o log do terminal
    try {
      await robotService.sendCommand(thingCode, cmd, speed);
    } catch (error) {
      addLog("❌ Falha envio", "error");
    }
  };

  // Mapeamento de botões
  const controls = [
    { id: 'Q', label: 'Girar Esq.', cmd: 'STRAFE_LEFT', icon: '↖️' },
    { id: 'W', label: 'Frente', cmd: 'FORWARD', icon: '⬆️' },
    { id: 'E', label: 'Girar Dir.', cmd: 'STRAFE_RIGHT', icon: '↗️' },
    { id: 'A', label: 'Esquerda', cmd: 'LEFT', icon: '⬅️' },
    { id: 'S', label: 'Trás', cmd: 'BACKWARD', icon: '⬇️' },
    { id: 'D', label: 'Direita', cmd: 'RIGHT', icon: '➡️' },
    { id: 'X', label: 'Parar', cmd: 'STOP', icon: '🛑' },
  ];

  // Teclado
  useEffect(() => {
    if (isChatOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const btn = controls.find(c => c.id === key);
      if (btn) {
        handleCommand(btn.cmd);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, speed]);

  return (
    <div className="bg-gray-100 h-full flex flex-col p-2 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          🤖 Controle de Robô
        </h1>
        <p className="text-gray-500 text-sm">Sistema via AWS IoT Core</p>
      </div>

      {/* Status Panel */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-600 font-semibold flex items-center gap-2">
            <Wifi size={18} /> Backend AWS
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus.aws ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-sm font-medium text-gray-700">
              {connectionStatus.aws ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
          <span className="text-gray-600 font-semibold flex items-center gap-2">
            <Cpu size={18} /> ESP8266 Master
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus.robot ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {connectionStatus.robot ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {telemetry && (
          <div className="flex justify-between items-center py-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Activity size={14}/> Sinal: {telemetry.wifi_rssi}dBm</span>
            <span>Uptime: {Math.floor(telemetry.uptime / 60)}min</span>
          </div>
        )}
      </div>

      {/* Speed Control */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <h3 className="text-gray-700 font-bold mb-4 text-center">Controle de Velocidade</h3>
        <div className="flex items-center gap-4">
          <span className="text-2xl">🚀</span>
          <input 
            type="range" min="50" max="255" value={speed} 
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-400 to-red-500 rounded-lg appearance-none cursor-pointer"
          />
          <span className="font-bold text-indigo-600 text-xl w-12 text-center">{speed}</span>
        </div>
      </div>

      {/* Movement Controls (Grid) */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <h3 className="text-gray-700 font-bold mb-2 text-center">Controle de Movimento</h3>
        <p className="text-center text-xs text-gray-400 mb-6">⌨️ Teclado: Q, W, E, A, S, D, X</p>
        
        <div className="grid grid-cols-3 gap-3 max-w-[320px] mx-auto">
          {/* Linha 1 */}
          <ControlButton btn={controls[0]} onClick={handleCommand} />
          <ControlButton btn={controls[1]} onClick={handleCommand} />
          <ControlButton btn={controls[2]} onClick={handleCommand} />

          {/* Linha 2 */}
          <ControlButton btn={controls[3]} onClick={handleCommand} />
          <ControlButton btn={controls[6]} onClick={handleCommand} danger /> {/* STOP */}
          <ControlButton btn={controls[5]} onClick={handleCommand} />

          {/* Linha 3 */}
          <div className="invisible"></div>
          <ControlButton btn={controls[4]} onClick={handleCommand} />
          <div className="invisible"></div>
        </div>
      </div>

      {/* Console Log */}
      <div className="flex-1 bg-gray-900 rounded-xl p-4 overflow-hidden flex flex-col min-h-[150px]">
        <h4 className="text-gray-400 text-xs font-mono mb-2 border-b border-gray-700 pb-1">TERMINAL LOG</h4>
        <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1">
          {logs.map((log, i) => (
            <div key={i} className={`flex gap-2 ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-green-400' : 'text-blue-300'
            }`}>
              <span className="text-gray-500">[{log.time.toLocaleTimeString()}]</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Subcomponente ControlButton (já com estilo unificado)
function ControlButton({ btn, onClick, danger }: any) {
  return (
    <button
      onMouseDown={() => onClick(btn.cmd)}
      onMouseUp={() => btn.cmd !== 'STOP' && onClick('STOP')}
      className={`
        relative h-20 rounded-xl transition-all duration-100 flex flex-col items-center justify-center
        shadow-lg active:scale-95 active:shadow-none
        ${danger 
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
          : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:to-purple-700 text-white shadow-indigo-200' 
        }
      `}
    >
      <span className="text-2xl mb-1">{btn.icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{btn.label}</span>
      <span className="absolute top-1 right-2 text-[8px] opacity-50">{btn.id}</span>
    </button>
  );
}