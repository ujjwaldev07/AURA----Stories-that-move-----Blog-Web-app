import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/common/ScrollProgress'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { PageTransition } from '@/components/common/PageTransition'
import { CreatePostModal } from '@/components/post/CreatePostModal'
import { SearchModal } from '@/components/search/SearchModal'
import { FloatingActionButton } from '@/components/common/FloatingActionButton'

export function MainLayout() {
  return (
    <div className="mesh-bg min-h-screen">
      <ScrollProgress />
      <OfflineBanner />
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <CreatePostModal />
      <SearchModal />
      <FloatingActionButton />
    </div>
  )
}
