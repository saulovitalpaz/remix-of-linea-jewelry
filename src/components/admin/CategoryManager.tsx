import { useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Layers } from 'lucide-react';
import type { CategoryModel } from '@/types/product';
import { api, errorMessage } from '@/services/api';
import CategoryIllustration from '@/components/CategoryIllustration';
import { categoryEmojiOptions } from '@/lib/category-illustrations';

interface CategoryManagerProps {
  categories: CategoryModel[];
  onRefresh: () => Promise<void>;
}


export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('💎');
  const [image, setImage] = useState<File | null>(null);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>();
  const [removeImage, setRemoveImage] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const selectImage = (file: File | null) => {
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : undefined);
    if (!file && imageInput.current) imageInput.current.value = '';
  };
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setEmoji('💎');
    selectImage(null);
    setSavedImage(null);
    setRemoveImage(false);
    setError('');
  };

  const startEdit = (cat: CategoryModel) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setEmoji(cat.emoji || '💎');
    selectImage(null);
    setSavedImage(cat.imageUrl || null);
    setRemoveImage(false);
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
      const options = categoryEmojiOptions(generateSlug(val));
      if (!options.some(option => option.emoji === emoji)) setEmoji(options[0].emoji);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const body = new FormData();
      for (const [key, value] of Object.entries({ name, slug, description, emoji, removeImage: String(removeImage) })) body.append(key, value);
      if (image) body.append('image', image);
      if (editingId) {
        await api(`/categories/${editingId}`, {
          method: 'PUT',
          body
        }, true);
        setMessage('Categoria atualizada com sucesso!');
      } else {
        await api('/categories', {
          method: 'POST',
          body
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
    <section className="space-y-6" aria-labelledby="category-manager-title">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 id="category-manager-title" className="text-xl font-semibold flex items-center gap-2">
            <Layers size={20} className="text-primary" aria-hidden="true" />
            Categorias & Ilustrações
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Organize as coleções com uma imagem sem fundo ou emoji.
          </p>
        </div>
        {editingId && (
          <button type="button" onClick={resetForm} className="button-secondary text-sm">
            + Nova Categoria
          </button>
        )}
      </div>

      {error && <p className="notice-error" role="alert">{error}</p>}
      {message && <p className="notice-success" role="status">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <form className="admin-panel space-y-4" onSubmit={handleSubmit} aria-busy={busy}>
            <h4 className="text-base font-semibold">
              {editingId ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
            </h4>

            <div>
              <label htmlFor="category-name" className="block text-xs font-medium mb-1">Nome da Categoria</label>
              <input id="category-name"
                className="field"
                name="category-name"
                autoComplete="off"
                required
                maxLength={80}
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Ex.: Anéis & Brincos…"
              />
            </div>

            <div>
              <label htmlFor="category-slug" className="block text-xs font-medium mb-1">Identificador da URL (slug)</label>
              <input id="category-slug"
                className="field font-mono"
                name="category-slug"
                autoComplete="off"
                spellCheck={false}
                required
                maxLength={80}
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="Ex.: aneis-brincos…"
              />
            </div>

            <div>
              <label htmlFor="category-image" className="block text-sm font-medium mb-2">Imagem da categoria</label>
              <input ref={imageInput} id="category-image" name="category-image" type="file" accept="image/png,image/webp" className="field text-sm" disabled={busy} onChange={event => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!['image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                  setError('Escolha PNG ou WebP de até 5 MB.'); event.target.value = ''; return;
                }
                setError(''); selectImage(file); setRemoveImage(false);
              }} />
              <p className="text-xs text-muted-foreground mt-2">PNG ou WebP de até 5 MB. A transparência do arquivo será preservada.</p>
              {(preview || savedImage) && !removeImage && <div className="flex items-center gap-3 my-3">
                <CategoryIllustration imageUrl={preview || savedImage} className="h-16 w-16" />
                <button type="button" className="button-secondary text-xs" onClick={() => { selectImage(null); setRemoveImage(true); }}>Usar emoji</button>
              </div>}
              <p id="illustration-label" className="block text-sm font-medium my-2">Ou escolha uma das 5 ilustrações</p>
              <div className="flex flex-wrap gap-2 mb-2" role="group" aria-labelledby="illustration-label">
                {categoryEmojiOptions(slug).map(preset => (
                  <button
                    key={preset.emoji}
                    type="button"
                    onClick={() => { setEmoji(preset.emoji); selectImage(null); setRemoveImage(true); }}
                    aria-label={preset.label}
                    aria-pressed={emoji === preset.emoji && !(image || (savedImage && !removeImage))}
                    title={preset.label}
                    className={`h-12 w-12 rounded-lg border flex items-center justify-center transition-[color,background-color,border-color,box-shadow] ${
                      emoji === preset.emoji && !(image || (savedImage && !removeImage)) ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <CategoryIllustration emoji={preset.emoji} />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Ilustrações Fluent Emoji da Microsoft.</p>
            </div>

            <div>
              <label htmlFor="category-description" className="block text-xs font-medium mb-1">Descrição</label>
              <textarea id="category-description"
                className="field min-h-20"
                name="category-description"
                autoComplete="off"
                maxLength={500}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Pequena descrição da coleção exibida na homepage…"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button className="button-primary w-full" disabled={busy}>
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
                  <li key={cat.id} className="px-3 py-2 flex items-center justify-between gap-2 hover:bg-muted/20">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl">
                        <CategoryIllustration emoji={cat.emoji} imageUrl={cat.imageUrl} />
                      </span>
                      <div className="min-w-0">
                        <h5 className="font-semibold truncate" title={cat.name}>{cat.name}</h5>
                        <p className="text-xs text-muted-foreground truncate" title={cat.description || cat.slug}>{count} produtos · {cat.description || `/${cat.slug}`}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="icon-button"
                        title="Editar categoria"
                        aria-label={`Editar ${cat.name}`}
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={busy || !canDelete}
                        aria-label={`Excluir ${cat.name}`}
                        className={`icon-button ${canDelete ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground opacity-40 cursor-not-allowed'}`}
                        title={canDelete ? 'Excluir categoria' : 'Não é possível excluir: possui produtos vinculados'}
                      >
                        <Trash2 size={16} aria-hidden="true" />
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
