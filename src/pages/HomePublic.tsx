import { Link } from 'react-router-dom';
import { Bot, Zap } from 'lucide-react';

interface HomePublicProps {
  isDemo?: boolean;
  isExpoApp?: boolean;
}

export default function HomePublic({ isDemo = false, isExpoApp = false}: HomePublicProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex flex-col items-center justify-center text-white px-4">
      
      {/* Icon / Brand Mark */}
      <div className="mb-8 p-4 bg-gray-800/50 rounded-full border border-gray-700 shadow-2xl shadow-indigo-500/20 animate-in fade-in zoom-in duration-700">
        <Bot size={64} className="text-indigo-400" />
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-center tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          ExpoBot Control {(isDemo) && (isExpoApp ? <span className="text-indigo-400">(Demo ExpoApp)</span> : <span className="text-indigo-400">(Demo)</span>)}
        </span>
      </h1>

      <p className="text-xl text-gray-400 mb-10 text-center max-w-2xl leading-relaxed">
        Seamless telepresence. Absolute control. <br className="hidden md:block" />
        Manage your robotic fleet in real-time with the power and security of 
        <span className="text-indigo-400 font-semibold mx-1">ExpoBot</span>.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link 
            to="/login" 
            className="px-10 py-4 bg-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 text-center flex items-center justify-center gap-2"
          >
            <Zap size={20} />
            Get Started
          </Link>


        {/* RENDERIZAÇÃO CONDICIONAL: Só mostra o Registro se NÃO for demo */}
        {/* {isExpoApp && (
          <Link 
            to="/register" 
            className="px-8 py-4 border border-gray-600 bg-gray-800/30 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all flex items-center justify-center gap-2"
          >
            <Zap size={20} />
            Get Started
          </Link>
        )} */}
      </div>

      <div className="mt-16 text-sm text-gray-600 font-medium tracking-widest uppercase">
        Powered by High-Performance Cloud Architecture
      </div>
    </div>
  );
}