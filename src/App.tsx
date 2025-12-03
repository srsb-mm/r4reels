import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Create from "./pages/Create";
import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import Activity from "./pages/Activity";
import Reels from "./pages/Reels";
import Search from "./pages/Search";
import PostDetail from "./pages/PostDetail";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create" element={<Create />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
