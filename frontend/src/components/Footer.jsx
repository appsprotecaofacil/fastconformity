import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { footerAPI } from '../services/api';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Music, Mail, Phone, MapPin, Clock, ChevronRight } from 'lucide-react';

// Paleta de cores FastConformity
const colors = {
  primary: '#1E3A5F',
  accent: '#FF6B35',
};

const socialIcons = {
  Facebook: Facebook,
  Instagram: Instagram,
  Twitter: Twitter,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  TikTok: Music,
};

// Payment method icons/badges
const PaymentIcon = ({ name }) => {
  const icons = {
    visa: (
      <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-bold text-blue-800">VISA</div>
    ),
    mastercard: (
      <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
        <div className="flex">
          <div className="w-3 h-3 bg-red-500 rounded-full -mr-1"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        </div>
      </div>
    ),
    pix: (
      <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-bold text-teal-600">PIX</div>
    ),
    boleto: (
      <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[8px] font-medium text-gray-700">Boleto</div>
    ),
    amex: (
      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-[8px] font-bold text-white">AMEX</div>
    ),
    elo: (
      <div className="w-10 h-6 bg-black rounded flex items-center justify-center text-[10px] font-bold text-yellow-400">ELO</div>
    ),
  };
  return icons[name?.toLowerCase()] || <div className="w-10 h-6 bg-gray-200 rounded"></div>;
};

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const data = await footerAPI.getData();
        setFooterData(data);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFooterData();
  }, []);

  // Use default values while loading
  const settings = footerData?.settings || {};
  const socialLinks = footerData?.socialLinks || [];
  const linkColumns = footerData?.linkColumns || [];
  const paymentMethods = footerData?.paymentMethods || [];
  const securityBadges = footerData?.securityBadges || [];

  // Process copyright text
  const copyrightText = (settings.copyright_text || '© {year} FastConformity. Todos os direitos reservados.')
    .replace('{year}', new Date().getFullYear());

  return (
    <footer style={{ backgroundColor: colors.primary }} className="text-white">
      {/* Main Footer Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            {settings.company_logo ? (
              <img src={settings.company_logo} alt={settings.company_name} className="h-8 mb-4" />
            ) : (
              <h2 className="text-2xl font-bold mb-4">
                <span className="text-white">{settings.company_name?.split(' ')[0] || 'Fast'}</span>
                <span style={{ color: colors.accent }}>{settings.company_name?.split(' ').slice(1).join(' ') || 'Conformity'}</span>
              </h2>
            )}
            
            {settings.company_description && (
              <p className="text-white/70 text-sm mb-6 max-w-sm">
                {settings.company_description}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="space-y-3">
              {settings.contact_phone && (
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Phone size={16} />
                  <span>{settings.contact_phone}</span>
                </div>
              )}
              {settings.contact_email && (
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Mail size={16} />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">
                    {settings.contact_email}
                  </a>
                </div>
              )}
              {settings.contact_address && (
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <MapPin size={16} />
                  <span>{settings.contact_address}</span>
                </div>
              )}
              {settings.contact_hours && (
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <Clock size={16} />
                  <span>{settings.contact_hours}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-6">
                {socialLinks.map(link => {
                  const Icon = socialIcons[link.platform] || Facebook;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Link Columns */}
          {linkColumns.map(column => (
            <div key={column.id}>
              <h3 className="font-semibold text-lg mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links?.map(link => (
                  <li key={link.id}>
                    {link.isExternal ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-1 group"
                      >
                        <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.url}
                        className="text-white/70 hover:text-white text-sm transition-colors flex items-center gap-1 group"
                      >
                        <ChevronRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods & Security */}
        {(paymentMethods.length > 0 || securityBadges.length > 0) && (
          <div className="border-t border-white/10 mt-10 pt-8">
            <div className="flex flex-wrap justify-between items-center gap-6">
              {/* Payment Methods */}
              {settings.payment_methods_enabled !== 'false' && paymentMethods.length > 0 && (
                <div>
                  <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Formas de Pagamento</p>
                  <div className="flex gap-2">
                    {paymentMethods.map(method => (
                      <PaymentIcon key={method.id} name={method.icon} />
                    ))}
                  </div>
                </div>
              )}

              {/* Security Badges */}
              {settings.security_badges_enabled !== 'false' && securityBadges.length > 0 && (
                <div>
                  <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Segurança</p>
                  <div className="flex gap-3">
                    {securityBadges.map(badge => (
                      badge.linkUrl ? (
                        <a key={badge.id} href={badge.linkUrl} target="_blank" rel="noopener noreferrer">
                          {badge.imageUrl ? (
                            <img src={badge.imageUrl} alt={badge.name} className="h-10 object-contain" />
                          ) : (
                            <div className="px-3 py-1 bg-white/10 rounded text-xs">{badge.name}</div>
                          )}
                        </a>
                      ) : (
                        <div key={badge.id}>
                          {badge.imageUrl ? (
                            <img src={badge.imageUrl} alt={badge.name} className="h-10 object-contain" />
                          ) : (
                            <div className="px-3 py-1 bg-white/10 rounded text-xs">{badge.name}</div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* App Download */}
              {settings.apps_enabled === 'true' && (settings.app_ios_url || settings.app_android_url) && (
                <div>
                  <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Baixe nosso App</p>
                  <div className="flex gap-2">
                    {settings.app_ios_url && (
                      <a href={settings.app_ios_url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs flex items-center gap-2 hover:bg-white/20 transition-colors">
                          <span>App Store</span>
                        </div>
                      </a>
                    )}
                    {settings.app_android_url && (
                      <a href={settings.app_android_url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs flex items-center gap-2 hover:bg-white/20 transition-colors">
                          <span>Google Play</span>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              {copyrightText}
            </p>
            {settings.company_cnpj && (
              <p className="text-white/40 text-xs">
                CNPJ: {settings.company_cnpj}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
