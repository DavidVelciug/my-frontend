import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import { DEMO_USER_ID, fetchJson } from '../config/api';
import type { CapsuleContentType, ResponceMsg } from '../types/api';

const CreateCapsule: React.FC = () => {
  const [contentType, setContentType] = useState<CapsuleContentType>(0);
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [openAt, setOpenAt] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const openAtUtc = new Date(openAt).toISOString();
      const body = {
        id: 0,
        ownerUserId: DEMO_USER_ID,
        contentType,
        title,
        textContent: contentType === 0 ? textContent : null,
        linkUrl: contentType === 1 ? linkUrl : null,
        fileStoragePath: contentType === 2 ? filePath : null,
        openAtUtc,
        createdAtUtc: new Date().toISOString(),
        recipientEmail,
        isPublic,
      };
      const res = await fetchJson<ResponceMsg>('/api/timecapsule', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setStatus(res.isSuccess ? `✓ ${res.message}` : `✗ ${res.message}`);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Ошибка запроса');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Создание капсулы</h1>
          <p>Выберите тип содержимого, дату открытия и адресата — мы запечатаем сообщение.</p>
        </div>
        <div className={page.section}>
          <div className={`${page.card} ${layout.container}`}>
            <form className={page.formGrid} onSubmit={handleSubmit}>
              <label className={page.label}>
                Тип капсулы
                <select
                  className={page.select}
                  value={contentType}
                  onChange={(e) => setContentType(Number(e.target.value) as CapsuleContentType)}
                >
                  <option value={0}>Текст</option>
                  <option value={1}>Ссылка</option>
                  <option value={2}>Файл (путь хранения)</option>
                </select>
              </label>
              <label className={page.label}>
                Заголовок
                <input
                  className={page.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Короткое название"
                />
              </label>
              {contentType === 0 && (
                <label className={page.label}>
                  Текст сообщения
                  <textarea
                    className={page.textarea}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    required
                  />
                </label>
              )}
              {contentType === 1 && (
                <label className={page.label}>
                  URL ссылки
                  <input
                    className={page.input}
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    required
                    placeholder="https://"
                  />
                </label>
              )}
              {contentType === 2 && (
                <label className={page.label}>
                  Путь к файлу на сервере
                  <input
                    className={page.input}
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    required
                    placeholder="/storage/capsules/file.pdf"
                  />
                  <span className={page.hint}>Демо: укажите строку пути, загрузка файла упрощена.</span>
                </label>
              )}
              <label className={page.label}>
                Дата и время открытия
                <input
                  className={page.input}
                  type="datetime-local"
                  value={openAt}
                  onChange={(e) => setOpenAt(e.target.value)}
                  required
                />
              </label>
              <label className={page.label}>
                Email адресата
                <input
                  className={page.input}
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </label>
              <label className={`${page.row} ${page.muted}`}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Сделать публичной после открытия (попадёт в ленту)
              </label>
              <button type="submit" className={`${layout.btnPrimary} ${layout.btnBlock}`} disabled={loading}>
                {loading ? 'Сохранение…' : 'Запечатать капсулу'}
              </button>
              {status && <p className={page.muted}>{status}</p>}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateCapsule;