import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import type { ResponceMsg, UserAccountDto } from '../types/api';

type SortMode = 'newest' | 'oldest' | 'name-asc';
type SearchMode = 'name' | 'email';
type EditableRole = 'user' | 'moderator';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchMode, setSearchMode] = useState<SearchMode>('name');
  const [query, setQuery] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<UserAccountDto[]>('/api/user/getAll');
      setUsers(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = users.filter((u) => {
      if (!q) return true;
      if (searchMode === 'email') return u.email.toLowerCase().includes(q);
      return u.displayName.toLowerCase().includes(q);
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'name-asc') {
        return a.displayName.localeCompare(b.displayName, 'ru-RU');
      }
      if (sortMode === 'oldest') {
        return new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime();
      }
      return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
    });
  }, [query, searchMode, sortMode, users]);

  const updateRole = async (user: UserAccountDto, role: EditableRole) => {
    setMessage(null);
    try {
      const res = await fetchJson<ResponceMsg>('/api/user', {
        method: 'PUT',
        body: JSON.stringify({ ...user, role }),
      });
      setMessage(res.message);
      await loadUsers();
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Ошибка изменения роли');
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Админ: управление пользователями</h1>
          <p>Смена роли пользователь/модератор, сортировка и единый поиск.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          <div className={page.card}>
            <div className={page.row}>
              <input
                className={page.input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по имени или почте"
              />
              <select className={page.select} value={searchMode} onChange={(e) => setSearchMode(e.target.value as SearchMode)}>
                <option value="name">Искать по имени</option>
                <option value="email">Искать по почте</option>
              </select>
              <select className={page.select} value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
                <option value="newest">Новые аккаунты</option>
                <option value="oldest">Старые аккаунты</option>
                <option value="name-asc">Имя (А-Я)</option>
              </select>
            </div>
          </div>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
              <p>Загружаем пользователей…</p>
            </div>
          )}
          {error && <div className={catalog.errorState}>❌ {error}</div>}
          {message && <p className={page.muted}>{message}</p>}
          {!loading &&
            !error &&
            visibleUsers.map((u) => (
              <article key={u.id} className={page.card}>
                <div className={page.row} style={{ justifyContent: 'space-between' }}>
                  <strong>{u.displayName}</strong>
                  <span className={page.badge}>{u.role}</span>
                </div>
                <p className={page.muted}>
                  {u.email} · регистрация {new Date(u.createdAtUtc).toLocaleDateString('ru-RU')}
                </p>
                {u.role !== 'admin' && (
                  <div className={page.row}>
                    <button type="button" className={layout.btnPrimary} onClick={() => updateRole(u, 'user')}>
                      Сделать пользователем
                    </button>
                    <button type="button" className={layout.btnPrimary} onClick={() => updateRole(u, 'moderator')}>
                      Сделать модератором
                    </button>
                  </div>
                )}
              </article>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
