import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [myPosition, setMyPosition] = useState<[number, number] | null>(null);
  const navigate = useNavigate();

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
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition((pos) => {
      setMyPosition([pos.coords.latitude, pos.coords.longitude]);
    });
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const aa =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
  };

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
                        <br />
                        {myPosition && (
                          <>
                            Дистанция: {distanceKm(myPosition[0], myPosition[1], l.latitude, l.longitude).toFixed(2)} км
                            <br />
                            <button
                              type="button"
                              onClick={() => {
                                const dist = distanceKm(myPosition[0], myPosition[1], l.latitude, l.longitude);
                                if (dist <= 10) {
                                  navigate(`/feed-capsule/${l.capsuleId}`);
                                  return;
                                }
                                window.alert('Открытие доступно только в радиусе 10 км.');
                              }}
                            >
                              Открыть капсулу
                            </button>
                          </>
                        )}
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
