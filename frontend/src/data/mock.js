// Mock data for Mercado Livre Clone

export const categories = [
  { id: 1, name: 'Tecnologia', icon: 'Smartphone', slug: 'tecnologia' },
  { id: 2, name: 'Eletrodomésticos', icon: 'Refrigerator', slug: 'eletrodomesticos' },
  { id: 3, name: 'Moda', icon: 'Shirt', slug: 'moda' },
  { id: 4, name: 'Casa e Decoração', icon: 'Home', slug: 'casa-decoracao' },
  { id: 5, name: 'Esportes', icon: 'Dumbbell', slug: 'esportes' },
  { id: 6, name: 'Veículos', icon: 'Car', slug: 'veiculos' },
  { id: 7, name: 'Supermercado', icon: 'ShoppingCart', slug: 'supermercado' },
  { id: 8, name: 'Beleza', icon: 'Sparkles', slug: 'beleza' },
  { id: 9, name: 'Brinquedos', icon: 'Gamepad2', slug: 'brinquedos' },
  { id: 10, name: 'Ferramentas', icon: 'Wrench', slug: 'ferramentas' },
  { id: 11, name: 'Livros', icon: 'BookOpen', slug: 'livros' },
  { id: 12, name: 'Saúde', icon: 'Heart', slug: 'saude' }
];

export const banners = [
  {
    id: 1,
    title: 'Ofertas do Dia',
    subtitle: 'Até 60% OFF em milhares de produtos',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    bgColor: '#FFE600'
  },
  {
    id: 2,
    title: 'Tecnologia',
    subtitle: 'Os melhores smartphones com até 12x sem juros',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=400&fit=crop',
    bgColor: '#3483FA'
  },
  {
    id: 3,
    title: 'Frete Grátis',
    subtitle: 'Em milhares de produtos para todo Brasil',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=400&fit=crop',
    bgColor: '#00A650'
  }
];

