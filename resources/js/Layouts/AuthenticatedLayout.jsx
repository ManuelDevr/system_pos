import React, { useState, useEffect } from 'react';
import Sidebar from '@/Components/Sidebar';
import Header from '@/Components/Header';
import { Toaster } from 'react-hot-toast';

export default function AuthenticatedLayout({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [isSidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        if (saved !== null) return saved === 'true';
        return window.innerWidth > 1024;
    });

    const toggleSidebar = () => {
        setSidebarOpen(prev => {
            const next = !prev;
            if (!isMobile) localStorage.setItem('sidebarOpen', next);
            return next;
        });
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else {
                const saved = localStorage.getItem('sidebarOpen');
                setSidebarOpen(saved !== null ? saved === 'true' : true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-300">
            <Toaster position="top-right" />
            
            {/* Overlay para móviles cuando el sidebar está abierto */}
            {isMobile && isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                setOpen={setSidebarOpen} 
                isMobile={isMobile}
            />

            {/* Main Content Area */}
            <div 
                className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
                    !isMobile ? (isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]') : 'ml-0'
                }`}
            >
                {/* Header */}
                <Header toggleSidebar={toggleSidebar} />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="py-4 px-8 border-t border-slate-200 bg-white/50 text-center text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} Ferretería CMA - Sistema de Gestión
                </footer>
            </div>
        </div>
    );
}
