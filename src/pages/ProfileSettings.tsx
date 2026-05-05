import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import { getCurrentUserId } from '../auth/session';
import { getAvatar, setAvatar } from '../auth/avatar';
import type { ResponceMsg, UserAccountDto } from '../types/api';
import { resolveMediaUrl } from '../utils/file';
import { uploadFile } from '../utils/upload';

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
    return () => { cancelled = true; };
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
      setMsg(res.message);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Ошибка');
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={`${layout.mainContent} ${layout.fadeIn}`}>
        <div className={page.pageHeader}>
          <h1>Настройки профиля</h1>
          <p>Основные данные вашего аккаунта и визуальное оформление.</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
            </div>
          )}
          {error && <div className={catalog.errorState}>{error}</div>}
          {user && (
            <form className={page.settingsFormContainer} onSubmit={save}>
              <div className={page.card}>
                <div className={page.profileAesthetics}>
                  <div className={page.avatarUploadWrapper}>
                    <img
                      src={resolveMediaUrl(avatar, '/assets/default-avatar.svg')}
                      alt="Аватар"
                      className={page.avatarCircle}
                      onError={(e) => { e.currentTarget.src = '/assets/default-avatar.svg'; }}
                    />
                    <label className={page.avatarEditOverlay}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          void uploadFile(file, 'avatars').then(setAvatarState).catch((err: unknown) => {
                            setMsg(err instanceof Error ? err.message : 'Ошибка загрузки');
                          });
                        }}
                      />
                      <span>Изменить</span>
                    </label>
                  </div>
                  <div className={page.profileQuickInfo}>
                    <h3>{user.displayName || 'Пользователь'}</h3>
                    <p className={page.hint}>{user.email}</p>
                  </div>
                </div>

                <div className={page.formGrid}>
                  <label className={page.label}>
                    Электронная почта
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
                  <button type="submit" className={`${layout.btnPrimaryLarge} ${layout.btnBlock}`}>
                    Сохранить настройки
                  </button>
                  {msg && <p className={page.statusMsg}>{msg}</p>}
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileSettings;