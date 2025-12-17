import { useEffect, useState } from 'react';
import { 
  Bot, Server, Plus, RefreshCw, Wifi, 
  Calendar, CheckCircle, Copy, X, 
  Download, FileCode // Novos ícones
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminBotService, type BotCreateDto, type BotResponseDto } from '../../services/adminBotService';

type TabType = 'list' | 'create';

export default function AdminDevices() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [bots, setBots] = useState<BotResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Modal de Sucesso
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [createdRedeemCode, setCreatedRedeemCode] = useState('');

  // Estados do Formulário
  const [formData, setFormData] = useState<BotCreateDto>({
    name: '',
    code: '',
    wifiPassword: '',
    modelId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para controlar qual bot está baixando (loading individual)
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchBots();
    }
  }, [activeTab]);

  const fetchBots = async () => {
    setIsLoading(true);
    try {
      const data = await adminBotService.getAll();
      if (data) setBots(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const redeemCode = await adminBotService.create(formData);
      if (redeemCode) {
        setCreatedRedeemCode(redeemCode);
        setShowRedeemModal(true);
        setFormData({ name: '', code: '', wifiPassword: '', modelId: null });
        fetchBots(); // Atualiza a lista no fundo
      }
    } catch (error) {
      // Erro tratado
    } finally {
      setIsSubmitting(false);
    }
  };

  // === AÇÃO DE COPIAR ===
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Código copiado para a área de transferência!');
  };

  // === AÇÃO DE DOWNLOAD ===
  const handleDownloadSketch = async (bot: BotResponseDto) => {
    setDownloadingId(bot.id);
    try {
        toast.info("Gerando pacote do sketch...");
        await adminBotService.downloadSketch(bot.id, bot.code);
        toast.success("Download iniciado!");
    } catch (error) {
        toast.error("Falha ao baixar os arquivos do sketch.");
    } finally {
        setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header e Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Dispositivos</h1>
        
        <div className="flex bg-white p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'list' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Server size={16} />
            All Bots
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'create' 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus size={16} />
            Create Bot
          </button>
        </div>
      </div>

      {/* --- TAB: LIST ALL BOTS --- */}
      {activeTab === 'list' && (
        <div>
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => fetchBots()}
              className="p-2 text-gray-500 hover:text-slate-800 transition-colors"
              title="Recarregar"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {isLoading && bots.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Carregando dispositivos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map(bot => (
                <div key={bot.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden group flex flex-col h-full">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                      bot.active 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {bot.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                      <Bot size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{bot.name}</h3>
                      <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded inline-block">
                        {bot.code}
                      </p>
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4 flex-1">
                    
                    {/* Redeem Code com Botão de Copiar */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 font-medium uppercase">Redeem Code</span>
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="font-mono font-bold text-indigo-600 truncate mr-2 select-all">
                          {bot.redeemCode || 'N/A'}
                        </span>
                        {bot.redeemCode && (
                          <button 
                            onClick={() => copyToClipboard(bot.redeemCode!)}
                            className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                            title="Copiar código"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {bot.redeemDate && (
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar size={12}/> Resgatado em:</span>
                        <span>{new Date(bot.redeemDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Ações do Card */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => handleDownloadSketch(bot)}
                        disabled={downloadingId === bot.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-wait"
                    >
                        {downloadingId === bot.id ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Download size={16} />
                        )}
                        {downloadingId === bot.id ? 'Gerando...' : 'Download Sketch'}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                        <FileCode size={10} /> Inclui código .ino e config.h
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB: CREATE BOT --- */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          {/* ... (Mantém o código do formulário de criação igual ao anterior) ... */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-slate-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Plus className="text-slate-600" size={20} />
                Cadastrar Novo Robô
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Preencha os dados técnicos do dispositivo. O código de resgate será gerado automaticamente.
              </p>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Nome do Dispositivo</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                    placeholder="Ex: Bot Alpha 01"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Código Único (Thing Name)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all font-mono"
                    placeholder="Ex: AvatarBot_01"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Wifi size={16} /> Senha do Access Point (Wi-Fi)
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  placeholder="Senha para configuração inicial"
                  value={formData.wifiPassword}
                  onChange={e => setFormData({...formData, wifiPassword: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Model ID (Opcional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  placeholder="GUID do modelo 3D"
                  value={formData.modelId || ''}
                  onChange={e => setFormData({...formData, modelId: e.target.value || null})}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" /> : <CheckCircle size={20} />}
                  Criar Dispositivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE REDEEM CODE --- */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <button 
                onClick={() => setShowRedeemModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Bot Criado com Sucesso!</h3>
            <p className="text-gray-500 mb-6">
              O dispositivo foi registrado. Envie este código para o usuário final realizar o vínculo.
            </p>

            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center mb-6 relative group">
              <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider font-bold">Redeem Code</p>
              <p className="text-3xl font-mono font-bold text-slate-800 tracking-widest break-all">
                {createdRedeemCode}
              </p>
              
              <button
                onClick={() => copyToClipboard(createdRedeemCode)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white shadow-sm border border-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600"
                title="Copiar"
              >
                <Copy size={20} />
              </button>
            </div>

            <button
              onClick={() => setShowRedeemModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}