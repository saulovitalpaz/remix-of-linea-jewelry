import StatusBar from "./StatusBar";
import Navigation from "./Navigation";
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  return (
    <header className="w-full sticky top-0 z-40 pt-3 px-3 md:px-6 pointer-events-none">
      <div className="pointer-events-auto">
        {/* <StatusBar /> */}
        <Navigation key={location.pathname + location.search + location.hash} />
      </div>
    </header>
  );
};

export default Header;
