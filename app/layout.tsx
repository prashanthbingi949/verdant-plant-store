import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./home-overrides.css";
import "./mobile-home-fixes.css";
import "./story-overrides.css";
import "./shop-category-fix.css";
import "./shop-product-polish.css";
import "./shop-grid-density.css";
import "./shop-cart-toast.css";
import "./product-detail-visual-polish.css";
import "./checkout-polish.css";
import "./checkout-experience.css";
import "./verdant-premium.css";
import "./verdant-discovery.css";
import "./verdant-cart-recommendations.css";
import { CartProvider } from "@/components/cart-provider";
import HomeNavController from "@/components/home-nav-controller";
import HomeVisualEffects from "@/components/home-visual-effects";
import SiteUtilities from "@/components/site-utilities";
import HomeWishlistPersistence from "@/components/home-wishlist-persistence";
import FavoritesBridge from "@/components/favorites-bridge";
import VerdantPremiumMotion from "@/components/verdant-premium-motion";
import ShopSearchEnhancer from "@/components/shop-search-enhancer";
import ShopCartToast from "@/components/shop-cart-toast";
import MiniCartDrawer from "@/components/mini-cart-drawer";
import ShopQuickAddFeedback from "@/components/shop-quick-add-feedback";
import ShopBadgeBridge from "@/components/shop-badge-bridge";
import VerdantDiscoveryMount from "@/components/verdant-discovery-mount";
import ShopWishlistBridge from "@/components/shop-wishlist-bridge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verdant — Plants, Pots & Garden Life",
  description:
    "Thoughtful plants and beautiful objects for spaces that feel more alive.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <HomeNavController />
          <HomeVisualEffects />
          <SiteUtilities />
          <HomeWishlistPersistence />
          <FavoritesBridge />
          <VerdantPremiumMotion />
          <ShopSearchEnhancer />
          <ShopCartToast />
          <MiniCartDrawer />
          <ShopQuickAddFeedback />
          <ShopBadgeBridge />
          <VerdantDiscoveryMount />
          <ShopWishlistBridge />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
