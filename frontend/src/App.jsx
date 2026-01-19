import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import OnboardingTutorial from "./components/OnboardingTutorial";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ProfileSetup from "./components/auth/ProfileSetup";
import GameLibrary from "./pages/GameLibrary";
import GameArena from "./pages/GameArena";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <OnboardingTutorial />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/profile-setup" element={<ProfileSetup />} />
                        <Route path="/games" element={<GameLibrary />} />
                        <Route path="/play/:gameId" element={<GameArena />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
