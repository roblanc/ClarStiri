import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import StoryDetail from "./pages/StoryDetail";

// Lazy load pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Metodologie = lazy(() => import("./pages/Metodologie"));
const Sources = lazy(() => import("./pages/Sources"));
const SourceDetail = lazy(() => import("./pages/SourceDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const VoiceProfile = lazy(() => import("./pages/VoiceProfile"));
const Barometer = lazy(() => import("./pages/Barometer"));
const Despre = lazy(() => import("./pages/Despre"));
const Contact = lazy(() => import("./pages/Contact"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IndexEditorial = lazy(() => import("./pages/IndexEditorial"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,   // 2 minute
      gcTime: 30 * 60 * 1000,     // 30 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Se încarcă...</p>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/stire/:id" element={<StoryDetail />} />
                <Route path="/metodologie" element={<Metodologie />} />
                <Route path="/surse" element={<Sources />} />
                <Route path="/surse/:id" element={<SourceDetail />} />
                <Route path="/despre" element={<Despre />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cauta" element={<SearchPage />} />
                <Route path="/categorie/:slug" element={<CategoryPage />} />
                <Route path="/barometru" element={<Barometer />} />
                <Route path="/voci" element={<Navigate to="/barometru" replace />} />
                <Route path="/voce/:slug" element={<VoiceProfile />} />
                <Route path="/test" element={<IndexEditorial />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ThemeProvider>
);

export default App;
