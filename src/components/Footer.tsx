
import React from 'react';
import { Link } from 'react-router-dom';

const FooterColumn = ({ 
  title, 
  links 
}: { 
  title: string; 
  links: { label: string; href: string }[] 
}) => {
  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <Link to={link.href} className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between mb-16">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="text-primary font-bold text-xl">ProstyScreening.ai</Link>
            <p className="text-gray-600 text-sm max-w-xs mt-4">
              Automatyzacja rekrutacji z wykorzystaniem sztucznej inteligencji.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <FooterColumn 
              title="Produkt" 
              links={[
                { label: "Funkcje", href: "/oprogramowanie" },
                { label: "Cennik", href: "/cennik" },
                { label: "Webinary", href: "/webinary" },
                { label: "Integracje", href: "/integracje" },
              ]} 
            />
            
            <FooterColumn 
              title="Zasoby" 
              links={[
                { label: "Blog", href: "/blog" },
                { label: "Webinary", href: "/webinary" },
                { label: "Dokumentacja", href: "/dokumentacja" },
              ]} 
            />
            
            <FooterColumn 
              title="Firma" 
              links={[
                { label: "O nas", href: "/o-nas" },
                { label: "Kontakt", href: "/kontakt" },
                { label: "Kariera", href: "/kariera" },
              ]} 
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2023 ProstyScreening.ai. Wszelkie prawa zastrzeżone.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/polityka-prywatnosci" className="hover:text-gray-700 transition-colors duration-200">Polityka prywatności</Link>
            <Link to="/warunki-uzytkowania" className="hover:text-gray-700 transition-colors duration-200">Warunki użytkowania</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
