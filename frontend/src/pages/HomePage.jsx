import React from 'react';
import Banner from '../components/Banner';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import { products } from '../data/mock';
import { Truck, CreditCard, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  const dealProducts = products.filter(p => p.discount >= 20).slice(0, 6);
  const techProducts = products.filter(p => p.category === 'tecnologia').slice(0, 6);
  const recommendedProducts = products.slice(0, 12);

  return (
    <div>
      {/* Banner Carousel */}
      <Banner />

      {/* Benefits Bar */}
      <div className="bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Truck className="text-[#00A650]" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-800">Frete grátis</p>
                <p className="text-xs text-gray-500">A partir de R$ 79</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="text-[#3483FA]" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-800">Parcele em até 12x</p>
                <p className="text-xs text-gray-500">Sem juros no cartão</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#3483FA]" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-800">Compra segura</p>
                <p className="text-xs text-gray-500">Receba ou devolvemos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <CategoryGrid />

      {/* Deals Section */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Ofertas do dia</h2>
            <a href="/deals" className="text-[#3483FA] text-sm hover:underline">Ver todas</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {dealProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Mercado Pago Banner */}
      <section className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-[#00BCFF] to-[#00A8E8] rounded-lg p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Mercado Pago</h3>
              <p className="text-lg">Conta digital com rendimento maior que a poupança</p>
              <button className="mt-4 bg-white text-[#00BCFF] px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Conhecer
              </button>
            </div>
            <div className="mt-4 md:mt-0">
              <CreditCard size={80} className="opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Tecnologia</h2>
            <a href="/search?category=tecnologia" className="text-[#3483FA] text-sm hover:underline">Ver mais</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-[#FFE600] to-[#FFD000] rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#3483FA] text-white px-3 py-1 rounded-full text-sm font-semibold">Meli+</span>
                <span className="text-lg font-bold text-gray-800">Assine e tenha benefícios exclusivos</span>
              </div>
              <p className="text-gray-700">Disney+, Star+, Deezer Premium e frete grátis em milhares de produtos</p>
              <button className="mt-4 bg-[#3483FA] text-white px-6 py-2 rounded-sm font-medium hover:bg-[#2968c8] transition-colors">
                Assinar agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recomendados para você</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
