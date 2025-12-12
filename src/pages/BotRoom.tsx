import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import RobotControl from '../components/RobotControl';
import VideoCall from '../components/VideoCall';
import Lobby from '../components/Lobby';
import { ArrowLeft } from 'lucide-react';
import { ChatProvider } from '../context/chatContext';

export default function BotRoom() {
  const { thingCode } = useParams(); // Pega o ID da URL
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  if (!roomUrl) {
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 z-50">
          <Link to="/bots" className="flex items-center gap-2 text-white bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700">
            <ArrowLeft size={16} /> Voltar
          </Link>
        </div>
        <Lobby onJoin={(url) => setRoomUrl(url)} />
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-100 overflow-hidden">
        
        {/* Painel de Vídeo */}
        <div className="flex-1 bg-black relative min-h-[40vh]">
          {/* Botão de Voltar Flutuante */}
          <div className="absolute top-4 left-4 z-50">
             <button onClick={() => setRoomUrl(null)} className="bg-red-600 text-white px-3 py-1 rounded text-sm shadow">
               Sair da Sala
             </button>
          </div>
          <VideoCall roomUrl={roomUrl} onLeave={() => setRoomUrl(null)} />
        </div>

        {/* Painel de Controles */}
        <div className="w-full h-[50vh] lg:w-[400px] lg:h-full border-t lg:border-t-0 lg:border-l border-gray-300">
          <RobotControl thingCode={thingCode} />
        </div>
        
      </div>
    </ChatProvider>
  );
}