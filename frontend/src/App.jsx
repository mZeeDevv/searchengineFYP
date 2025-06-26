import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './Pages/Home';
import SearchPage from './components/SearchPage';
import SimilarSearchPage from './components/SimilarSearchPage';
import Login from './Pages/auth/Login';
import Signup from './Pages/auth/Signup';

function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/find-similar" element={<SimilarSearchPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<div className="py-20 text-center">About Page Coming Soon!!</div>} />
            <Route path="/how-to-use" element={<div className="py-20 text-center">How to Use Page Coming Soon</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;