import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Email inválido');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-300px)] flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-sm max-w-md w-full p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-2xl font-bold">
              <span className="text-[#3483FA]">Mercado</span>
              <span className="text-gray-800">Livre</span>
            </div>
          </Link>
        </div>

        <h1 className="text-2xl font-normal text-gray-800 mb-6 text-center">Entrar</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">E-mail</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent pr-12"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3483FA] text-white py-3 rounded font-medium hover:bg-[#2968c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-gray-600 mb-3">Ainda não tem uma conta?</p>
          <Link 
            to="/register"
            className="inline-block w-full border border-[#3483FA] text-[#3483FA] py-3 rounded font-medium hover:bg-[#E8F4FD] transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
