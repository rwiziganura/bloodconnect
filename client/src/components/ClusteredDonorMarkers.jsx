import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export default function ClusteredDonorMarkers({ donors, buildIcon, popupHtml }) {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current = null;
    }
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 56,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });
    donors.forEach((d) => {
      const lat = Number(d.location_lat);
      const lng = Number(d.location_lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const m = L.marker([lat, lng], { icon: buildIcon(d) });
      m.bindPopup(popupHtml(d));
      cluster.addLayer(m);
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [donors, map, buildIcon, popupHtml]);

  return null;
}
