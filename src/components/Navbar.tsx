
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-primary font-bold text-xl">ProstyScreening.ai</Link>
        </div>
        
        <div className="hidden md:flex space-x-8 text-sm text-gray-600">
          <Link to="/o-nas" className="hover:text-gray-900 transition-colors duration-200">O nas</Link>
          <Link to="/przyklady" className="hover:text-gray-900 transition-colors duration-200">Przykłady</Link>
          <Link to="/oprogramowanie" className="hover:text-gray-900 transition-colors duration-200">Oprogramowanie</Link>
          <Link to="/kontakt" className="hover:text-gray-900 transition-colors duration-200">Kontakt</Link>
        </div>
        
        <div className="flex space-x-3">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
