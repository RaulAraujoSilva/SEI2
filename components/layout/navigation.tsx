"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, List, Settings, Bell, User, Menu, X, Home, FileSpreadsheet } from 'lucide-react'
import { UserMenu } from '@/components/user-menu'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    badge: null,
    description: 'Visão geral do sistema'
  },
  {
    title: 'Importar Processos',
    href: '/',
    icon: Upload,
    badge: null,
    description: 'Capturar novos processos SEI'
  },
  {
    title: 'Processos',
    href: '/processos',
    icon: List,
    badge: 42,
    description: 'Visualizar processos importados'
  },
  {
    title: 'Relatório Unificado',
    href: '/relatorio',
    icon: FileSpreadsheet,
    badge: null,
    description: 'Exportar dados em Excel'
  }
]

interface NavigationProps {
  children: React.ReactNode
}

export function Navigation({ children }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-pink-50 via-pastel-purple-50 to-pastel-blue-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-white/90 lg:backdrop-blur-sm lg:border-r lg:border-pastel-purple-200">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-pastel-purple-200">
          <FileText className="h-8 w-8 text-pastel-pink-400" />
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-800">SEI Manager</h1>
            <p className="text-xs text-gray-600">Sistema de Processos</p>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col p-4">
          <ul className="flex flex-1 flex-col gap-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-pastel-pink-100 to-pastel-purple-100 text-pastel-purple-700 shadow-sm border border-pastel-purple-200'
                        : 'text-gray-700 hover:bg-pastel-purple-50 hover:text-pastel-purple-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-pastel-purple-600' : 'text-gray-500 group-hover:text-pastel-purple-600'
                    }`} />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto bg-pastel-peach-100 text-pastel-peach-700 border-pastel-peach-200"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                  {isActive && (
                    <p className="mt-1 px-3 text-xs text-gray-500">
                      {item.description}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
          
          {/* User Section */}
          <div className="mt-6 pt-6 border-t border-pastel-purple-200">
            <div className="flex items-center justify-center px-3">
              <UserMenu />
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-pastel-purple-200 bg-white/90 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(true)}
          className="border-pastel-purple-300 text-pastel-purple-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-pastel-pink-400" />
          <h1 className="text-lg font-bold text-gray-800">SEI Manager</h1>
        </div>
        
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="border-pastel-peach-300 text-pastel-peach-700"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-sm px-6 pb-2">
                <div className="flex h-16 shrink-0 items-center border-b border-pastel-purple-200">
                  <FileText className="h-8 w-8 text-pastel-pink-400" />
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-gray-800">SEI Manager</h1>
                    <p className="text-xs text-gray-600">Sistema de Processos</p>
                  </div>
                </div>
                
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-2">
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? 'bg-gradient-to-r from-pastel-pink-100 to-pastel-purple-100 text-pastel-purple-700 shadow-sm border border-pastel-purple-200'
                                : 'text-gray-700 hover:bg-pastel-purple-50 hover:text-pastel-purple-700'
                            }`}
                          >
                            <Icon className={`h-5 w-5 shrink-0 ${
                              isActive ? 'text-pastel-purple-600' : 'text-gray-500 group-hover:text-pastel-purple-600'
                            }`} />
                            <span className="truncate">{item.title}</span>
                            {item.badge && (
                              <Badge 
                                variant="secondary" 
                                className="ml-auto bg-pastel-peach-100 text-pastel-peach-700 border-pastel-peach-200"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-72">
        {children}
      </main>
    </div>
  )
}
