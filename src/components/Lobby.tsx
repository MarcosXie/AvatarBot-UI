// src/components/Lobby.tsx
import { useState } from 'react';
import { Plus, Copy, Check, Video } from 'lucide-react';

// NOTA DE SEGURANÇA: Em produção, nunca deixe chaves de API no Frontend.
// O ideal seria criar uma rota no seu C# (/api/create-room) que chama o Daily.co.
// Mas para este protótipo, usaremos aqui conforme seu código original.
const DAILY_API_KEY = 'e220c028cdb5cb23499e2edce025dcafee5fa199b6b62b7b911f88e33ae0253e';

interface LobbyProps {
  onJoin: (url: string) => void;
}

export default function Lobby({ onJoin }: LobbyProps) {
  const [url, setUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Por favor, insira ou crie uma URL de sala.');
      return;
    }
    
    // Validação simples
    if (!url.includes('daily.co')) {
      setError('A URL deve ser uma sala válida do Daily.co');
      return;
    }

    onJoin(url);
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Nome aleatório para a sala
      const roomName = `room-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DAILY_API_KEY}`
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'public'
        })
      });

      if (!response.ok) {
        throw new Error('Falha na resposta da API');
      }

      const data = await response.json();
      setUrl(data.url);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Erro ao criar sala. Verifique a chave API ou tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Videochamada</h1>
          <p className="text-gray-500 mt-2">Conecte-se com sua equipe e controle o robô</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input da Sala */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL da Sala Daily.co
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sua-sala.daily.co/sala"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              
              {/* Botão de Copiar (só aparece se tiver URL) */}
              {url && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className={`p-3 rounded-lg border transition-colors ${
                    copied 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Copiar URL"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              )}

              {/* Botão Criar Sala */}
              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="p-3 bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                title="Criar nova sala automática"
              >
                {isLoading ? (
                  <span className="animate-spin block w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            </div>
            {copied && <p className="text-green-600 text-xs mt-1">Link copiado para a área de transferência!</p>}
          </div>

          {/* Input do Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seu Nome (Opcional)
            </label>
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Botão Entrar */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-lg font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Entrar na Chamada
          </button>
        </form>
      </div>
    </div>
  );
}