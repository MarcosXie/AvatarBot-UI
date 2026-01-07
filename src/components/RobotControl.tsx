// src/components/RobotControl.tsx
import { useState, useEffect, useRef } from 'react';
import { robotService } from '../services/robotService';
import { Wifi, Cpu, Copy, Check, Video, ArrowUpFromLine, ArrowDownToLine, MoveVertical, Zap, Gamepad2, TerminalSquare } from 'lucide-react';
import type { SignalRMessage, TelemetryData } from '../types';
import { useChat } from '../context/chatContext';
import { useAuth } from '../context/authContext';

interface LogEntry {
  time: Date;
  text: string;
  type: 'info' | 'error' | 'success';
}

interface RobotControlProps {
  thingCode?: string;
  roomUrl?: string | null;
}

export default function RobotControl({ thingCode = "ExpoBot_Felipe", roomUrl }: RobotControlProps) {
  const { isChatOpen } = useChat();
  const logEndRef = useRef<HTMLDivElement>(null);

  const [connectionStatus, setConnectionStatus] = useState({
    aws: false,
    robot: false
  });
  const [speed, setSpeed] = useState<number>(200);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleCopyUrl = () => {
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSignalInfo = (rssi: number) => {
    if (rssi >= -50) return { color: 'text-green-600', bg: 'bg-green-600', bars: 4 };
    if (rssi >= -65) return { color: 'text-green-500', bg: 'bg-green-500', bars: 3 };
    if (rssi >= -75) return { color: 'text-yellow-500', bg: 'bg-yellow-500', bars: 2 };
    if (rssi >= -85) return { color: 'text-orange-500', bg: 'bg-orange-500', bars: 1 };
    return { color: 'text-red-500', bg: 'bg-red-500', bars: 0 };
  };

  useEffect(() => {
    const connection = robotService.createSignalRConnection(thingCode);
    connection.start()
      .then(() => {
        connection.invoke("JoinControlRoom", thingCode, user?.id ?? "");
        addLog("✅ Connected", "success");
      })
      .catch(err => addLog(`❌ Error: ${err}`, "error"));

    connection.on("ReceiveMessage", (msg: SignalRMessage) => {
      if (msg.thingCode && msg.thingCode !== thingCode) return;
      
      if (msg.type === "connection" && msg.status) {
        setConnectionStatus({
          aws: msg.status.awsIot,
          robot: msg.status.esp8266Connected
        });
      }
      else if (msg.type === "heartbeat" && msg.data) {
        setTelemetry(msg.data.data as TelemetryData);
        setConnectionStatus(prev => ({ ...prev, aws: true, robot: true }));
      }
      else if (msg.type === "speed_update" && msg.data) {
        const data = msg.data as any;
        if (data.source === "ps2_controller") setSpeed(data.speed);
      }
    });

    return () => { connection.stop(); };
  }, [thingCode, user?.id]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (text: string, type: 'info' | 'error' | 'success' = "info") => {
    setLogs(prev => [...prev.slice(-99), { time: new Date(), text, type }]);
  };

const handleCommand = async (cmd: string) => {
    // ADICIONE ESTA LINHA:
    addLog(`📤 Enviando: ${cmd} (Vel: ${speed})`, "info");
    
    // Debug no Console do navegador (F12) para garantir
    console.log("Comando disparado:", cmd); 

    try {
      await robotService.sendCommand(thingCode, cmd, speed);
    } catch (error) {
      console.error(error); // Ver erro real no console do navegador
      addLog("❌ Falha ao enviar", "error");
    }
};

  // --- CONTROLS ---
  const movementControls = [
    { id: 'Q', label: 'Rot L', cmd: 'STRAFE_LEFT', icon: '↖️' },
    { id: 'W', label: 'Fwd', cmd: 'FORWARD', icon: '⬆️' },
    { id: 'E', label: 'Rot R', cmd: 'STRAFE_RIGHT', icon: '↗️' },
    { id: 'A', label: 'Left', cmd: 'LEFT', icon: '⬅️' },
    { id: 'S', label: 'Back', cmd: 'BACKWARD', icon: '⬇️' },
    { id: 'D', label: 'Right', cmd: 'RIGHT', icon: '➡️' },
    { id: 'X', label: 'Stop', cmd: 'STOP', icon: '🛑' },
  ];

  const actuatorControls = [
    { id: 'U', label: 'Up', cmd: 'UP', icon: <ArrowUpFromLine size={28} /> },
    { id: 'J', label: 'Down', cmd: 'DOWN', icon: <ArrowDownToLine size={28} /> },
  ];

  const servoControls = [
    { id: 'I', label: 'Up', cmd: 'SERVO_UP', icon: '🔼' },
    { id: 'K', label: 'Center', cmd: 'SERVO_CENTER', icon: '↔️', noStop: true },
    { id: 'M', label: 'Down', cmd: 'SERVO_DOWN', icon: '🔽' },
  ];

  // Keyboard Listeners
  useEffect(() => {
    if (isChatOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      [...movementControls, ...actuatorControls, ...servoControls].forEach(c => {
        if (c.id === key) handleCommand(c.cmd);
      });
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const moveBtn = movementControls.find(c => c.id === key);
      if (moveBtn && moveBtn.cmd !== 'STOP') { handleCommand('STOP'); return; }
      if (['U', 'J', 'I', 'M'].includes(key)) handleCommand('X');
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isChatOpen, speed]);

  const sigInfo = telemetry ? getSignalInfo(telemetry.wifi_rssi) : { bg: 'bg-gray-300', bars: 0 };

  return (
    <div className="bg-slate-100 h-full w-full flex flex-col overflow-hidden p-3 gap-3">
      
      {/* 1. HEADER (Maior e mais visível) */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 shrink-0 flex items-center justify-between gap-4 min-h-[60px]">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Gamepad2 size={24} /></div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-lg uppercase leading-none mb-0.5">Robot Control</h1>
            <span className="text-xs font-semibold text-slate-400">AWS IoT Core System</span>
          </div>
        </div>
        
        {roomUrl && (
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 gap-3 max-w-[240px]">
            <Video size={18} className="text-slate-400" />
            <span className="text-xs font-mono font-medium text-slate-600 truncate flex-1">{roomUrl}</span>
            <button onClick={handleCopyUrl} className="text-slate-400 hover:text-indigo-600 active:scale-95 transition-transform">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* 2. ÁREA PRINCIPAL (2 Colunas, Botões Maiores) */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        
        {/* --- COLUNA ESQUERDA: PILOTAGEM --- */}
        <div className="flex flex-col gap-3">
          
          {/* Speed Control (Mais robusto) */}
          <div className="bg-white px-1 py-3 rounded-xl shadow-sm border border-slate-200 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 mr-4">
                <Zap size={22} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Speed</span>
            </div>
            <input
                type="range" min="50" max="255" value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
            />
            <span className="text-base font-mono font-bold text-indigo-600 w-12 text-right ml-2">{speed}</span>
          </div>

          {/* D-Pad (QUADRADO GRANDE) */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 aspect-square flex flex-col">
            <div className="text-[10px] font-bold text-slate-400 uppercase text-center mb-2 shrink-0 tracking-wider">Movement Controls</div>
            <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
              <ControlButton btn={movementControls[0]} onClick={handleCommand} />
              <ControlButton btn={movementControls[1]} onClick={handleCommand} primary />
              <ControlButton btn={movementControls[2]} onClick={handleCommand} />
              
              <ControlButton btn={movementControls[3]} onClick={handleCommand} />
              <ControlButton btn={movementControls[6]} onClick={handleCommand} danger />
              <ControlButton btn={movementControls[5]} onClick={handleCommand} />
              
              <div className="invisible"></div>
              <ControlButton btn={movementControls[4]} onClick={handleCommand} />
              <div className="invisible"></div>
            </div>
          </div>
        </div>

        {/* --- COLUNA DIREITA: STATUS & FERRAMENTAS --- */}
        <div className="flex flex-col gap-3">
          
          {/* Status (Altura igual ao Speed) */}
          <div className="bg-white px-4 rounded-xl shadow-sm border border-slate-200 h-16 flex items-center justify-between text-sm">
             <div className="flex gap-3">
                <div className={`flex items-center gap-1.5 font-bold ${connectionStatus.aws ? 'text-green-600' : 'text-red-500'}`}>
                    <Wifi size={18}/> AWS
                </div>
                <div className={`flex items-center gap-1.5 font-bold ${connectionStatus.robot ? 'text-green-600' : 'text-red-500'}`}>
                    <Cpu size={18}/> ESP
                </div>
             </div>
             {telemetry && (
                <div className="flex gap-1 h-4 items-end">
                   {[1,2,3,4].map(b => <div key={b} className={`w-1.5 rounded-sm ${b <= sigInfo.bars ? sigInfo.bg : 'bg-slate-200'}`} style={{height: `${b*25}%`}} />)}
                </div>
             )}
          </div>

          {/* Tools Container (QUADRADO para alinhar) */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 aspect-square flex flex-col">
             
             {/* Actuator Section */}
             <div className="flex-1 flex flex-col mb-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase text-center mb-2 shrink-0 flex items-center justify-center gap-2 tracking-wider">
                    <MoveVertical size={14}/> Linear Actuator
                </div>
                <div className="flex gap-2 flex-1 min-h-0">
                    <div className="flex-1 h-full"><ControlButton btn={actuatorControls[0]} onClick={handleCommand} /></div>
                    <div className="flex-1 h-full"><ControlButton btn={actuatorControls[1]} onClick={handleCommand} /></div>
                </div>
             </div>

             <div className="h-[1px] bg-slate-100 my-1 shrink-0"></div>

             {/* Servo Section */}
             <div className="flex-1 flex flex-col mt-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase text-center mb-2 shrink-0 tracking-wider">Servo Motor</div>
                <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
                    <ControlButton btn={servoControls[0]} onClick={handleCommand} />
                    <ControlButton btn={servoControls[1]} onClick={handleCommand} />
                    <ControlButton btn={servoControls[2]} onClick={handleCommand} />
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* 3. LOGS (EXPANSÍVEL) */}
      <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col min-h-0 shadow-inner">
        <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700 shrink-0">
           <TerminalSquare size={16} className="text-slate-400" />
           <span className="text-xs text-slate-300 font-mono font-bold uppercase tracking-widest">System Terminal</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
           {logs.length === 0 && <div className="text-slate-600 italic mt-2 text-center text-sm">Ready to connect...</div>}
           {logs.map((log, i) => (
             <div key={i} className={`flex gap-3 border-b border-white/5 pb-1 mb-1 last:border-0 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-blue-300'}`}>
                <span className="text-slate-500 select-none">[{log.time.toLocaleTimeString([], {hour12:false, minute:'2-digit', second:'2-digit'})}]</span>
                <span className="break-all font-medium">{log.text}</span>
             </div>
           ))}
           <div ref={logEndRef} />
        </div>
      </div>

    </div>
  );
}

// Botão Quadrado/Harmônico Otimizado
function ControlButton({ btn, onClick, danger, primary, noStop }: any) {
  return (
    <button
      onMouseEnter={() => onClick(btn.cmd)}
      onMouseLeave={() => !noStop && btn.cmd !== 'STOP' && onClick('STOP')}
      onMouseDown={() => onClick(btn.cmd)}
      onTouchStart={(e) => { e.preventDefault(); onClick(btn.cmd); }}
      onTouchEnd={(e) => { e.preventDefault(); if(!noStop && btn.cmd !== 'STOP') onClick('STOP'); }}
      className={`
        w-full h-full rounded-xl flex flex-col items-center justify-center select-none touch-manipulation relative
        shadow-sm transition-all active:scale-95 active:shadow-inner border-b-[3px] active:border-b-0 active:translate-y-[2px]
        ${danger 
          ? 'bg-red-500 border-red-700 text-white shadow-red-100 hover:bg-red-600' 
          : primary 
            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }
      `}
    >
      <span className="text-2xl lg:text-3xl leading-none mb-1 opacity-90">{btn.icon}</span>
      <span className={`text-[9px] font-bold uppercase tracking-wider ${danger ? 'text-white/90' : 'text-slate-400'}`}>{btn.label}</span>
    </button>
  );
}