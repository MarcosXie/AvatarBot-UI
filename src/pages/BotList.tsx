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
    fetchBots();
  }, [user]);

  const fetchBots = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const data = await robotService.getBotsByUserId(user.id);
    
    if (data) {
      setBots(data);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Meus Dispositivos</h1>
        <button 
          onClick={fetchBots} 
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
          title="Atualizar lista"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Carregando dispositivos...</div>
      ) : bots.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <Bot size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum robô encontrado para este usuário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            // IMPORTANTE: O link usa bot.code (ThingCode) e não o GUID, 
            // pois é isso que o MQTT precisa para conectar.
            <Link key={bot.id} to={`/room/${bot.awsThingName}`} className="block group">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden">
                
                {/* Indicador de Ativo no Banco (opcional) */}
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${bot.active ? 'from-green-100' : 'from-gray-100'} to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50`}></div>

                <div className="flex justify-between items-start mb-4 relative">
                  <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Bot className="text-indigo-600" size={24} />
                  </div>
                  
                  {/* Placeholder de Status Online/Offline (Mockado por enquanto) */}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                    OFFLINE
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-1">{bot.name}</h3>
                <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-50 inline-block px-2 py-1 rounded">
                  {bot.code}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Wifi size={14}/> --</span>
                  <span className="flex items-center gap-1"><Battery size={14}/> --</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}