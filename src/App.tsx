// src/App.tsx
import { useState } from 'react';
import RobotControl from './components/RobotControl';
import VideoCall from './components/VideoCall';
import Lobby from './components/Lobby';
import { ChatProvider } from './context/ChatContext';

function App() {
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  
  // Em um sistema real, isso viria do Lobby ou de uma rota
  const [thingCode] = useState<string>("ExpoBot_Felipe"); 

  if (!roomUrl) {
    return <Lobby onJoin={(url) => setRoomUrl(url)} />;
  }

  return (
    <ChatProvider>
      {/* MUDANÇAS DE RESPONSIVIDADE AQUI:
          1. flex-col: Padrão (Mobile) -> Itens um embaixo do outro
          2. lg:flex-row: Desktop (Large screens) -> Itens lado a lado
      */}
      <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-100 overflow-hidden">
        
        {/* Painel de Vídeo:
            - Mobile: flex-1 (Ocupa o espaço que sobrar verticalmente)
            - min-h-[40vh]: Garante que o vídeo não suma se o teclado abrir no celular
        */}
        <div className="flex-1 bg-black relative min-h-[40vh]">
          <VideoCall roomUrl={roomUrl} onLeave={() => setRoomUrl(null)} />
        </div>

        <div className="w-full h-[50vh] lg:w-[600px] lg:h-full border-t lg:border-t-0 lg:border-l border-gray-300">
          <RobotControl thingCode={thingCode} />
        </div>
        
      </div>
    </ChatProvider>
  );
}

export default App;