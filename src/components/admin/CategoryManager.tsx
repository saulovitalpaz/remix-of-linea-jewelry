import { useState } from 'react';
import { Plus, Pencil, Trash2, Layers, AlertCircle, Check, HelpCircle } from 'lucide-react';
import type { CategoryModel } from '@/types/product';
import { api, errorMessage } from '@/services/api';

interface CategoryManagerProps {
  categories: CategoryModel[];
  onRefresh: () => Promise<void>;
}

const EMOJI_PRESETS = ['💎', '💍', '👜', '💄', '🧸', '👑', '🛍️', '📿', '🌟', '✨', '🎀', '🕶️', '⌚', '🌸'];

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('💎');
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setEmoji('💎');
    setError('');
  };

  const startEdit = (cat: CategoryModel) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setEmoji(cat.emoji || '💎');
    setError('');
    setMessage('');
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await api(`/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, slug, description, emoji })
        }, true);
        setMessage('Categoria atualizada com sucesso!');
      } else {
        await api('/categories', {
          method: 'POST',
          body: JSON.stringify({ name, slug, description, emoji })
        }, true);
        setMessage('Nova categoria adicionada com sucesso!');
      }
      resetForm();
      await onRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (cat: CategoryModel) => {
    const productCount = cat._count?.products || 0;
    if (productCount > 0) {
      alert(`A categoria "${cat.name}" possui ${productCount} produto(s) cadastrado(s). Reclassifique ou remova os produtos antes de excluí-la.`);
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${cat.name}"?`)) return;

    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api(`/categories/${cat.id}`, { method: 'DELETE' }, true);
      setMessage(`Categoria "${cat.name}" excluída.`);
      await onRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6" aria-label="Gerenciador de Categorias">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Layers size={20} className="text-primary" />
            Categorias & Ilustrações
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Gerencie as seções da loja, nomes, ilustrações visuais (emojis/ícones) e regras de exclusão.
          </p>
        </div>
        {editingId && (
          <button onClick={resetForm} className="button-secondary text-xs">
            + Nova Categoria
          </button>
        )}
      </div>

      {error && <p className="notice-error" role="alert">{error}</p>}
      {message && <p className="notice-success" role="status">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <form className="admin-panel space-y-4" onSubmit={handleSubmit}>
            <h4 className="text-base font-semibold">
              {editingId ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
            </h4>

            <div>
              <label className="block text-xs font-medium mb-1">Nome da Categoria</label>
              <input
                className="field"
                required
                maxLength={80}
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Ex: Anéis & Brincos"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Identificador da URL (slug)</label>
              <input
                className="field text-xs font-mono"
                required
                maxLength={80}
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="ex: aneis-brincos"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Ilustração Visual (Emoji / Ícone)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {EMOJI_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEmoji(preset)}
                    className={`h-9 w-9 rounded-lg border text-lg flex items-center justify-center transition-all ${
                      emoji === preset ? 'border-primary bg-primary/10 scale-110 shadow-sm' : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                className="field text-sm"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                placeholder="Ou digite outro emoji personalizado"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Descrição</label>
              <textarea
                className="field min-h-20 text-xs"
                maxLength={500}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Pequena descrição da coleção exibida na homepage..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button className="button-primary w-full text-xs" disabled={busy}>
                {busy ? 'Salvando…' : editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="button-secondary text-xs" disabled={busy}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between text-xs font-medium">
              <span>Categorias Cadastradas ({categories.length})</span>
              <span>Status de Exclusão</span>
            </div>

            <ul className="divide-y divide-border text-sm">
              {categories.map(cat => {
                const count = cat._count?.products ?? 0;
                const canDelete = count === 0;

                return (
                  <li key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                        {cat.emoji || '💎'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold truncate">{cat.name}</h5>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            /{cat.slug}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {cat.description || 'Sem descrição'}
                        </p>
                        <p className="text-[11px] font-medium text-primary mt-1">
                          {count} produto(s) cadastrado(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => startEdit(cat)}
                        className="icon-button"
                        title="Editar categoria"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={busy || !canDelete}
                        className={`icon-button ${canDelete ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground opacity-40 cursor-not-allowed'}`}
                        title={canDelete ? 'Excluir categoria' : 'Não é possível excluir: possui produtos vinculados'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
