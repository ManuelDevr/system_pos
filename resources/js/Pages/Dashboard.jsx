import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import ReactECharts from 'echarts-for-react';
import { FaBolt } from 'react-icons/fa';
import {
  DollarSign, ShoppingCart, TrendingUp, Box, FileText,
  AlertTriangle, Send, CreditCard,
  CheckCircle, XCircle, Wallet, Landmark, Smartphone,
  Package, ShoppingBag, Calendar
} from 'lucide-react';

const StatCard = ({ icon: Icon, title, value }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, path, color }) => (
  <Link href={path} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-center transition-colors ${color.bg} hover:${color.hoverBg}`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.iconBg}`}>
      <Icon className={`w-6 h-6 ${color.icon}`} />
    </div>
    <p className="text-sm font-semibold text-slate-700">{label}</p>
  </Link>
);

const paymentIcons = {
  'Efectivo': Wallet,
  'Yape': Smartphone,
  'Tarjeta': CreditCard,
  'Transferencia': Landmark,
  'Credito': ShoppingBag,
};

const paymentColors = {
  'Efectivo': { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  'Yape': { bar: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
  'Tarjeta': { bar: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
  'Transferencia': { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
};

const defaultPaymentColor = { bar: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' };

const chartColors = ['#06b6d4', '#3b82f6', '#f97316', '#22c55e', '#ef4444', '#a855f7'];

export default function Dashboard({ stats }) {
  const { auth } = usePage().props;
  const user = auth.user;
  const isAdmin = user?.rol === 'Administrador';

  const statCards = isAdmin ? [
    { title: 'Ventas del Día', value: `S/ ${parseFloat(stats.ventasDelDia || 0).toFixed(2)}`, icon: DollarSign },
    { title: 'Número de Ventas', value: stats.numeroDeVentas || 0, icon: ShoppingCart },
    { title: 'Productos Vendidos', value: stats.productosVendidos || 0, icon: Box },
    { title: 'Ganancia Neta Est.', value: `S/ ${parseFloat(stats.gananciaNeta || 0).toFixed(2)}`, icon: TrendingUp },
  ] : [
    { title: 'Mis Ventas Hoy', value: `S/ ${parseFloat(stats.ventasDelDia || 0).toFixed(2)}`, icon: DollarSign },
    { title: 'Mis Ventas Realizadas', value: stats.numeroDeVentas || 0, icon: ShoppingCart },
    { title: 'Productos Vendidos', value: stats.productosVendidos || 0, icon: Box },
  ];

  const adminActions = [
    { label: 'Gestión Ventas', path: '/gestion-ventas', icon: FileText, color: { bg: 'bg-green-50', hoverBg: 'bg-green-100', iconBg: 'bg-green-100', icon: 'text-green-600' } },
  ];

  const cashierActions = [
    { label: 'Venta Rápida', path: '/venta-rapida', icon: FaBolt, color: { bg: 'bg-green-50', hoverBg: 'bg-green-100', iconBg: 'bg-green-100', icon: 'text-green-600' } },
    { label: 'Mis Ventas', path: '/mis-ventas', icon: FileText, color: { bg: 'bg-indigo-50', hoverBg: 'bg-indigo-100', iconBg: 'bg-indigo-100', icon: 'text-indigo-600' } },
  ];

  const quickActions = isAdmin ? adminActions : cashierActions;

  // --- Weekly Sales ---
  const weeklySalesData = {
    labels: stats.ventasSemanales?.map(d => new Date(d.dia + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })) || [],
    data: stats.ventasSemanales?.map(d => d.total) || [],
  };

  const salesChartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0];
        return `${data.name}<br/><strong>${data.seriesName}:</strong> S/ ${parseFloat(data.value).toFixed(2)}`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: weeklySalesData.labels,
      axisLine: { lineStyle: { color: '#d1d5db' } },
      axisLabel: { color: '#334155', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
      axisLabel: { color: '#334155', fontSize: 12, formatter: 'S/ {value}' },
      splitLine: { lineStyle: { color: '#e5e7eb' } },
      scale: true,
    },
    series: [{
      name: isAdmin ? 'Ventas' : 'Mis Ventas',
      type: 'bar',
      data: weeklySalesData.data,
      itemStyle: { color: '#4f46e5', borderRadius: [4, 4, 0, 0] },
      barWidth: '40%',
    }],
    backgroundColor: 'transparent',
  };

  // --- Top Products Bar Chart ---
  const topProducts = stats.topProductos || [];
  const barChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        return `<strong>${p.name}</strong><br/>Vendido: <strong>${p.value} und</strong>`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: topProducts.map(p => p.nombre.length > 18 ? p.nombre.substring(0, 16) + '...' : p.nombre),
      axisLine: { lineStyle: { color: '#d1d5db' } },
      axisLabel: { color: '#334155', fontSize: 11, fontWeight: 600, rotate: topProducts.length > 4 ? 25 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
      axisLabel: { color: '#334155', fontSize: 11 },
      splitLine: { lineStyle: { color: '#e5e7eb' } },
    },
    series: [{
      type: 'bar',
      data: topProducts.map((p, i) => ({
        value: p.cantidad,
        itemStyle: { color: chartColors[i % chartColors.length], borderRadius: [4, 4, 0, 0] },
      })),
      barWidth: '50%',
    }],
    backgroundColor: 'transparent',
  };

  // --- Payment Methods Progress ---
  const metodosPago = stats.metodosPago || [];
  const totalPagos = metodosPago.reduce((sum, m) => sum + m.value, 0);

  // --- Recent Sales ---
  const ventasRecientes = stats.ventasRecientes || [];

  // --- Top Clients ---
  const topClientes = stats.topClientes || [];

  // --- Critical Stock ---
  const productosCriticos = stats.productosStockCritico || [];

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hola, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-slate-500">
              {isAdmin ? 'Aquí tienes un resumen de la actividad de hoy.' : 'Resumen de tus ventas de hoy.'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          {statCards.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        {/* Weekly Sales Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">
            {isAdmin ? 'Ventas de la Semana' : 'Mis Ventas de la Semana'}
          </h3>
          <ReactECharts option={salesChartOption} style={{ height: 350 }} />
        </div>

        {/* Alertas Críticas */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertTriangle size={20} className="text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Productos por Agotarse</h3>
                  <p className="text-xs text-slate-500">Stock igual o menor al mínimo</p>
                </div>
              </div>
              <p className={`text-3xl font-black ${stats.alertas?.stockCritico > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {stats.alertas?.stockCritico ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {stats.alertas?.stockCritico > 0 ? 'Revisa el inventario' : 'Todo en orden'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Send size={20} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Comprobantes Pendientes</h3>
                  <p className="text-xs text-slate-500">Pendientes de envío a SUNAT</p>
                </div>
              </div>
              <p className={`text-3xl font-black ${stats.alertas?.comprobantesPendientes > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {stats.alertas?.comprobantesPendientes ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {stats.alertas?.comprobantesPendientes > 0 ? 'Requieren atención' : 'Al día'}
              </p>
            </div>
          </div>
        )}

        {/* NEW: Bar Chart + Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">Productos más vendidos</h3>
            {topProducts.length > 0 ? (
              <ReactECharts option={barChartOption} style={{ height: 300 }} />
            ) : (
              <p className="text-sm text-slate-400 text-center py-16">Sin ventas registradas</p>
            )}
          </div>

          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">Métodos de pago usados</h3>
            {metodosPago.length > 0 ? (
              <div className="space-y-5">
                {metodosPago.map((metodo, i) => {
                  const Icon = paymentIcons[metodo.name] || CreditCard;
                  const colors = paymentColors[metodo.name] || defaultPaymentColor;
                  const pct = totalPagos > 0 ? ((metodo.value / totalPagos) * 100) : 0;
                  return (
                    <div key={metodo.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                            <Icon size={16} className={colors.text} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{metodo.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">{metodo.value} ventas</span>
                          <span className={`text-sm font-bold ${colors.text}`}>{pct.toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-12">Sin datos de pagos</p>
            )}
          </div>
        </div>

        {/* NEW: Recent Sales Table */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 text-sm">Ventas Recientes</h3>
          {ventasRecientes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">COMPROBANTE</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">CLIENTE</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">TOTAL</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">FECHA</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">ESTADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ventasRecientes.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-sm font-bold text-slate-800">{v.nro_comprobante}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{v.codigo}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-slate-600">{v.cliente}</p>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span className="text-sm font-bold text-indigo-600">S/ {v.total.toFixed(2)}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-slate-400" />
                          <div>
                            <p className="text-sm text-slate-600">{v.fecha}</p>
                            <p className="text-[10px] text-slate-400">{v.hora}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        {v.estado === 'Pagado' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle size={10} /> Emitido
                          </span>
                        ) : v.estado === 'Anulado' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                            <XCircle size={10} /> Anulado
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500">{v.estado}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">Sin ventas recientes</p>
          )}
        </div>


        {/* NEW: Top Clients + Critical Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">Top 5 Clientes</h3>
            {topClientes.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">CLIENTE</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">COMPRAS</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topClientes.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                            {c.nombre.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{c.nombre}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-center text-sm font-medium text-slate-600">{c.compras}</td>
                      <td className="py-2.5 text-right text-sm font-bold text-indigo-600">S/ {c.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-400 text-center py-12">Sin datos de clientes</p>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">Productos con Stock Crítico</h3>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {productosCriticos.length > 0 ? productosCriticos.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-100">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 uppercase truncate">{p.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku}</p>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap">
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Package size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Todos los productos tienen stock suficiente</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Acciones Rápidas</h3>
          <div className={`grid grid-cols-2 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
            {quickActions.map(action => <QuickActionButton key={action.label} {...action} />)}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
