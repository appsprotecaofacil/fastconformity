import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Eye, EyeOff, Check } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: 'São Paulo, SP'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
    return requirements;
  };

  const passwordReqs = validatePassword(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!Object.values(passwordReqs).every(Boolean)) {
      setError('A senha não atende aos requisitos');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: formData.location
      });
      navigate('/');
    } catch (error) {
      console.error('Register error:', error);
      setError(error.response?.data?.detail || 'Erro ao criar conta. Tente novamente.');
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

        <h1 className="text-2xl font-normal text-gray-800 mb-6 text-center">Criar conta</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nome completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
              placeholder="Digite seu nome"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent pr-12"
                placeholder="Crie uma senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className={`flex items-center gap-2 text-xs ${passwordReqs.length ? 'text-[#00A650]' : 'text-gray-400'}`}>
                  <Check size={14} />
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordReqs.uppercase ? 'text-[#00A650]' : 'text-gray-400'}`}>
                  <Check size={14} />
                  <span>Uma letra maiúscula</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordReqs.lowercase ? 'text-[#00A650]' : 'text-gray-400'}`}>
                  <Check size={14} />
                  <span>Uma letra minúscula</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${passwordReqs.number ? 'text-[#00A650]' : 'text-gray-400'}`}>
                  <Check size={14} />
                  <span>Um número</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirmar senha</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#3483FA] focus:border-transparent"
              placeholder="Confirme sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3483FA] text-white py-3 rounded font-medium hover:bg-[#2968c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Ao continuar, você concorda com os{' '}
          <Link to="/" className="text-[#3483FA] hover:underline">Termos e condições</Link>
          {' '}e a{' '}
          <Link to="/" className="text-[#3483FA] hover:underline">Política de privacidade</Link>
        </p>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-gray-600 mb-3">Já tem uma conta?</p>
          <Link 
            to="/login"
            className="inline-block w-full border border-[#3483FA] text-[#3483FA] py-3 rounded font-medium hover:bg-[#E8F4FD] transition-colors"
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
