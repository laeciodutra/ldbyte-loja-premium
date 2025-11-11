"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { Home, Search, ShoppingCart, User } from "lucide-react";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        {children}
        
        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 md:hidden z-50">
          <div className="flex items-center justify-around h-16">
            <Link
              href="/"
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-purple-500 transition-colors"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              href="/produtos"
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-purple-500 transition-colors"
            >
              <Search className="w-6 h-6" />
              <span className="text-xs mt-1">Buscar</span>
            </Link>
            <Link
              href="/carrinho"
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-purple-500 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-xs mt-1">Carrinho</span>
            </Link>
            <Link
              href="/conta"
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-purple-500 transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Conta</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <footer className="bg-gray-950 text-white py-12 mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-purple-500">LDbyte</h3>
              <p className="text-gray-400">
                Tecnologia que move o Nordeste
              </p>
              <p className="text-sm text-gray-500">
                A música que você merece
              </p>
              <div className="flex justify-center space-x-4 pt-4">
                <a
                  href="https://instagram.com/ldbyte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                >
                  @ldbyte
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
