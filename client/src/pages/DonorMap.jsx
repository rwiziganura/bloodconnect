import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { FunnelIcon } from "@heroicons/react/24/outline";
import api from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";
import ClusteredDonorMarkers from "../components/ClusteredDonorMarkers.jsx";

const RWANDA = [-1.9403, 29.8739];
const ZOOM = 8;

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function groupColor(bt) {
  if (!bt) return "#64748b";
  if (bt.startsWith("AB")) return "#9333ea";
  if (bt.startsWith("A")) return "#2563eb";
  if (bt.startsWith("B")) return "#2DC653";
  if (bt.startsWith("O")) return "#E63946";
  return "#64748b";
}

function pinIcon(hex) {
  return L.divIcon({
    className: "blood-pin leaflet-div-icon",
    html: `<div style="background:${hex};width:14px;height:14px;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.4)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -8],
  });
}

export default function DonorMap() {
  const { theme } = useTheme();
  const [donors, setDonors] = useState([]);
  const [cities, setCities] = useState([]);
  const [filters, setFilters] = useState({ types: [], city: "", availableOnly: true });
  const [mobileFilters, setMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = true;
    (async () => {
      try {
        const q = filters.availableOnly ? "" : "?available=0";
        const { data } = await api.get(`/api/public/donors${q}`);
        if (!c) return;
        setDonors(data.donors || []);
        const u = [...new Set((data.donors || []).map((d) => d.city).filter(Boolean))].sort();
        setCities(u);
      } finally {
        if (c) setLoading(false);
      }
    })();
    return () => {
      c = false;
    };
  }, [filters.availableOnly]);

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      if (filters.types.length > 0 && !filters.types.includes(d.blood_type)) {
        return false;
      }
      if (filters.city && d.city !== filters.city) return false;
      return true;
    });
  }, [donors, filters]);

  const buildIcon = useCallback((d) => pinIcon(groupColor(d.blood_type)), []);
  const popupHtml = useCallback(
    (d) =>
      `<div class="text-sm"><strong>${d.name}</strong><br/><span style="color:#E63946;font-weight:700">${d.blood_type}</span> · ${d.city}</div>`,
    []
  );

  const tileUrl =
    theme === "dark"
      ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png"
      : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution =
    theme === "dark"
      ? '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  function toggleType(t) {
    setFilters((f) => {
      let next = [...f.types];
      if (next.length === 0) next = [t];
      else if (next.includes(t)) next = next.filter((x) => x !== t);
      else next = [...next, t];
      return { ...f, types: next };
    });
  }

  return (
    <>
      <div className="relative flex min-h-[calc(100svh-4rem)] flex-col bg-bgLight dark:bg-bgDark lg:flex-row">
      <button
        type="button"
        onClick={() => setMobileFilters(true)}
        className="fixed bottom-20 right-4 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-glow-red lg:hidden"
        aria-label="Filters"
      >
        <FunnelIcon className="h-7 w-7" />
      </button>

      <AnimatePresence>
        {mobileFilters && (
          <motion.div
            className="fixed inset-0 z-[1100] bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileFilters(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`glass w-full shrink-0 border-r border-white/10 p-4 lg:flex lg:w-80 lg:flex-col ${
          mobileFilters
            ? "fixed inset-y-0 right-0 z-[1200] flex max-w-sm flex-col overflow-y-auto shadow-2xl"
            : "hidden lg:flex"
        }`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <span className="font-bold text-slate-900 dark:text-white">Filters</span>
          <button
            type="button"
            className="text-primary"
            onClick={() => setMobileFilters(false)}
          >
            Close
          </button>
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Blood type
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, types: [] }))}
            className={`min-h-[40px] rounded-lg border px-2 py-1 text-xs font-bold ${
              filters.types.length === 0
                ? "border-primary bg-primary/15 text-primary"
                : "border-slate-200 dark:border-white/10"
            }`}
          >
            All
          </button>
          {BLOOD.map((t) => {
            const on =
              filters.types.length === 0 || filters.types.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`min-h-[40px] rounded-lg border px-2 py-1 text-xs font-bold ${
                  on
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-slate-200 opacity-50 dark:border-white/10"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          City
        </p>
        <select
          value={filters.city}
          onChange={(e) =>
            setFilters((f) => ({ ...f, city: e.target.value }))
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-cardDark dark:text-white"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) =>
              setFilters((f) => ({ ...f, availableOnly: e.target.checked }))
            }
            className="h-4 w-4 rounded text-primary"
          />
          Available donors only
        </label>
        <p className="mt-6 text-sm font-bold text-slate-900 dark:text-white">
          Showing {filtered.length} donor{filtered.length === 1 ? "" : "s"}
        </p>
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm lg:max-h-[40vh]">
          {filtered.slice(0, 40).map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-slate-200/80 px-3 py-2 dark:border-white/10"
            >
              <span className="font-semibold text-slate-900 dark:text-white">
                {d.name}
              </span>
              <span className="text-primary"> · {d.blood_type}</span>
              <div className="text-xs text-slate-500">{d.city}</div>
            </li>
          ))}
        </ul>
      </aside>

      <div className="relative min-h-[50vh] flex-1 lg:min-h-[calc(100svh-5rem)]">
        {loading ? (
          <div className="flex h-full min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <MapContainer
            center={RWANDA}
            zoom={ZOOM}
            className="h-[50vh] w-full lg:absolute lg:inset-0 lg:h-full"
            scrollWheelZoom
          >
            <TileLayer attribution={tileAttribution} url={tileUrl} />
            <ClusteredDonorMarkers
              donors={filtered}
              buildIcon={buildIcon}
              popupHtml={popupHtml}
            />
          </MapContainer>
        )}
      </div>
    </div>
    </>
  );
}
