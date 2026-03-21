import { Header } from "@/components/Header";
import { VoicesSection } from "@/components/VoicesSection";

const Barometer = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <VoicesSection />
            </main>
        </div>
    );
};

export default Barometer;
