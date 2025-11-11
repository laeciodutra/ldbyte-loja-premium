"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { OrderWithItems } from "@/lib/types";

export default function OrderSuccessPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Pedido não encontrado</p>
            <Button asChild>
              <Link href="/">Voltar para Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Success Message */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-950 mb-2">
                Pedido Realizado com Sucesso!
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Obrigado pela sua compra, {order.customerName}!
              </p>
              <p className="text-sm text-gray-500">
                Enviamos um email de confirmação para{" "}
                <strong>{order.customerEmail}</strong>
              </p>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Número do Pedido</p>
                  <p className="font-mono font-semibold">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Data</p>
                  <p className="font-semibold">
                    {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {order.status === "PENDING" && "Pendente"}
                    {order.status === "PREPARING" && "Preparando"}
                    {order.status === "SHIPPED" && "Enviado"}
                    {order.status === "DELIVERED" && "Entregue"}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-bold text-xl text-purple-500">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Preparação do Pedido</p>
                  <p className="text-sm text-gray-600">
                    Estamos preparando seus produtos para envio
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Envio</p>
                  <p className="text-sm text-gray-600">
                    Você receberá um código de rastreamento por email
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Home className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Entrega</p>
                  <p className="text-sm text-gray-600">
                    Seu pedido será entregue no endereço cadastrado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-8">
            <Button size="lg" className="flex-1" asChild>
              <Link href="/">Voltar para Home</Link>
            </Button>
            <Button size="lg" variant="outline" className="flex-1" asChild>
              <Link href="/produtos">Continuar Comprando</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
