import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const Footer = () => {
  return (
    <footer className="mt-8">
      {/* Main Footer */}
      <div style={{ backgroundColor: colors.primary }}>
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Logo & Description */}
            <div className="col-span-2 md:col-span-1 lg:col-span-1">
              <div className="text-2xl font-bold text-white mb-4">
                Fast<span style={{ color: colors.accent }}>Conformity</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Sua loja online de confiança. Produtos de qualidade com os melhores preços e entrega rápida.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                  <Twitter size={18} />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                  <Youtube size={18} />
                </a>
              </div>
            </div>

            {/* Institucional */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Institucional</h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><Link to="/" className="hover:text-white transition-colors">Sobre nós</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Política de privacidade</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Termos de uso</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Trabalhe conosco</Link></li>
              </ul>
            </div>

            {/* Ajuda */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Ajuda</h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><Link to="/" className="hover:text-white transition-colors">Central de ajuda</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Como comprar</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Formas de pagamento</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Trocas e devoluções</Link></li>
              </ul>
            </div>

            {/* Minha Conta */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Minha Conta</h4>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li><Link to="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Criar conta</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">Meus pedidos</Link></li>
                <li><Link to="/favorites" className="hover:text-white transition-colors">Favoritos</Link></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contato</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Phone size={16} style={{ color: colors.accent }} />
                  <span>(11) 9999-9999</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} style={{ color: colors.accent }} />
                  <span>contato@fastconformity.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} style={{ color: colors.accent }} className="flex-shrink-0 mt-0.5" />
                  <span>São Paulo - SP, Brasil</span>
                </li>
              </ul>
              
              {/* Payment Methods */}
              <h4 className="text-sm font-semibold text-white mt-6 mb-3">Formas de pagamento</h4>
              <div className="flex flex-wrap gap-2">
                <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white/70">Visa</div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white/70">Master</div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white/70">Pix</div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white/70">Boleto</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#152D4A] py-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50">
            <p>© 2025 FastConformity. Todos os direitos reservados.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/" className="hover:text-white/80 transition-colors">Termos</Link>
              <Link to="/" className="hover:text-white/80 transition-colors">Privacidade</Link>
              <Link to="/" className="hover:text-white/80 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
