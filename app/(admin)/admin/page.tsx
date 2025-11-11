"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Order, Product } from "@prisma/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalProducts: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await fetch("/api/orders");
      const orders: Order[] = await ordersResponse.json();

      // Fetch products
      const productsResponse = await fetch("/api/products");
      const products: Product[] = await productsResponse.json();

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(
        (order) => new Date(order.createdAt) >= today
      );
      const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);

      const pendingOrders = orders.filter(
        (order) => order.status === "PENDING"
      ).length;

      const lowStockProducts = products.filter(
        (product) => product.stock < 5 && product.stock > 0
      ).length;

      setStats({
        todaySales,
        pendingOrders,
        lowStockProducts,
        totalProducts: products.length,
      });

      // Generate sales data for last 7 days
      const salesByDay: { [key: string]: number } = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      last7Days.forEach((date) => {
        const dateStr = date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        salesByDay[dateStr] = 0;
      });

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const dateStr = orderDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        if (salesByDay[dateStr] !== undefined) {
          salesByDay[dateStr] += order.total;
        }
      });

      const chartData = Object.entries(salesByDay).map(([date, total]) => ({
        date,
        vendas: total,
      }));

      setSalesData(chartData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vendas Hoje
            </CardTitle>
            <DollarSign className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-950">
              {formatPrice(stats.todaySales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pedidos Pendentes
            </CardTitle>
            <ShoppingBag className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-950">
              {stats.pendingOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Estoque Baixo
            </CardTitle>
            <Package className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-950">
              {stats.lowStockProducts}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Produtos com menos de 5 unidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Produtos
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-950">
              {stats.totalProducts}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatPrice(value)}
              />
              <Legend />
              <Bar dataKey="vendas" fill="#8b5cf6" name="Vendas (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
