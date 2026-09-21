import { useEffect, useState } from 'react';
import { api, errorMessage } from '@/services/api';
import type { AdminUser, MarketingPopup, Role } from '@/types/admin';
import { ROLE_LABELS } from '@/types/admin';

export default function Settings() {
  const [popup, setPopup] = useState<MarketingPopup | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('SELLER');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    Promise.all([api<MarketingPopup | null>('/popup', {}, true), api<AdminUser[]>('/users', {}, true)])
      .then(([campaign, people]) => { if (live) { setPopup(campaign); setUsers(people); } })
      .catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [retry]);
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <section className="space-y-6" aria-label="Configurações">
    <div><h2 className="text-2xl">Configurações da loja</h2><p className="mt-2 text-muted-foreground">Gerencie a campanha da homepage e os acessos da equipe.</p></div>
    {error && <div className="notice-error" role="alert">{error}<button className="ml-3 underline" onClick={() => { setLoading(true); setError(''); setRetry(retry + 1); }}>Recarregar</button></div>}
    {message && <p className="notice-success" role="status">{message}</p>}
    {loading ? <p role="status">Carregando configurações…</p> : <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className="admin-panel"><h3 className="text-xl">Popup da homepage</h3><p className="mt-2 text-sm text-muted-foreground">A campanha aparece uma vez por sessão. Use JPEG, PNG ou WebP de até 5 MB.</p>
        {popup ? <div className="my-5"><img src={popup.imageUrl} alt="Prévia da campanha atual" width={360} height={480} className="mx-auto max-h-72 w-full rounded-xl bg-muted object-contain" /><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm">Status: <strong>{popup.active ? 'Ativo' : 'Desativado'}</strong></p><button disabled={busy} className="button-secondary" onClick={() => run(async () => { setPopup(await api<MarketingPopup>('/popup/' + popup.id + '/toggle', { method: 'PUT', body: JSON.stringify({ active: !popup.active }) }, true)); setMessage('Status da campanha atualizado.'); })}>{popup.active ? 'Desativar popup' : 'Ativar popup'}</button></div></div> : <p className="my-6 text-sm text-muted-foreground">Nenhuma campanha cadastrada.</p>}
        <form className="mt-6 space-y-4 border-t border-border pt-6" onSubmit={e => { e.preventDefault(); const form = e.currentTarget; run(async () => { if (!file) throw new Error('Selecione uma imagem.'); if (file.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.'); const body = new FormData(); body.append('image', file); setPopup(await api<MarketingPopup>('/popup', { method: 'POST', body }, true)); setFile(null); form.reset(); setMessage('Nova campanha salva e ativada.'); }); }}>
          <label className="block text-sm font-medium">Nova imagem<input className="field mt-2" name="image" type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setFile(e.target.files?.[0] || null)} /></label>
          <button className="button-primary" disabled={busy}>{busy ? 'Aguarde…' : 'Salvar e ativar campanha'}</button>
        </form>
      </section>
      <section className="admin-panel"><h3 className="text-xl">Usuários e permissões</h3><p className="mt-2 text-sm text-muted-foreground">O nome cadastrado será utilizado no login.</p>
        <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); run(async () => { const user = await api<AdminUser>('/users', { method: 'POST', body: JSON.stringify({ name, password, role }) }, true); setUsers(previous => [...previous, user]); setName(''); setPassword(''); setRole('SELLER'); setMessage('Usuário criado com sucesso.'); }); }}>
          <label className="block text-sm font-medium">Nome de acesso<input className="field mt-2" name="new-username" autoComplete="off" required maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Nome e sobrenome…" /></label>
          <label className="block text-sm font-medium">Senha inicial<input className="field mt-2" name="new-password" type="password" autoComplete="new-password" required minLength={6} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} aria-describedby="new-password-help" /></label><p id="new-password-help" className="text-xs text-muted-foreground">Pelo menos 6 caracteres. Compartilhe a senha por um canal privado.</p>
          <label className="block text-sm font-medium">Perfil<select className="field mt-2" value={role} onChange={e => setRole(e.target.value as Role)}>{Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <p className="text-sm text-muted-foreground">{role === 'ADMIN' ? 'Acesso a produtos, vendas, campanhas e usuários.' : role === 'MANAGER' ? 'Gerencia produtos, estoque e vendas.' : 'Consulta produtos e registra vendas.'}</p>
          <button className="button-primary" disabled={busy}>{busy ? 'Aguarde…' : 'Criar usuário'}</button>
        </form>
        <ul className="mt-8 divide-y divide-border border-t border-border">{users.map(user => <li className="flex items-center justify-between gap-3 py-4 text-sm" key={user.id}><span className="break-words">{user.name}</span><span className="shrink-0 rounded-full bg-muted px-3 py-1">{ROLE_LABELS[user.role]}</span></li>)}</ul>
      </section>
    </div>}
  </section>;
}
