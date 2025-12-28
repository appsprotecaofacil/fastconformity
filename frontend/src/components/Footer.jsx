import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-8">
      {/* Main Footer */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Column 1 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Conheça-nos</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-[#3483FA]">Sobre o Mercado Livre</Link></li>
              <li><Link to="/" className="hover:text-[#3483FA]">Investor relations</Link></li>
              <li><Link to="/" className="hover:text-[#3483FA]">Tendências</Link></li>
              <li><Link to="/" className="hover:text-[#3483FA]">Sustentabilidade</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Ganhe dinheiro</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/" className="hover:text-[#3483FA]">Venda no Mercado Livre</Link></li>
              <li><Link to="/" className="hover:text-[#3483FA]">Mercado Livre Publicidade</Link></li>
              <li><Link to="/" className="hover:text-[#3483FA]">Soluções para empresas</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Pague com</h4>
            <div className="flex flex-wrap gap-2">
              <div className="bg-gray-100 px-2 py-1 rounded text-xs">Visa</div>
              <div className="bg-gray-100 px-2 py-1 rounded text-xs">Master</div>
              <div className="bg-gray-100 px-2 py-1 rounded text-xs">Elo</div>
              <div className="bg-gray-100 px-2 py-1 rounded text-xs">Pix</div>
              <div className="bg-gray-100 px-2 py-1 rounded text-xs">Boleto</div>
            </div>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Redes sociais</h4>
            <div className="flex gap-3">
              <a href="#" className="text-gray-500 hover:text-[#3483FA]">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#3483FA]">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#3483FA]">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-[#3483FA]">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Column 5 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Minha conta</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/login" className="hover:text-[#3483FA]">Entrar</Link></li>
              <li><Link to="/register" className="hover:text-[#3483FA]">Criar conta</Link></li>
              <li><Link to="/orders" className="hover:text-[#3483FA]">Minhas compras</Link></li>
            </ul>
          </div>

          {/* Column 6 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Baixe o app</h4>
            <div className="space-y-2">
              <a href="#" className="block bg-black text-white text-xs px-3 py-2 rounded text-center hover:bg-gray-800">
                Google Play
              </a>
              <a href="#" className="block bg-black text-white text-xs px-3 py-2 rounded text-center hover:bg-gray-800">
                App Store
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#EBEBEB] py-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/" className="hover:text-[#3483FA]">Trabalhe conosco</Link>
              <Link to="/" className="hover:text-[#3483FA]">Termos e condições</Link>
              <Link to="/" className="hover:text-[#3483FA]">Como cuidamos da sua privacidade</Link>
              <Link to="/" className="hover:text-[#3483FA]">Acessibilidade</Link>
              <Link to="/" className="hover:text-[#3483FA]">Contato</Link>
            </div>
            <div className="text-center md:text-right">
              <p>Copyright © 1999-2025 MercadoLivre.com.br LTDA.</p>
              <p>CNPJ: 03.007.331/0001-41 / Av. das Nações Unidas, São Paulo - SP</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
