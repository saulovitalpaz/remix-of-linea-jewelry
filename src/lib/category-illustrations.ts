export const CATEGORY_ILLUSTRATIONS = [
  { emoji: '💎', label: 'Pedra preciosa', file: 'gem_stone' },
  { emoji: '💍', label: 'Anel', file: 'ring' },
  { emoji: '👜', label: 'Bolsa', file: 'handbag' },
  { emoji: '💄', label: 'Batom', file: 'lipstick' },
  { emoji: '🧸', label: 'Ursinho', file: 'teddy_bear' },
  { emoji: '👑', label: 'Coroa', file: 'crown' },
  { emoji: '🎀', label: 'Laço', file: 'ribbon' },
  { emoji: '⌚', label: 'Relógio', file: 'watch' },
  { emoji: '🌸', label: 'Flor', file: 'cherry_blossom' },
  { emoji: '✨', label: 'Brilhos', file: 'sparkles' },
];

export function categoryIllustration(emoji?: string | null) {
  const item = CATEGORY_ILLUSTRATIONS.find(item => item.emoji === emoji);
  return item ? `/emoji/${item.file}.png` : undefined;
}

export function categoryEmojiOptions(slug: string) {
  const groups: Record<string, string[]> = {
    infantil: ['🧸', '🎀', '🌸', '🦄', '🦋'],
    semijoias: ['💎', '💍', '👑', '⌚', '✨'],
    make: ['💄', '💅', '🪞', '🌸', '✨'],
    bolsas: ['👜', '👛', '👝', '🎒', '💼'],
  };
  const key = Object.keys(groups).find(key => slug.includes(key));
  return (groups[key || ''] || ['💎', '🎀', '🌸', '✨', '👑']).map(emoji => ({ emoji, label: CATEGORY_ILLUSTRATIONS.find(item => item.emoji === emoji)?.label || `Emoji ${emoji}` }));
}
