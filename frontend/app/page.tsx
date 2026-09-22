import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoBanner from "@/components/home/PromoBanner";
import TrendingProducts from "@/components/home/TrendingProducts";
import WhyShopSphere from "@/components/home/WhyShopSphere";
import Newsletter from "@/components/home/NewsLetter";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#17202a]">
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <PromoBanner/>
      <TrendingProducts/>
      <WhyShopSphere/>
      <Newsletter/>
      <Footer/>
    </main>
  );
}
