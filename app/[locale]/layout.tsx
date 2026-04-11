// app/layout.tsx
import { Playfair_Display, Lato } from 'next/font/google'
import '../globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ThemeProvider } from 'next-themes'
import dynamic from 'next/dynamic'
import { AuthProvider } from '@/contexts/AuthContext'
import SmoothScroll from '../components/SmoothScroll'
import Navbar from '../components/Navbar'
import CapacitorInitWrapper from '../capacitor/CapacitorInitWrapper'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { cookies } from 'next/headers'
import { currentUser } from '@clerk/nextjs/server'
import OfflineBanner from '../components/OfflineBanner'
import { jwtVerify } from 'jose'
import { connectToDatabase } from '@/database/db'
import { ObjectId } from 'mongodb'

const SplashScreen = dynamic(() => import('../components/SplashScreen'))

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://gevabal.mn'),
  title: 'Gevabal - Spiritual Guidance',
  description: 'Book spiritual consultations with experienced monks',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  alternates: {
    canonical: './',
    languages: {
      'en': '/en',
      'mn': '/mn',
    },
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const validLocale = (['mn', 'en'].includes(locale) ? locale : 'mn') as any;

  let serverUser = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const JWT_SECRET = process.env.JWT_SECRET;
    // Run DB connection, JWT decode, and Clerk fetch in PARALLEL with 3s timeout
    const [{ value: dbConn }, jwtResult, clerkResult] = await Promise.allSettled([
      connectToDatabase(),
      // JWT path
      (async () => {
        if (!token || !JWT_SECRET) return null;
        try {
          const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
          if (!payload.sub) return null;
          const { db } = await connectToDatabase();
          return await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });
        } catch { return null; }
      })(),
      // Clerk path (with timeout)
      Promise.race([
        currentUser(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
      ])
    ]) as any;

    const db = dbConn?.db;
    const jwtUser = jwtResult;
    const clerkUser = clerkResult;

    // Prefer JWT user (mobile), fall back to Clerk user (web)
    if (jwtUser.status === 'fulfilled' && jwtUser.value) {
      const u = jwtUser.value;
      serverUser = { ...u, id: u._id.toString(), isAuthenticated: true };
    } else if (clerkUser.status === 'fulfilled' && clerkUser.value) {
      const clerk = clerkUser.value;
      if (clerk) {
        let dbUser: any = await db.collection("users").findOne(
          { clerkId: clerk.id },
          { projection: { _id:1, clerkId:1, role:1, name:1, image:1, avatar:1, firstName:1, lastName:1, email:1, fcmTokens:1, wishlist:1 } }
        );
        if (!dbUser) {
          dbUser = {
            clerkId: clerk.id,
            email: clerk.emailAddresses[0]?.emailAddress,
            firstName: clerk.firstName,
            lastName: clerk.lastName,
            avatar: clerk.imageUrl,
            role: (clerk.unsafeMetadata?.role as string) || "client",
          };
          await db.collection("users").insertOne(dbUser);
        }
        serverUser = { ...dbUser, id: clerk.id, isAuthenticated: true };
      }
    }

    if (serverUser) {
      serverUser = JSON.parse(JSON.stringify(serverUser));
    }
  } catch (e) {
    console.error("Layout SSR Auth Error", e);
  }

  return (
    <ClerkProvider>
      <LanguageProvider initialLocale={validLocale}>
        <AuthProvider initialUser={serverUser}>
          <html lang={validLocale} suppressHydrationWarning>
            <head>
              {/* Mobile viewport for edge-to-edge design */}
              <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
              {/* iOS PWA meta tags */}
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
              <meta name="mobile-web-app-capable" content="yes" />
              {/* Theme color for Android status bar to match cream background */}
              <meta name="theme-color" content="#FDFBF7" />
              {/* Preconnects */}
              <link rel="preconnect" href="https://res.cloudinary.com" />
              <link rel="dns-prefetch" href="https://res.cloudinary.com" />
              <link rel="preconnect" href="https://clerk-telemetry.com" />
              <link rel="preconnect" href="https://img.clerk.com" />
            </head>
            <body className={`${playfair.variable} ${lato.variable} font-sans overflow-x-hidden`}>
              <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
                <OfflineBanner />
                <CapacitorInitWrapper />
                <SmoothScroll />
                <NotificationProvider>
                  <Navbar />
                  <SplashScreen />
                  <main className="w-full relative overflow-x-hidden" style={{
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)'
                  }}>
                    {children}
                  </main>
                </NotificationProvider>
              </ThemeProvider>
            </body>
          </html>
        </AuthProvider>
      </LanguageProvider>
    </ClerkProvider>
  )
}