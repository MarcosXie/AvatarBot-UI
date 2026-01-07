import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, Wifi, RefreshCw, Gift, CheckCircle,
  Video, VideoOff, WifiOff,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import { robotService } from '../services/robotService';
import type { BotListItem, SignalRMessage } from '../types';
import { toast } from 'react-toastify';

type TabType = 'my-bots' | 'redeem';

interface BotListProps {
  isDemo?: boolean;
}

export default function BotList({ isDemo = false }: BotListProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('my-bots');
  const [bots, setBots] = useState<BotListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // --- 1. INTEGRAÇÃO SIGNALR (TEMPO REAL) ---
  useEffect(() => {
    const connection = robotService.createSignalRConnection("LIST_MONITOR");

    connection.start().catch(err => console.error("SignalR List Error: ", err));

    connection.on("ReceiveMessage", (msg: SignalRMessage) => {
      setBots(prevBots => prevBots.map(bot => {
        if (bot.awsThingName === msg.thingCode) {
          if (msg.type === "occupancy_update") {
            return { ...bot, isBusy: msg.data.isBusy };
          }

          if (msg.type === "heartbeat" && msg.data) {
            return {
              ...bot,
              isRobotOnline: true,
              rssi: msg.data.data.wifi_rssi
            };
          }
          if (msg.type === "connection") {
            return { ...bot, isRobotOnline: msg.data.connected };
          }
        }
        return bot;
      }));
    });

    return () => { connection.stop(); };
  }, [bots.length]);

  useEffect(() => {
    fetchBots();
    const intervalId = setInterval(() => fetchBots(true), 15000);
    return () => clearInterval(intervalId);
  }, [user]);

  const fetchBots = async (isBackground = false) => {
    if (!user?.id) return;
    if (!isBackground) setIsLoading(true);

    try {
      const data = await robotService.getBotsByUserId(user.id, isDemo);
      if (data) setBots(data);
    } catch (error) {
      console.error("Error fetching bots:", error);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  const handleRedeemBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode || !user?.id) return;
    setIsRedeeming(true);
    try {
      await robotService.redeemBot(redeemCode, user.id);
      toast.success("Bot redeemed successfully!");
      setRedeemCode('');
      setActiveTab('my-bots');
      fetchBots(false);
    } catch (error) {
      toast.error("Failed to redeem bot.");
    } finally {
      setIsRedeeming(false);
    }
  };

  // --- 2. LÓGICA DE STATUS COMPOSTO ---
  const getStatusConfig = (bot: BotListItem) => {
    if (!bot.active) {
      return { label: 'DISABLED', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' };
    }
    if (bot.isBusy) {
      return { label: 'IN USE', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    }
    if (bot.isBotCallAvailable && bot.isRobotOnline) {
      return { label: 'READY', color: 'bg-green-100 text-green-700', dot: 'bg-green-500 animate-pulse' };
    }
    if (bot.isBotCallAvailable || bot.isRobotOnline) {
      return { label: 'STARTING', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500 animate-bounce' };
    }
    return { label: 'OFFLINE', color: 'bg-gray-100 text-gray-400', dot: 'bg-gray-400' };
  };

  const getSignalUI = (rssi?: number) => {
    if (!rssi) return { color: 'text-gray-200', bars: 0, label: 'N/A' };
    if (rssi >= -60) return { color: 'text-green-500', bars: 4, label: 'Excellent' };
    if (rssi >= -70) return { color: 'text-lime-500', bars: 3, label: 'Good' };
    if (rssi >= -80) return { color: 'text-yellow-500', bars: 2, label: 'Fair' };
    return { color: 'text-red-500', bars: 1, label: 'Poor' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Device Manager</h1>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('my-bots')}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'my-bots' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            My Bots
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'redeem' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Gift size={16} />
            Redeem
          </button>
        </div>
      </div>

      {activeTab === 'my-bots' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => fetchBots(false)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Sync Status
            </button>
          </div>

          {isLoading && bots.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <RefreshCw className="animate-spin text-indigo-500 mb-4" size={40} />
              <p className="text-gray-400 font-medium">Scanning network...</p>
            </div>
          ) : bots.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 px-4">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bots linked</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-8">Redeem your unique device code to start controlling your robot.</p>
              <button onClick={() => setActiveTab('redeem')} className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                <Gift size={20} /> Redeem Bot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bots.map(bot => {
                const status = getStatusConfig(bot);
                const signal = getSignalUI(bot.rssi);
                const isBusy = bot.isBusy;
                const isLocked = status.label !== 'READY' || isBusy;

                const blockReason = status.label === 'DISABLED'
                  ? "Bot administratively disabled"
                  : isBusy ? "Bot is currently being controlled by another user" // Motivo de ocupação
                    : !bot.isBotCallAvailable ? "Waiting for Video Stream" : "Waiting for Hardware Signal";

                return (
                  <Link
                    key={bot.id}
                    to={status.label === 'READY' ? `/room/${bot.id}` : '#'}
                    className={`block group relative ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
                    onClick={(e) => isLocked && e.preventDefault()}
                  >
                    <div className={`bg-white p-6 rounded-[2rem] shadow-sm border-2 transition-all relative overflow-hidden flex flex-col h-full
                      ${!bot.active ? 'opacity-60 bg-gray-50 border-transparent cursor-not-allowed' : 'hover:shadow-xl hover:border-indigo-400 border-white'}
                    `}>

                      {isLocked && (
                        <div className="absolute inset-x-0 -top-2 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                          <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
                            <AlertCircle size={12} className="text-yellow-400" />
                            {blockReason}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl transition-all ${!bot.active ? 'bg-gray-200 text-gray-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                          <Bot size={32} />
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border-2 flex items-center gap-2 ${status.color}`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-gray-800 mb-1">{bot.name}</h3>
                      <p className="text-xs text-gray-400 font-mono mb-8 bg-gray-50 px-2 py-1 rounded-md inline-block self-start">
                        {bot.code}
                      </p>

                      {/* --- INDICADORES DE CONEXÃO INFERIORES --- */}
                      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex gap-5">
                          {/* Video Status: Agora fica vermelho (text-red-500) se offline */}
                          <div className="flex flex-col items-center gap-1.5" title="Camera Status">
                            {bot.isBotCallAvailable ?
                              <Video size={20} className="text-green-500" /> :
                              <VideoOff size={20} className="text-red-500" />
                            }
                            <span className="text-[9px] font-black text-gray-400 uppercase">Video</span>
                          </div>

                          {/* Hardware Signal: Agora fica vermelho (text-red-500) se offline */}
                          <div className="flex flex-col items-center gap-1.5" title="Hardware Connection">
                            {bot.isRobotOnline ?
                              <Wifi size={20} className={signal.color} /> :
                              <WifiOff size={20} className="text-red-500" />
                            }
                            <span className="text-[9px] font-black text-gray-400 uppercase">Signal</span>
                          </div>
                        </div>

                        {/* Visual Signal Bars */}
                        {bot.isRobotOnline && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-end gap-1 h-5">
                              {[1, 2, 3, 4].map(b => (
                                <div
                                  key={b}
                                  className={`w-1.5 rounded-full transition-all duration-500 ${b <= signal.bars ? signal.color.replace('text', 'bg') : 'bg-gray-100'}`}
                                  style={{ height: `${b * 25}%` }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'redeem' && (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-indigo-50/30">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                  <Gift size={32} />
                </div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">Redeem Bot</h2>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Link your robot kit to your global database account to start controlling it from anywhere.
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleRedeemBot}>
                <div className="mb-8">
                  <label htmlFor="code" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Unique Redeem Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    placeholder="EXPO-XXXX-XXXX"
                    className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all font-mono text-center uppercase tracking-widest text-xl font-bold bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRedeeming || !redeemCode}
                  className={`w-full py-5 rounded-2xl text-white font-black text-lg flex justify-center items-center gap-3 transition-all
                    ${isRedeeming || !redeemCode
                      ? 'bg-gray-200 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98]'
                    }`}
                >
                  {isRedeeming ? <RefreshCw className="animate-spin" /> : <CheckCircle size={24} />}
                  {isRedeeming ? 'VALIDATING...' : 'REDEEM DEVICE'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}