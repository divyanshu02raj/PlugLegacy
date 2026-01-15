import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GamesSection from "@/components/GamesSection";
import FeaturesSection from "@/components/FeaturesSection";
import MetricsStrip from "@/components/MetricsStrip";
import FooterCTA from "@/components/FooterCTA";

const Index = () => {
    return (
        <div className="min-h-screen bg-obsidian overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <GamesSection />
            <FeaturesSection />
            <MetricsStrip />
            <FooterCTA />
        </div>
    );
};

export default Index;
