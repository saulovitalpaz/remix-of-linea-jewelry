type IllustrationOption = { emoji: string; label: string; file?: string };

export const CATEGORY_ILLUSTRATIONS: IllustrationOption[] = [
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
  { emoji: '🟡', label: 'Argola' }, { emoji: '🌙', label: 'Brinco de lua' },
  { emoji: '⭐', label: 'Brinco de estrela' }, { emoji: '🦋', label: 'Brinco de borboleta' },
  { emoji: '🧿', label: 'Pingente olho grego' }, { emoji: '🤍', label: 'Coração delicado' },
  { emoji: '🪶', label: 'Colar delicado' }, { emoji: '🔗', label: 'Corrente' },
  { emoji: '🎁', label: 'Conjunto para presente' }, { emoji: '🌟', label: 'Conjunto brilhante' },
  { emoji: '💫', label: 'Conjunto contemporâneo' }, { emoji: '🪄', label: 'Conjunto encantado' },
  { emoji: '📿', label: 'Pulseira de contas' }, { emoji: '🧵', label: 'Pulseira de fio' },
  { emoji: '♾️', label: 'Pulseira infinito' }, { emoji: '🍀', label: 'Pulseira de trevo' },
  { emoji: '🦄', label: 'Unicórnio' }, { emoji: '🍭', label: 'Pirulito infantil' },
  { emoji: '💅', label: 'Esmalte' }, { emoji: '🪞', label: 'Espelho de maquiagem' },
  { emoji: '🖌️', label: 'Pincel de maquiagem' }, { emoji: '🎨', label: 'Paleta de maquiagem' },
  { emoji: '👛', label: 'Bolsa pequena' }, { emoji: '👝', label: 'Clutch' },
  { emoji: '🎒', label: 'Mochila' }, { emoji: '💼', label: 'Bolsa executiva' },
];

const OPTIONS_BY_CATEGORY: Record<string, string[]> = {
  aneis: ['💍', '💎', '👑', '✨', '🤍'],
  brincos: ['🟡', '🌙', '⭐', '🦋', '💎'],
  colares: ['🧿', '🤍', '🪶', '🔗', '💎'],
  conjuntos: ['🎁', '🌟', '💫', '🪄', '👑'],
  pulseiras: ['📿', '🧵', '♾️', '🍀', '✨'],
  infantil: ['🧸', '🎀', '🌸', '🦄', '🍭'],
  semijoias: ['💎', '💍', '👑', '⌚', '✨'],
  maquiagem: ['💄', '💅', '🪞', '🖌️', '🎨'],
  bolsas: ['👜', '👛', '👝', '🎒', '💼'],
};

const CATEGORY_ALIASES: Record<string, string[]> = {
  aneis: ['anel', 'aneis', 'rings'], brincos: ['brinco', 'brincos', 'earrings'],
  colares: ['colar', 'colares', 'necklace'], conjuntos: ['conjunto', 'conjuntos', 'kits', 'sets'],
  pulseiras: ['pulseira', 'pulseiras', 'bracelet'], infantil: ['infantil', 'kids', 'crianca'],
  semijoias: ['semijoia', 'semijoias', 'joias', 'jewelry'], maquiagem: ['make', 'maquiagem', 'makeup', 'beleza'],
  bolsas: ['bolsa', 'bolsas', 'bag'],
};

export function categoryIllustration(emoji?: string | null) {
  const item = CATEGORY_ILLUSTRATIONS.find(item => item.emoji === emoji);
  return item?.file ? `/emoji/${item.file}.png` : undefined;
}

export function categoryEmojiOptions(slug: string) {
  const normalized = slug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const key = Object.entries(CATEGORY_ALIASES).find(([, aliases]) => aliases.some(alias => normalized.includes(alias)))?.[0];
  const emojis = key ? OPTIONS_BY_CATEGORY[key] : ['💎', '🎀', '🌸', '✨', '👑'];
  return emojis.map(emoji => ({ emoji, label: CATEGORY_ILLUSTRATIONS.find(item => item.emoji === emoji)?.label || `Ilustração ${emoji}` }));
}
