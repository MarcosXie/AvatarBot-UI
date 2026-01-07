import { useEffect, useState } from 'react';
import { 
  Bot, Server, Plus, RefreshCw, Wifi, 
  Calendar, CheckCircle, Copy, X, 
  Download, FileCode, Trash2, Edit, Save, AlertTriangle, 
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
    adminBotService, 
    type BotCreateDto, 
    type BotResponseDto,
} from '../../services/adminBotService';
import type { BotUpdateDto } from '../../types';
import type { BaseError } from '../../services/api';
import { Link } from 'react-router-dom';

type TabType = 'list' | 'create';

export default function AdminDevices() {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [bots, setBots] = useState<BotResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // === CREATE STATES ===
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [createdRedeemCode, setCreatedRedeemCode] = useState('');
  const [createFormData, setCreateFormData] = useState<BotCreateDto>({
    name: '',
    code: '',
    wifiPassword: '',
    modelId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // === DOWNLOAD STATE ===
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // === DELETE STATES ===
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [botToDelete, setBotToDelete] = useState<BotResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // === EDIT STATES ===
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<BotUpdateDto>({
      name: '',
      wifiPassword: '',
      modelId: null
  });
  const [isUpdating, setIsUpdating] = useState(false);

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
      const err = error as BaseError;
      toast.error(err.message || "Error loading device list.");
    } finally {
      setIsLoading(false);
    }
  };

  // === CREATE ===
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const redeemCode = await adminBotService.create(createFormData);

      if (redeemCode) {
        setCreatedRedeemCode(redeemCode);
        setShowRedeemModal(true);
        setCreateFormData({ name: '', code: '', wifiPassword: '', modelId: null });
        
        toast.success("Device created successfully!");
        fetchBots(); 
      }
    } catch (error) {
      const err = error as BaseError;
      toast.error(err.message || "Error creating device. Check your data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === DELETE ===
  const handleDeleteClick = (bot: BotResponseDto) => {
      setBotToDelete(bot);
      setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
      if (!botToDelete) return;
      setIsDeleting(true);
      try {
          await adminBotService.delete(botToDelete.id);
          toast.success(`Device "${botToDelete.name}" deleted successfully.`);
          setBots(prev => prev.filter(b => b.id !== botToDelete.id));
          setShowDeleteModal(false);
      } catch (error) {
          const err = error as BaseError;
          toast.error(err.message || "Error deleting device.");
      } finally {
          setIsDeleting(false);
          setBotToDelete(null);
      }
  };

  // === EDIT ===
  const handleEditClick = (bot: BotResponseDto) => {
      setEditingBotId(bot.id);
      setEditFormData({
          name: bot.name,
          wifiPassword: bot.wifiPassword || '', 
          modelId: bot.modelId || null
      });
      setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBotId) return;

      setIsUpdating(true);
      try {
          await adminBotService.update(editingBotId, editFormData);
          toast.success("Device updated successfully!");
          setShowEditModal(false);
          fetchBots(); 
      } catch (error) {
          const err = error as BaseError;
          toast.error(err.message || "Error updating device.");
      } finally {
          setIsUpdating(false);
          setEditingBotId(null);
      }
  };

  // === UTILS ===
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownloadSketch = async (bot: BotResponseDto) => {
    setDownloadingId(bot.id);
    try {
        toast.info("Generating sketch package...");
        await adminBotService.downloadSketch(bot.id, bot.code);
        toast.success("Download started!");
    } catch (error) {
        const err = error as BaseError;
        toast.error(err.message || "Failed to download sketch files.");
    } finally {
        setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Device Management</h1>
        
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
              title="Reload"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {isLoading && bots.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Loading devices...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map(bot => (
                <div key={bot.id} className={`bg-white p-6 rounded-xl shadow-sm border relative overflow-hidden group flex flex-col h-full transition-all ${!bot.redeemDate ? 'border-indigo-200 ring-1 ring-indigo-50/50' : 'border-gray-200'}`}>
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

                  {/* Identidade do Bot (Clicável se não resgatado) */}
                  <div className="flex items-center gap-3 mb-4 relative">
                    {!bot.redeemDate ? (
                        <Link 
                            to={`/room/${bot.id}`} 
                            className="flex items-center gap-3 group/link hover:opacity-80 transition-all"
                            title="Enter Control Room"
                        >
                            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover/link:bg-indigo-600 group-hover/link:text-white transition-colors">
                                <Bot size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <h3 className="font-bold text-gray-800 group-hover/link:text-indigo-600">{bot.name}</h3>
                                    <ExternalLink size={14} className="text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded inline-block">
                                    {bot.code}
                                </p>
                            </div>
                        </Link>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                                <Bot size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{bot.name}</h3>
                                <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded inline-block">
                                    {bot.code}
                                </p>
                            </div>
                        </>
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="space-y-3 text-sm text-gray-600 border-t border-gray-100 pt-4 flex-1">
                    {/* Redeem Code */}
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
                            title="Copy Code"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Wi-Fi Password */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 font-medium uppercase flex items-center gap-1">
                        <Wifi size={12} /> Wi-Fi Password
                      </span>
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                        <span className="font-mono font-bold text-gray-700 truncate mr-2 select-all">
                          {bot.wifiPassword || 'N/A'}
                        </span>
                        {bot.wifiPassword && (
                          <button 
                            onClick={() => copyToClipboard(bot.wifiPassword!)}
                            className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                            title="Copy Password"
                          >
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {bot.redeemDate && (
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar size={12}/> Redeemed on:</span>
                        <span>{new Date(bot.redeemDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    
                    {/* Botão de Acesso Direto (Somente se não resgatado) */}
                    {!bot.redeemDate && (
                        <Link 
                            to={`/room/${bot.id}`}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 text-sm font-bold"
                        >
                            <ExternalLink size={16} />
                            Access Main Control Screen
                        </Link>
                    )}

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
                        {downloadingId === bot.id ? 'Generating...' : 'Download Sketch'}
                    </button>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleEditClick(bot)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-bold"
                        >
                            <Edit size={14} /> Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(bot)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center mt-1 flex items-center justify-center gap-1">
                        <FileCode size={10} /> Includes .ino & config.h
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-slate-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Plus className="text-slate-600" size={20} />
                Register New Bot
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the device technical details. The redeem code will be generated automatically.
              </p>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Device Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                    placeholder="Ex: Bot Alpha 01"
                    value={createFormData.name}
                    onChange={e => setCreateFormData({...createFormData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Unique Code (Thing Name)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all font-mono"
                    placeholder="Ex: ExpoBot_01"
                    value={createFormData.code}
                    onChange={e => setCreateFormData({...createFormData, code: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Wifi size={16} /> Access Point Password (Wi-Fi)
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  placeholder="Password for initial config"
                  value={createFormData.wifiPassword}
                  onChange={e => setCreateFormData({...createFormData, wifiPassword: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Model ID (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none transition-all"
                  placeholder="3D Model GUID"
                  value={createFormData.modelId || ''}
                  onChange={e => setCreateFormData({...createFormData, modelId: e.target.value || null})}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" /> : <CheckCircle size={20} />}
                  Create Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALS (REDEEM, DELETE, EDIT) --- */}
      
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
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Bot Created Successfully!</h3>
            <p className="text-gray-500 mb-6">
              The device has been registered. Send this code to the end user to link it.
            </p>

            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center mb-6 relative group">
              <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider font-bold">Redeem Code</p>
              <p className="text-3xl font-mono font-bold text-slate-800 tracking-widest break-all">
                {createdRedeemCode}
              </p>
              
              <button
                onClick={() => copyToClipboard(createdRedeemCode)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white shadow-sm border border-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600"
                title="Copy"
              >
                <Copy size={20} />
              </button>
            </div>

            <button
              onClick={() => setShowRedeemModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && botToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 p-3 rounded-full mb-4">
                        <AlertTriangle className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Device?</h3>
                    <p className="text-gray-500 mb-6">
                        Are you sure you want to delete <span className="font-bold text-gray-800">"{botToDelete.name}"</span>?
                        This action cannot be undone.
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isDeleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {showEditModal && editingBotId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Edit Device</h3>
                    <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Device Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            value={editFormData.name}
                            onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Wifi size={14} /> Wi-Fi Password
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            value={editFormData.wifiPassword}
                            onChange={e => setEditFormData({...editFormData, wifiPassword: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Model ID</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            value={editFormData.modelId || ''}
                            onChange={e => setEditFormData({...editFormData, modelId: e.target.value || null})}
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
                        >
                            {isUpdating ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}