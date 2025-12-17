import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RobotControl from '../components/RobotControl';
import VideoCall from '../components/VideoCall';
import { ArrowLeft, RefreshCw, Loader2, VideoOff } from 'lucide-react';
import { ChatProvider } from '../context/chatContext';
import { robotService } from '../services/robotService';
import type { BotResponse } from '../types';

export default function BotRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bot, setBot] = useState<BotResponse | undefined>(undefined);
  const [error, setError] = useState('');

  // Função para buscar o status da sala
  const checkRoomStatus = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError('');

    try {
      const bot = await robotService.getById(id);
      setBot(bot)


      if (bot && bot.roomUrl) {
        setRoomUrl(bot.roomUrl);
      } else {
        setRoomUrl(null);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar dados do robô.');
    } finally {
      setIsLoading(false);
    }
  };

  // Busca inicial ao carregar a página
  useEffect(() => {
    checkRoomStatus();
    
    const intervalId = setInterval(() => {
      checkRoomStatus();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [bot?.awsThingName]);

  // --- ESTADO 1: CARREGANDO ---
  if (isLoading && !roomUrl) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white flex-col gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p>Verificando status do {bot?.code}...</p>
      </div>
    );
  }

  // --- ESTADO 2: SALA NÃO INICIADA (ROBÔ OFFLINE DO VÍDEO) ---
  if (!roomUrl) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <VideoOff className="text-gray-400" size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vídeo Indisponível</h2>
          <p className="text-gray-500 mb-8">
            O robô <strong>{bot?.code}</strong> ainda não iniciou a transmissão de vídeo.
            Peça para alguém iniciar o app no robô.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={checkRoomStatus} 
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
            >
              <RefreshCw size={20} /> Verificar Novamente
            </button>
            
            <Link 
              to="/bots" 
              className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} /> Voltar para Lista
            </Link>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  // --- ESTADO 3: SALA ATIVA (INTERFACE COMPLETA) ---
  return (
    <ChatProvider>
      <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-100 overflow-hidden">
        
        {/* Painel de Vídeo */}
        <div className="flex-1 bg-black relative min-h-[40vh]">
          {/* Header Flutuante do Vídeo */}
          <div className="absolute top-4 left-4 z-50 flex gap-2">
             <button 
               onClick={() => navigate('/bots')} 
               className="bg-gray-800/80 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2 backdrop-blur-sm transition-all"
             >
               <ArrowLeft size={14} /> Voltar
             </button>
          </div>

          {/* Componente Daily.co */}
          <VideoCall 
            roomUrl={roomUrl} 
            onLeave={() => {
              // Se sair da chamada, volta para a lista ou limpa a URL
              setRoomUrl(null); 
            }} 
          />
        </div>

        {/* Painel de Controles (Direita) */}
        <div className="w-full h-[50vh] lg:w-[400px] lg:h-full border-t lg:border-t-0 lg:border-l border-gray-300 shadow-xl z-10">
          <RobotControl 
            thingCode={bot?.awsThingName} 
            roomUrl={roomUrl} // Passamos a URL para o controle exibir se necessário
          />
        </div>
        
      </div>
    </ChatProvider>
  );
}