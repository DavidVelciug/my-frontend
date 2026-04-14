import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import layout from '../styles/layout.module.css';
import page from '../styles/pageSection.module.css';
import mapStyles from '../styles/memoryMap.module.css';
import catalog from '../styles/catalog.module.css';
import { fetchJson } from '../config/api';
import type { CapsuleLocationDto, TimeCapsuleDto } from '../types/api';

const MemoryMap: React.FC = () => {
  const [locations, setLocations] = useState<CapsuleLocationDto[]>([]);
  const [capsules, setCapsules] = useState<TimeCapsuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const DefaultIcon = L.icon({
      iconRetinaUrl: iconRetina,
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [loc, cap] = await Promise.all([
          fetchJson<CapsuleLocationDto[]>('/api/capsulelocation/getAll'),
          fetchJson<TimeCapsuleDto[]>('/api/timecapsule/getAll'),
        ]);
        if (!cancelled) {
          setLocations(loc);
          setCapsules(cap);
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

  const titleById = useMemo(
    () => Object.fromEntries(capsules.map((c) => [c.id, c.title])),
    [capsules],
  );

  const center: [number, number] =
    locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : [48.8566, 2.3522];

  return (
    <div className={layout.pageWrapper}>
      <Header />
      <main className={layout.mainContent}>
        <div className={page.pageHeader}>
          <h1>Карта воспоминаний</h1>
          <p>Привяжите капсулу к месту: «открой это, когда будешь здесь».</p>
        </div>
        <div className={`${page.section} ${layout.container}`}>
          {loading && (
            <div className={catalog.loadingState}>
              <div className={catalog.loader} />
              <p>Загружаем точки…</p>
            </div>
          )}
          {error && (
            <div className={catalog.errorState}>
              <p>❌ {error}</p>
            </div>
          )}
          {!loading && !error && (
            <>
              <p className={page.muted}>
                На карте отмечены капсулы с геопривязкой. Добавить точку можно через API{' '}
                <code>/api/capsulelocation</code> после создания капсулы.
              </p>
              <div className={mapStyles.mapWrap}>
                <MapContainer center={center} zoom={locations.length ? 12 : 5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {locations.map((l) => (
                    <Marker key={l.id} position={[l.latitude, l.longitude]}>
                      <Popup>
                        <strong>{titleById[l.capsuleId] ?? `Капсула #${l.capsuleId}`}</strong>
                        <br />
                        {l.placeLabel}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <p className={mapStyles.mapHint}>Тайлы © OpenStreetMap contributors</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MemoryMap;
