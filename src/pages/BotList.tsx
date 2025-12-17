import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Battery, Wifi, RefreshCw, Gift, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { robotService } from '../services/robotService';
import type { BotListItem } from '../types';
import { toast } from 'react-toastify';

type TabType = 'my-bots' | 'redeem';

export default function BotList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('my-bots');
  const [bots, setBots] = useState<BotListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for Redeem
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    fetchBots();

    const intervalId = setInterval(() => {
      fetchBots(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  const fetchBots = async (isBackground = false) => {
    if (!user?.id) return;
    
    if (!isBackground) setIsLoading(true);
    
    try {
      const data = await robotService.getBotsByUserId(user.id);
      if (data) {
        setBots(data);
      }
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
      setActiveTab('my-bots'); // Switch back to list
      fetchBots(false); // Refresh list


    } catch (error) {
      toast.error("Failed to redeem bot. Check the code and try again.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const getStatusDisplay = (bot: BotListItem) => {
    if (!bot.active) {
      return {
        label: 'DISABLED',
        className: 'bg-red-100 text-red-600 border-red-200',
        dotColor: 'bg-red-500'
      };
    }
    if (bot.isBotCallAvailable) {
      return {
        label: 'ONLINE',
        className: 'bg-green-100 text-green-700 border-green-200',
        dotColor: 'bg-green-500 animate-pulse'
      };
    }
    return {
      label: 'OFFLINE',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
      dotColor: 'bg-gray-400'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Header and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Device Manager</h1>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('my-bots')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'my-bots' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Bots
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'redeem' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gift size={16} />
            Redeem Bot
          </button>
        </div>
      </div>

      {/* --- TAB: MY BOTS --- */}
      {activeTab === 'my-bots' && (
        <div>
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => fetchBots(false)}
              className="p-2 text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm"
              title="Refresh list"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh Status
            </button>
          </div>

          {isLoading && bots.length === 0 ? (
            <div className="text-center py-20">
              <RefreshCw className="animate-spin mx-auto text-indigo-500 mb-2" size={32} />
              <p className="text-gray-500">Loading devices...</p>
            </div>
          ) : bots.length === 0 ? (
            // EMPTY STATE WITH REDEEM PROMPT
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200 px-4">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bots found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                You haven't linked any robot to your account yet. If you have a Redeem Code, click below to add your first bot.
              </p>
              <button
                onClick={() => setActiveTab('redeem')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <Gift size={18} />
                Redeem your first Bot
              </button>
            </div>
          ) : (
            // BOT LIST GRID
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map(bot => {
                const status = getStatusDisplay(bot);
                return (
                  <Link key={bot.id} to={`/room/${bot.id}`} className="block group">
                    <div className={`bg-white p-6 rounded-xl shadow-sm border transition-all cursor-pointer relative overflow-hidden
                      ${!bot.active ? 'opacity-75 bg-gray-50' : 'hover:shadow-md hover:border-indigo-300 border-gray-200'}
                    `}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg transition-colors ${!bot.active ? 'bg-gray-200' : 'bg-indigo-50 group-hover:bg-indigo-100'}`}>
                          <Bot className={!bot.active ? 'text-gray-400' : 'text-indigo-600'} size={24} />
                        </div>
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
      )}

      {/* --- TAB: REDEEM BOT --- */}
      {activeTab === 'redeem' && (
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                  <Gift size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Redeem New Bot</h2>
              </div>
              <p className="text-sm text-gray-500 ml-11">
                Enter the unique code provided with your robot kit to link it to your account.
              </p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleRedeemBot}>
                <div className="mb-6">
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Redeem Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value)}
                    placeholder="Ex: BOT-12345-X"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-center uppercase tracking-wider text-lg"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isRedeeming || !redeemCode}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium flex justify-center items-center gap-2 transition-colors
                    ${isRedeeming || !redeemCode 
                      ? 'bg-indigo-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                >
                  {isRedeeming ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Linking Bot...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Redeem Code
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}