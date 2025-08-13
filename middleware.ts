import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Callback opcional para lógica adicional
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Rotas públicas que não precisam de autenticação
        const publicPaths = ['/login', '/api/auth']
        const path = req.nextUrl.pathname
        
        // Permitir acesso a rotas públicas
        if (publicPaths.some(p => path.startsWith(p))) {
          return true
        }
        
        // Verificar se o usuário está autenticado
        return !!token
      }
    },
    pages: {
      signIn: '/login'
    }
  }
)

// Configurar quais rotas o middleware deve proteger
export const config = {
  matcher: [
    // Proteger todas as rotas exceto:
    // - api/auth (endpoints do NextAuth)
    // - _next/static (arquivos estáticos)
    // - _next/image (otimização de imagens)
    // - favicon.ico, sitemap.xml, robots.txt
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ]
}