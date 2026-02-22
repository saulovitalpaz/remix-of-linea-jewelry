import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { label: "Linha Infantil", slug: "infantil" },
    { label: "Semijoias & Bijuterias", slug: "semijoias" },
    { label: "Beleza & Make", slug: "make" },
    { label: "Bolsas", slug: "bolsas" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left — Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="text-sm font-light text-gray-700 hover:text-yellow-600 transition-colors whitespace-nowrap"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Center — Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link to="/" className="flex items-center justify-center">
            <img
              src="/logo1.png"
              alt="Chique Detalhes"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Right — Icons */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Search toggle */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="text-sm border-b border-gray-300 outline-none px-1 py-0.5 w-40 focus:border-yellow-500 transition-colors"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">&times;</button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-600 hover:text-yellow-600 transition-colors" aria-label="Buscar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          )}

          {/* Admin link */}
          <Link to="/admin" className="hidden md:block p-2 text-gray-400 hover:text-yellow-600 transition-colors" aria-label="Admin" title="Painel Admin">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="block text-sm font-light text-gray-700 hover:text-yellow-600 transition-colors py-2 border-b border-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {cat.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="block text-sm text-gray-400 hover:text-yellow-600 transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Painel Admin
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navigation;