import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import { getAvatar, setAvatar } from '../auth/avatar';
import type { ResponceMsg, UserAccountDto } from '../types/api';

const ProfileSettings: React.FC = () => {
  const userId = getCurrentUserId();
  const [user, setUser] = useState<UserAccountDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [avatar, setAvatarState] = useState(getAvatar());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!userId) {
          setError('Сначала выполните вход.');
          return;
        }
        setLoading(true);
        const u = await fetchJson<UserAccountDto>(`/api/user/id?id=${userId}`);
        if (!cancelled) {
          setUser(u);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMsg(null);
    try {
      const res = await fetchJson<ResponceMsg>('/api/user', {
        method: 'PUT',
        body: JSON.stringify(user),
      });
      setAvatar(avatar);
      setMsg(res.isSuccess ? res.message : res.message);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Настройки профиля</h1>
          <p>Уведомления и безопасность вашего аккаунта.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
            </div>
          )}
          {error && <div className={catalog.errorState}>❌ {error}</div>}
          {user && (
            <form className={`${page.card} ${page.formGrid}`} onSubmit={save}>
              <label className={page.label}>
                Email
                <input
                  className={page.input}
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                />
              </label>
              <label className={page.label}>
                Отображаемое имя
                <input
                  className={page.input}
                  value={user.displayName}
                  onChange={(e) => setUser({ ...user, displayName: e.target.value })}
                />
              </label>
              <label className={page.label}>
                Ссылка на аватар
                <input
                  className={page.input}
                  value={avatar}
                  onChange={(e) => setAvatarState(e.target.value)}
                  placeholder="https://..."
                />
              </label>
              <img src={avatar} alt="Аватар" style={{ width: '96px', height: '96px', borderRadius: '50%' }} />
              <label className={`${page.row} ${page.muted}`}>
                <input
                  type="checkbox"
                  checked={user.notifyEmailEnabled}
                  onChange={(e) => setUser({ ...user, notifyEmailEnabled: e.target.checked })}
                />
                Email-уведомления
              </label>
              <label className={`${page.row} ${page.muted}`}>
                <input
                  type="checkbox"
                  checked={user.notifyPushEnabled}
                  onChange={(e) => setUser({ ...user, notifyPushEnabled: e.target.checked })}
                />
                Push-уведомления
              </label>
              <label className={`${page.row} ${page.muted}`}>
                <input
                  type="checkbox"
                  checked={user.loginAlertsEnabled}
                  onChange={(e) => setUser({ ...user, loginAlertsEnabled: e.target.checked })}
                />
                Оповещения о входах в аккаунт
              </label>
              <button type="submit" className={`${layout.btnPrimary} ${layout.btnBlock}`}>
                Сохранить
              </button>
              {msg && <p className={page.muted}>{msg}</p>}
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileSettings;
