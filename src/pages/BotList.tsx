import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Battery, Wifi, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { robotService } from '../services/robotService';
import type { BotListItem } from '../types';

export default function BotList() {
  const { user } = useAuth();
  const [bots, setBots] = useState<BotListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Carrega imediatamente ao montar
    fetchBots();

    // 2. Configura o intervalo de 10 segundos (10000 ms)
    const intervalId = setInterval(() => {
      fetchBots(true); // Passa true para indicar que é refresh em background
    }, 10000);

    // 3. Limpa o intervalo quando o componente desmontar (para não vazar memória)
    return () => clearInterval(intervalId);
  }, [user]);

  // Adicionei o parametro 'isBackground' para não mostrar o spinner rodando sozinho a cada 10s
  const fetchBots = async (isBackground = false) => {
    if (!user?.id) return;
    
    // Só ativa o loading se NÃO for background (primeira carga ou clique manual)
    if (!isBackground) setIsLoading(true);
    
    try {
      const data = await robotService.getBotsByUserId(user.id);
      if (data) {
        setBots(data);
      }
    } catch (error) {
      console.error("Erro ao buscar bots:", error);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  // Lógica de visualização do Status
  const getStatusDisplay = (bot: BotListItem) => {
    // 1. Prioridade: Se não estiver ativo (Disabled)
    if (!bot.active) {
      return {
        label: 'DISABLED',
        className: 'bg-red-100 text-red-600 border-red-200',
        dotColor: 'bg-red-500'
      };
    }

    // 2. Se ativo e disponível para chamada (Online)
    if (bot.isBotCallAvailable) {
      return {
        label: 'ONLINE',
        className: 'bg-green-100 text-green-700 border-green-200',
        dotColor: 'bg-green-500 animate-pulse'
      };
    }

    // 3. Se ativo mas sem vídeo (Offline)
    return {
      label: 'OFFLINE',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
      dotColor: 'bg-gray-400'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Dispositivos</h1>
        <button 
          onClick={() => fetchBots(false)} // Clique manual mostra o loading
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
          title="Atualizar lista"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {isLoading && bots.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Carregando dispositivos...</div>
      ) : bots.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <Bot size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum robô encontrado para este usuário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => {
            const status = getStatusDisplay(bot);

            return (
              // Mantive o bot.code aqui para garantir o link correto com o MQTT/Sala
              <Link key={bot.id} to={`/room/${bot.id}`} className="block group">
                <div className={`bg-white p-6 rounded-xl shadow-sm border transition-all cursor-pointer relative overflow-hidden
                  ${!bot.active ? 'opacity-75 bg-gray-50' : 'hover:shadow-md hover:border-indigo-300 border-gray-200'}
                `}>
                  
                  {/* Header do Card */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg transition-colors ${!bot.active ? 'bg-gray-200' : 'bg-indigo-50 group-hover:bg-indigo-100'}`}>
                      <Bot className={!bot.active ? 'text-gray-400' : 'text-indigo-600'} size={24} />
                    </div>
                    
                    {/* Badge de Status Parametrizado */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${status.className}`}>
                      <div className={`w-2 h-2 rounded-full ${status.dotColor}`} />
                      {status.label}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{bot.name}</h3>
                  <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
                    {bot.code}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Wifi size={14}/> --</span>
                    <span className="flex items-center gap-1"><Battery size={14}/> --</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}