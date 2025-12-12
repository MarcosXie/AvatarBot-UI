import { Link } from 'react-router-dom';

export default function HomePublic() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-6">AvatarBot Control</h1>
      <p className="text-xl text-gray-400 mb-8">Gerencie seus robôs remotamente via AWS IoT</p>
      <div className="flex gap-4">
        <Link to="/login" className="px-6 py-3 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700">Entrar</Link>
        <Link to="/register" className="px-6 py-3 border border-white rounded-lg font-bold hover:bg-white hover:text-gray-900">Criar Conta</Link>
      </div>
    </div>
  );
}