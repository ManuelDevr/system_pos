# Sistema POS — Ferretería CMA

Sistema de Punto de Venta (POS) y gestión de inventario de la Ferretería CMA. Gestiona la operación diaria: ventas en caja, inventario, clientes, compras, proveedores, notas de crédito, cotizaciones, reportes y facturación electrónica. Los productos se sincronizan automáticamente hacia la tienda web.

## 🛠️ Tecnologías

| Capa | Tecnologías |
|---|---|
| **Backend** | Laravel 12 · PHP 8.2 · PostgreSQL · Redis |
| **Frontend** | React 18 · Inertia.js · Vite · Tailwind CSS |
| **Servicios externos** | APISUNAT (facturación electrónica) · ApisPeru (consulta RUC/DNI) · Supabase Storage (imágenes de productos) |
| **Despliegue** | Docker + Dokploy (Nginx + PHP-FPM + Supervisor) |