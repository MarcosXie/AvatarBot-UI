import { Link } from 'react-router-dom';
import { Bot, Battery, Wifi } from 'lucide-react';

export default function BotList() {
  // Mock de dados (virá da API depois)
  const bots = [
    { id: 'ExpoBot_Felipe', name: 'Robô Felipe', status: 'online', battery: 85 },
    { id: 'ExpoBot_02', name: 'Robô Teste 02', status: 'offline', battery: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Meus Dispositivos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map(bot => (
          <Link key={bot.id} to={`/room/${bot.id}`} className="block">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Bot className="text-indigo-600" size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  bot.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {bot.status.toUpperCase()}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{bot.name}</h3>
              <p className="text-xs text-gray-500 mb-4">ID: {bot.id}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Wifi size={14}/> Sinal Forte</span>
                {bot.status === 'online' && (
                  <span className="flex items-center gap-1"><Battery size={14}/> {bot.battery}%</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}