import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RobotControl from '../components/RobotControl';
import VideoCall from '../components/VideoCall';
import { ArrowLeft, RefreshCw, Loader2, VideoOff } from 'lucide-react';
import { ChatProvider } from '../context/chatContext';
import { robotService } from '../services/robotService';
import type { BotResponse } from '../types';

export default function BotRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bot, setBot] = useState<BotResponse | undefined>(undefined);
  const [error, setError] = useState('');

  // Function to fetch room status
  const checkRoomStatus = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError('');

    try {
      const bot = await robotService.getById(id);
      setBot(bot)

      if (bot && bot.roomUrl) {
        setRoomUrl(bot.roomUrl);
      } else {
        setRoomUrl(null);
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching robot data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on page load
  useEffect(() => {
    checkRoomStatus();
    
    const intervalId = setInterval(() => {
      checkRoomStatus();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [bot?.awsThingName]);

  // --- STATE 1: LOADING ---
  if (isLoading && !roomUrl) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white flex-col gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p>Checking status of {bot?.code}...</p>
      </div>
    );
  }

  // --- STATE 2: ROOM NOT STARTED (ROBOT VIDEO OFFLINE) ---
  if (!roomUrl) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <VideoOff className="text-gray-400" size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Unavailable</h2>
          <p className="text-gray-500 mb-8">
            The robot <strong>{bot?.code}</strong> has not started the video stream yet.
            Please ask someone to start the app on the robot.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={checkRoomStatus} 
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
            >
              <RefreshCw size={20} /> Check Again
            </button>
            
            <button 
              onClick={() => navigate(-1)} // -1 volta exatamente para a página anterior no histórico
              className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} /> Back to Previous Page
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  // --- STATE 3: ACTIVE ROOM (FULL INTERFACE) ---
  return (
    <ChatProvider>
      <div className="flex flex-col lg:flex-row h-screen w-screen bg-gray-100 overflow-hidden">
        
        {/* Video Panel */}
        <div className="flex-1 bg-black relative min-h-[40vh]">
          {/* Floating Video Header */}
          <div className="absolute top-4 left-4 z-50 flex gap-2">
             <button 
               onClick={() => navigate(-1)} 
               className="bg-gray-800/80 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2 backdrop-blur-sm transition-all"
             >
               <ArrowLeft size={14} /> Back
             </button>
          </div>

          {/* Daily.co Component */}
          <VideoCall 
            roomUrl={roomUrl} 
            onLeave={() => {
              // If leaving call, go back to list or clear URL
              setRoomUrl(null); 
            }} 
          />
        </div>

        {/* Control Panel (Right) */}
        <div className="w-full h-[50vh] lg:w-[550px] lg:h-full border-t lg:border-t-0 lg:border-l border-gray-300 shadow-xl z-10">
          <RobotControl 
            thingCode={bot?.awsThingName} 
            roomUrl={roomUrl} // We pass the URL to the control to display if necessary
          />
        </div>
        
      </div>
    </ChatProvider>
  );
}