export const products = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max 256GB - Titânio Natural',
    price: 8999.00,
    originalPrice: 10499.00,
    discount: 14,
    installments: 12,
    installmentPrice: 749.92,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.8,
    reviews: 1250,
    sold: 5000,
    category: 'tecnologia',
    condition: 'novo',
    brand: 'Apple',
    stock: 15,
    seller: { name: 'TechStore Oficial', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'iPhone 15 Pro Max com chip A17 Pro, câmera de 48MP e tela Super Retina XDR de 6.7 polegadas.',
    specs: [
      { label: 'Marca', value: 'Apple' },
      { label: 'Modelo', value: 'iPhone 15 Pro Max' },
      { label: 'Armazenamento', value: '256GB' },
      { label: 'RAM', value: '8GB' },
      { label: 'Tela', value: '6.7 polegadas' }
    ]
  },
  {
    id: 2,
    title: 'Smart TV Samsung 55" 4K Crystal UHD',
    price: 2399.00,
    originalPrice: 3299.00,
    discount: 27,
    installments: 10,
    installmentPrice: 239.90,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.6,
    reviews: 890,
    sold: 3200,
    category: 'tecnologia',
    condition: 'novo',
    brand: 'Samsung',
    stock: 25,
    seller: { name: 'Samsung Store', reputation: 'MercadoLíder Gold', location: 'São Paulo' },
    description: 'Smart TV com resolução 4K, processador Crystal 4K e sistema Tizen.',
    specs: [
      { label: 'Marca', value: 'Samsung' },
      { label: 'Tamanho', value: '55 polegadas' },
      { label: 'Resolução', value: '4K UHD' },
      { label: 'Sistema', value: 'Tizen' }
    ]
  },
  {
    id: 3,
    title: 'Notebook Gamer Acer Nitro 5 i5 RTX 3050',
    price: 4299.00,
    originalPrice: 5499.00,
    discount: 22,
    installments: 12,
    installmentPrice: 358.25,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.7,
    reviews: 456,
    sold: 1800,
    category: 'tecnologia',
    condition: 'novo',
    brand: 'Acer',
    stock: 8,
    seller: { name: 'Acer Brasil', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'Notebook gamer com Intel Core i5, placa de vídeo NVIDIA RTX 3050 e 16GB de RAM.',
    specs: [
      { label: 'Processador', value: 'Intel Core i5-12450H' },
      { label: 'Placa de Vídeo', value: 'NVIDIA RTX 3050' },
      { label: 'RAM', value: '16GB' },
      { label: 'SSD', value: '512GB' }
    ]
  },
  {
    id: 4,
    title: 'Tênis Nike Air Max 90 Masculino',
    price: 599.90,
    originalPrice: 799.90,
    discount: 25,
    installments: 6,
    installmentPrice: 99.98,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.9,
    reviews: 2100,
    sold: 8500,
    category: 'moda',
    condition: 'novo',
    brand: 'Nike',
    stock: 50,
    seller: { name: 'Nike Store', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'Tênis Nike Air Max 90 com amortecimento Air e design clássico.',
    specs: [
      { label: 'Marca', value: 'Nike' },
      { label: 'Modelo', value: 'Air Max 90' },
      { label: 'Material', value: 'Couro e tecido' }
    ]
  },
  {
    id: 5,
    title: 'Geladeira Brastemp Frost Free 375L Inox',
    price: 3199.00,
    originalPrice: 4199.00,
    discount: 24,
    installments: 12,
    installmentPrice: 266.58,
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.5,
    reviews: 678,
    sold: 2100,
    category: 'eletrodomesticos',
    condition: 'novo',
    brand: 'Brastemp',
    stock: 12,
    seller: { name: 'Brastemp Oficial', reputation: 'MercadoLíder Gold', location: 'São Paulo' },
    description: 'Geladeira Frost Free com 375 litros, painel eletrônico e acabamento em inox.',
    specs: [
      { label: 'Capacidade', value: '375 litros' },
      { label: 'Tipo', value: 'Frost Free' },
      { label: 'Cor', value: 'Inox' }
    ]
  },
  {
    id: 6,
    title: 'PlayStation 5 Standard Edition',
    price: 4299.00,
    originalPrice: 4999.00,
    discount: 14,
    installments: 12,
    installmentPrice: 358.25,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.9,
    reviews: 3200,
    sold: 12000,
    category: 'brinquedos',
    condition: 'novo',
    brand: 'Sony',
    stock: 5,
    seller: { name: 'PlayStation Store', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'Console PlayStation 5 com SSD ultra-rápido, ray tracing e controle DualSense.',
    specs: [
      { label: 'Marca', value: 'Sony' },
      { label: 'Modelo', value: 'PlayStation 5' },
      { label: 'SSD', value: '825GB' }
    ]
  },
  {
    id: 7,
    title: 'Bicicleta Caloi Elite Carbon Racing',
    price: 12999.00,
    originalPrice: 15999.00,
    discount: 19,
    installments: 12,
    installmentPrice: 1083.25,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.7,
    reviews: 89,
    sold: 250,
    category: 'esportes',
    condition: 'novo',
    brand: 'Caloi',
    stock: 3,
    seller: { name: 'Caloi Store', reputation: 'MercadoLíder Gold', location: 'São Paulo' },
    description: 'Bicicleta de carbono para ciclismo profissional com grupo Shimano 105.',
    specs: [
      { label: 'Marca', value: 'Caloi' },
      { label: 'Material', value: 'Carbono' },
      { label: 'Grupo', value: 'Shimano 105' }
    ]
  },
  {
    id: 8,
    title: 'Cafeteira Nespresso Vertuo Next',
    price: 699.00,
    originalPrice: 899.00,
    discount: 22,
    installments: 6,
    installmentPrice: 116.50,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.6,
    reviews: 567,
    sold: 2300,
    category: 'eletrodomesticos',
    condition: 'novo',
    brand: 'Nespresso',
    stock: 20,
    seller: { name: 'Nespresso Brasil', reputation: 'MercadoLíder Gold', location: 'São Paulo' },
    description: 'Cafeteira automática com tecnologia Centrifusion para café expresso perfeito.',
    specs: [
      { label: 'Marca', value: 'Nespresso' },
      { label: 'Modelo', value: 'Vertuo Next' },
      { label: 'Pressão', value: '19 bar' }
    ]
  },
  {
    id: 9,
    title: 'Relógio Apple Watch Series 9 45mm GPS',
    price: 3999.00,
    originalPrice: 4599.00,
    discount: 13,
    installments: 12,
    installmentPrice: 333.25,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.8,
    reviews: 890,
    sold: 4500,
    category: 'tecnologia',
    condition: 'novo',
    brand: 'Apple',
    stock: 18,
    seller: { name: 'Apple Store', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'Apple Watch com chip S9, tela Retina always-on e monitoramento de saúde.',
    specs: [
      { label: 'Marca', value: 'Apple' },
      { label: 'Modelo', value: 'Series 9' },
      { label: 'Tamanho', value: '45mm' }
    ]
  },
  {
    id: 10,
    title: 'Ar Condicionado Split LG Dual Inverter 12000 BTUs',
    price: 2199.00,
    originalPrice: 2899.00,
    discount: 24,
    installments: 12,
    installmentPrice: 183.25,
    image: 'https://images.unsplash.com/photo-1631545806609-1d5c6e54d5f8?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1631545806609-1d5c6e54d5f8?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.7,
    reviews: 1200,
    sold: 5600,
    category: 'eletrodomesticos',
    condition: 'novo',
    brand: 'LG',
    stock: 30,
    seller: { name: 'LG Brasil', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'Ar condicionado com tecnologia Dual Inverter, economia de energia e controle por app.',
    specs: [
      { label: 'Marca', value: 'LG' },
      { label: 'Capacidade', value: '12000 BTUs' },
      { label: 'Tecnologia', value: 'Dual Inverter' }
    ]
  },
  {
    id: 11,
    title: 'Kindle Paperwhite 16GB 6.8" Preto',
    price: 549.00,
    originalPrice: 649.00,
    discount: 15,
    installments: 6,
    installmentPrice: 91.50,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.9,
    reviews: 3400,
    sold: 15000,
    category: 'livros',
    condition: 'novo',
    brand: 'Amazon',
    stock: 45,
    seller: { name: 'Amazon Brasil', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'E-reader com tela de 6.8", luz ajustável e bateria de longa duração.',
    specs: [
      { label: 'Marca', value: 'Amazon' },
      { label: 'Modelo', value: 'Paperwhite' },
      { label: 'Armazenamento', value: '16GB' }
    ]
  },
  {
    id: 12,
    title: 'Fone de Ouvido Sony WH-1000XM5 Bluetooth',
    price: 2299.00,
    originalPrice: 2799.00,
    discount: 18,
    installments: 10,
    installmentPrice: 229.90,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop'
    ],
    freeShipping: true,
    rating: 4.8,
    reviews: 780,
    sold: 3200,
    category: 'tecnologia',
    condition: 'novo',
    brand: 'Sony',
    stock: 22,
    seller: { name: 'Sony Store', reputation: 'MercadoLíder Platinum', location: 'São Paulo' },
    description: 'Fone over-ear com cancelamento de ruído líder do mercado e 30h de bateria.',
    specs: [
      { label: 'Marca', value: 'Sony' },
      { label: 'Modelo', value: 'WH-1000XM5' },
      { label: 'Tipo', value: 'Over-ear' }
    ]
  }
];

export const mockReviews = [
  { id: 1, productId: 1, user: 'João S.', rating: 5, comment: 'Produto excelente! Chegou antes do prazo.', date: '2025-07-10' },
  { id: 2, productId: 1, user: 'Maria L.', rating: 4, comment: 'Muito bom, só achei o preço um pouco alto.', date: '2025-07-08' },
  { id: 3, productId: 1, user: 'Pedro M.', rating: 5, comment: 'Melhor celular que já tive!', date: '2025-07-05' },
  { id: 4, productId: 2, user: 'Ana C.', rating: 5, comment: 'Imagem incrível, super recomendo!', date: '2025-07-09' },
  { id: 5, productId: 2, user: 'Carlos R.', rating: 4, comment: 'Ótima TV, som poderia ser melhor.', date: '2025-07-07' }
];

export const mockUser = {
  id: 1,
  name: 'Usuário Teste',
  email: 'teste@email.com',
  location: 'São Paulo, SP'
};

export const conditions = [
  { value: 'novo', label: 'Novo' },
  { value: 'usado', label: 'Usado' }
];

export const brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Acer', 'Brastemp', 'Amazon', 'Nespresso', 'Caloi'];
