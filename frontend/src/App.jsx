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

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";
import InviteListener from "./components/auth/InviteListener"; // Create this next

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
                <SocketProvider>
                    <Toaster />
                    <Sonner />

                    <OnboardingTutorial />
                    <BrowserRouter>
                        <InviteListener />
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/profile-setup" element={<ProfileSetup />} />
                                <Route path="/games" element={<GameLibrary />} />
                                <Route path="/play/:gameId" element={<GameArena />} />
                                <Route path="/leaderboard" element={<Leaderboard />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/profile/:id" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                            </Route>

                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </SocketProvider>
            </TooltipProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
