
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isRestrictedRoute = ['/onboarding', '/login', '/signup', '/verification'].some(
    route => location.pathname.startsWith(route)
  );

  return (
    <nav className="border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-primary font-bold text-xl">ProstyScreening.ai</Link>
        </div>
        
        {!isRestrictedRoute && (
          <div className="hidden md:flex space-x-8 text-sm text-gray-600">
            <Link to="/o-nas" className="hover:text-gray-900 transition-colors duration-200">O nas</Link>
            <Link to="/przyklady" className="hover:text-gray-900 transition-colors duration-200">Przykłady</Link>
            <Link to="/oprogramowanie" className="hover:text-gray-900 transition-colors duration-200">Oprogramowanie</Link>
            <Link to="/kontakt" className="hover:text-gray-900 transition-colors duration-200">Kontakt</Link>
          </div>
        )}
        
        <div className="flex space-x-3">
          {isRestrictedRoute ? (
            <Link to="/">
              <Button variant="outline" className="flex items-center">
                <Home className="h-4 w-4 mr-2" /> 
                Wróć do strony głównej
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="text-primary border-primary hover:bg-primary-50 transition-colors duration-300 font-semibold">
                  Zaloguj się
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary-700 transition-colors duration-300 font-semibold">
                  Zarejestruj się
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
