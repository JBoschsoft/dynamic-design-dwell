
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl font-bold mb-8">Blog</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
                <img 
                  src={`https://picsum.photos/600/300?random=${item}`} 
                  alt="Blog post" 
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2">12 maja 2023</div>
                  <h3 className="text-xl font-bold mb-2">Jak AI rewolucjonizuje proces rekrutacji</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies tincidunt, 
                    nunc nisl aliquam nisl, eget ultricies nunc nisl eget nisl.
                  </p>
                  <a href="#" className="text-primary font-semibold hover:underline">Czytaj więcej</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
