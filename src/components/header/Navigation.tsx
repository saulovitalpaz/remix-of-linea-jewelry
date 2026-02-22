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
    <nav className="w-full max-w-screen-xl mx-auto bg-white/40 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 rounded-2xl md:rounded-[2rem] transition-all duration-300">
      <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">

        {/* Left — Logo 2 Symbol & Desktop Nav */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/Logo 2.png"
              alt="Chique Detalhes"
              className="h-10 md:h-14 w-auto object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap duration-300"
              >
                {cat.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#C5A028] to-[#E6C878] transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right — Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search toggle */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="text-sm border-b border-gray-300 outline-none px-1 py-0.5 w-28 md:w-40 focus:border-[#C5A028] transition-colors bg-transparent text-gray-800 placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">&times;</button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-500 hover:text-yellow-700 transition-colors" aria-label="Buscar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          )}



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
        <div className="md:hidden bg-white/80 backdrop-blur-xl border-t border-white/40 px-6 py-5 space-y-1 rounded-b-2xl md:rounded-b-[2rem]">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="block text-base text-gray-700 hover:text-yellow-700 transition-colors py-3 border-b border-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {cat.label}
            </Link>
          ))}

        </div>
      )}
    </nav>
  );
};

export default Navigation;