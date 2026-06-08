import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import Subscribe from "./pages/Subscribe.jsx";
import Checkout from "./pages/Checkout.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Account from "./pages/Account.jsx";
import MyOrders from "./pages/MyOrders.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/roadmap" element={<Roadmap />} />
      </Routes>
      <Footer />
    </>
  );
}
