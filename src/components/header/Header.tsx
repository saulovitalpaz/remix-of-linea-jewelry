import StatusBar from "./StatusBar";
import Navigation from "./Navigation";

const Header = () => {
  return (
    <header className="w-full sticky top-0 z-50 pt-3 md:pt-5 px-3 md:px-6 transition-all duration-300 pointer-events-none">
      <div className="pointer-events-auto">
        {/* <StatusBar /> */}
        <Navigation />
      </div>
    </header>
  );
};

export default Header;