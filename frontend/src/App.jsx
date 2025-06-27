import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './Pages/Home';
import AvailableProducts from './Pages/AvailableProducts';
import SearchPage from './components/SearchPage';
import SimilarSearchPage from './components/SimilarSearchPage';
import Login from './Pages/auth/Login';
import Signup from './Pages/auth/Signup';

// Admin Components
import { AdminProvider } from './components/admin/AdminContext';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminAddProduct from './components/admin/AdminAddProduct';
import AdminDeleteProduct from './components/admin/AdminDeleteProduct';

function App() {
  return (
    <AdminProvider>
      <Router>
        <div className="App min-h-screen flex flex-col">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="add-product" element={<AdminAddProduct />} />
              <Route path="delete-product" element={<AdminDeleteProduct />} />
            </Route>

            {/* Public Routes */}
            <Route path="/*" element={
              <>
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/available-products" element={<AvailableProducts />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/find-similar" element={<SimilarSearchPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/about" element={<div className="py-20 text-center">About Page Coming Soon!!</div>} />
                    <Route path="/how-to-use" element={<div className="py-20 text-center">How to Use Page Coming Soon</div>} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AdminProvider>
  );
}

export default App;