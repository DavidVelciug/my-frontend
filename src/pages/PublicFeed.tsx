import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import type { ModerationReportDto, ResponceMsg, TimeCapsuleDto } from '../types/api';
import { getFeedCounts, getFeedUserReaction, toggleFeedReaction } from '../auth/reactions';
import { isImageSource, resolveMediaUrl, resolveUserAvatar } from '../utils/file';
import { getAvatarByUserId } from '../auth/avatar';

const PublicFeed: React.FC = () => {
  const [items, setItems] = useState<TimeCapsuleDto[]>([]);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [dislikes, setDislikes] = useState<Record<number, number>>({});
  const [userReactions, setUserReactions] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<TimeCapsuleDto | null>(null);
  const [reportText, setReportText] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;

  const refreshReactions = (capsules: TimeCapsuleDto[]) => {
    const nextLikes: Record<number, number> = {};
    const nextDislikes: Record<number, number> = {};
    const nextUser: Record<number, 'like' | 'dislike' | null> = {};
    capsules.forEach((capsule) => {
      const counts = getFeedCounts(capsule.id);
      nextLikes[capsule.id] = counts.likes;
      nextDislikes[capsule.id] = counts.dislikes;
      nextUser[capsule.id] = getFeedUserReaction(capsule.id);
    });
    setLikes(nextLikes);
    setDislikes(nextDislikes);
    setUserReactions(nextUser);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getPublicFeed');
        if (!cancelled) {
          setItems(data);
          refreshReactions(data);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const react = (capsuleId: number, reaction: 'like' | 'dislike') => {
    toggleFeedReaction(capsuleId, reaction);
    refreshReactions(items);
  };

  const reportCapsule = async (capsule: TimeCapsuleDto) => {
    const payload: ModerationReportDto = {
      id: 0,
      capsuleId: capsule.id,
      reporterEmail: 'user@memorylane.local',
      reason: reportText.trim() || 'Жалоба на контент',
      status: 0,
      createdAtUtc: new Date().toISOString(),
    };
    try {
      const res = await fetchJson<ResponceMsg>('/api/moderationreport', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setInfo(res.message);
    } catch {
      setInfo('Ошибка при отправке');
    }
    setReportTarget(null);
    setReportText('');
  };

  const sorted = [...items].sort((a, b) => (likes[b.id] ?? 0) - (likes[a.id] ?? 0));
  const paged = sorted.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={`${layout.mainContent} ${layout.fadeIn}`}>
        <div className={page.pageHeader}>
          <h1 className={layout.textGradient}>Публичные воспоминания</h1>
          <p>Общая лента открытых капсул — делитесь моментами прошлого.</p>
        </div>

        <div className={page.feedContainer}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
            </div>
          )}
          
          {error && <div className={catalog.errorState}>{error}</div>}
          
          {info && <div className={page.statusMsg}>{info}</div>}

          <div className={page.chatTimeline}>
            {!loading && !error && paged.map((c) => (
              <div key={c.id} className={page.messageRow}>
                <div className={page.avatarSpace}>
                  <img
                    src={getAvatarByUserId(c.ownerUserId) || resolveUserAvatar(c.ownerUserId, c.ownerDisplayName)}
                    alt="avatar"
                    className={page.chatAvatar}
                    onError={(e) => { e.currentTarget.src = '/assets/default-avatar.svg'; }}
                  />
                </div>
                
                <div className={page.messageBubble}>
                  <div className={page.messageInfo}>
                    <span className={page.authorName}>{c.ownerDisplayName || 'Аноним'}</span>
                    <span className={page.userTag}>Участник</span>
                    <span className={page.messageTime}>
                      {new Date(c.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button className={page.reportTrigger} onClick={() => setReportTarget(c)}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    </button>
                  </div>

                  <div className={page.messageContent}>
                    <h2 className={page.capsuleTitle}>{c.title}</h2>
                    <p className={page.capsuleText}>{c.previewText || 'Внутри этой капсулы находится ценное воспоминание.'}</p>
                    
                    {isImageSource(c.fileStoragePath) && (
                      <div className={page.messageAttachment}>
                        <img
                          src={resolveMediaUrl(c.fileStoragePath, '/assets/default-capsule-cover.svg')}
                          alt="content"
                          className={page.attachImg}
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>

                  <div className={page.messageFooter}>
                    <div className={page.reactionsInline}>
                      <button 
                        className={`${page.reactIconBtn} ${userReactions[c.id] === 'like' ? page.activeLike : ''}`}
                        onClick={() => react(c.id, 'like')}
                      >
                        <span className={page.emoji}>👍</span>
                        <span className={page.count}>{likes[c.id] ?? 0}</span>
                      </button>
                      <button 
                        className={`${page.reactIconBtn} ${userReactions[c.id] === 'dislike' ? page.activeDislike : ''}`}
                        onClick={() => react(c.id, 'dislike')}
                      >
                        <span className={page.emoji}>👎</span>
                        <span className={page.count}>{dislikes[c.id] ?? 0}</span>
                      </button>
                    </div>
                    <Link to={`/feed-capsule/${c.id}`} className={page.unpackBtn}>Распаковать</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && sorted.length > pageSize && (
            <div className={page.paginationMini}>
              <button disabled={pageIndex <= 1} onClick={() => setPageIndex(p => p - 1)}>←</button>
              <span>{pageIndex} / {Math.ceil(sorted.length / pageSize)}</span>
              <button disabled={pageIndex >= Math.ceil(sorted.length / pageSize)} onClick={() => setPageIndex(p => p + 1)}>→</button>
            </div>
          )}
        </div>
      </main>

      {/* МОДАЛКА ВЫНЕСЕНА ИЗ MAIN ЧТОБЫ FIXED РАБОТАЛ НА ВЕСЬ ЭКРАН */}
      {reportTarget && (
        <div className={page.modalOverlay}>
          <div className={page.modalBody}>
            <h3 className={page.modalTitle}>Пожаловаться</h3>
            <p className={page.muted}>Опишите причину нарушения в капсуле «{reportTarget.title}»</p>
            <textarea 
              className={page.modalInput} 
              value={reportText} 
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Текст жалобы..."
            />
            <div className={page.modalButtons}>
              <button className={page.cancelBtn} onClick={() => setReportTarget(null)}>Отмена</button>
              <button className={page.confirmBtn} onClick={() => void reportCapsule(reportTarget)}>Отправить</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PublicFeed;