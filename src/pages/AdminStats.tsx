import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import catalog from '../styles/catalog.module.css';
import statsStyles from '../styles/adminStats.module.css';
import { fetchJson } from '../config/api';
import type { AdminStatsDto, TimeSeriesPointDto } from '../types/api';

function BarChart({ title, points }: { title: string; points: TimeSeriesPointDto[] }) {
  const max = useMemo(() => Math.max(1, ...points.map((p) => p.count)), [points]);
  return (
    <div className={statsStyles.chartCard}>
      <div className={statsStyles.chartTitle}>{title}</div>
      <div className={statsStyles.bars}>
        {points.map((p) => (
          <div key={p.date} className={statsStyles.barRow}>
            <span>{new Date(p.date).toLocaleDateString('ru-RU')}</span>
            <div className={statsStyles.barTrack}>
              <div className={statsStyles.barFill} style={{ width: `${(p.count / max) * 100}%` }} />
            </div>
            <span>{p.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const AdminStats: React.FC = () => {
  const [data, setData] = useState<AdminStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const d = await fetchJson<AdminStatsDto>('/api/admin/stats/getAnalytics');
        if (!cancelled) {
          setData(d);
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
  }, []);

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Админ: статистика</h1>
          <p>Агрегаты по пользователям и созданию капсул (данные с бэкенда, LINQ).</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
            </div>
          )}
          {error && <div className={catalog.errorState}>❌ {error}</div>}
          {data && (
            <div className={statsStyles.chartGrid}>
              <BarChart title="Регистрации пользователей по дням" points={data.userRegistrationsByDay} />
              <BarChart title="Создание капсул по дням" points={data.capsulesCreatedByDay} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminStats;
