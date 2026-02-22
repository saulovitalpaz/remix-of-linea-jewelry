import { useState, useEffect } from "react";
import { ProductService } from "../../services/ProductService";

export const MarketingModal = () => {
    const [popupData, setPopupData] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Obter popup ativo do backend
        ProductService.getActivePopup().then(data => {
            if (data && data.active) {
                // Checar se já mostrou nessa sessão para não ser chato/repetitivo
                const hasSeen = sessionStorage.getItem(`seen_popup_${data.id}`);
                if (!hasSeen) {
                    setPopupData(data);
                    setIsOpen(true);
                    sessionStorage.setItem(`seen_popup_${data.id}`, 'true');
                }
            }
        });
    }, []);

    if (!isOpen || !popupData) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">

                {/* Botão Fechar */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl backdrop-blur-md transition-colors"
                >
                    ✕
                </button>

                {/* Imagem do Banner - 3:4 Aspect Ratio (Mobile Friendly) */}
                <div className="aspect-[3/4] md:aspect-square w-full relative">
                    <img
                        src={popupData.imageUrl}
                        alt="Promoção Chique Detalhes"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};
