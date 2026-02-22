import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SupportSizeGuide from "./pages/SupportSizeGuide";
import SupportCare from "./pages/SupportCare";
import SupportReturns from "./pages/SupportReturns";
import SupportShipping from "./pages/SupportShipping";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import "./App.css";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/category/:category" element={<Category />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/support/size-guide" element={<SupportSizeGuide />} />
            <Route path="/support/care" element={<SupportCare />} />
            <Route path="/support/returns" element={<SupportReturns />} />
            <Route path="/support/shipping" element={<SupportShipping />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
