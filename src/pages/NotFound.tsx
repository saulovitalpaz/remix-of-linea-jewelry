import { Link } from 'react-router-dom';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
export default function NotFound() {
  return <div className="min-h-screen"><Header /><main id="main-content" className="store-container py-24 text-center"><p className="mb-3 text-sm text-primary">Erro 404</p><h1 className="text-3xl">Página não encontrada</h1><p className="my-5 text-muted-foreground">O endereço pode ter mudado. Explore os produtos da loja.</p><Link className="button-primary" to="/category/all">Ver catálogo</Link></main><Footer /></div>;
}
