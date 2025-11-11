"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@prisma/client";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((res) => res.json())
      .then((data) => {
        setFeaturedProducts(data.slice(0, 6));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-950 via-purple-900 to-gray-950 text-white py-20 px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto text-center space-y-6 relative z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Som de verdade,
            <br />
            <span className="text-purple-400">feito no Nordeste</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Fones de ouvido e gadgets premium com tecnologia que move o Nordeste
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" asChild>
              <Link href="/produtos">
                Ver Produtos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white hover:text-gray-950">
              <Link href="/sobre">Conheça a LDbyte</Link>
            </Button>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950 mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-gray-600 text-lg">
              Descubra nossa seleção premium de fones e gadgets
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-xl transition-shadow duration-300">
                    <Link href={`/produtos/${product.slug}`}>
                      <div className="aspect-square relative overflow-hidden bg-gray-100">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingCart className="w-16 h-16" />
                          </div>
                        )}
                        {product.featured && (
                          <span className="absolute top-4 right-4 bg-blue-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Novo
                          </span>
                        )}
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/produtos/${product.slug}`}>
                        <h3 className="font-semibold text-lg text-gray-950 mb-2 group-hover:text-purple-500 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-2xl font-bold text-purple-500 mb-4">
                        {formatPrice(product.price)}
                      </p>
                      <Button className="w-full" size="lg">
                        <ShoppingCart className="mr-2 w-5 h-5" />
                        Adicionar ao Carrinho
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhum produto em destaque no momento
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/produtos">
                Ver Todos os Produtos
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-500 to-blue-400 text-white py-16 px-4">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Pronto para elevar sua experiência sonora?
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Explore nossa coleção completa de produtos premium
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/produtos">
              Começar a Comprar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
