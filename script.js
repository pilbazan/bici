// Cargar los datos del archivo JSON
fetch('datos.json')
  .then(response => response.json())
  .then(data => {
    // Inicializar el mapa
    const map = L.map('map').setView([41.3937, 2.1595], 15); // Centro inicial en Barcelona

    // Añadir capa de mapa (usando OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Icono personalizado para "Estás aquí"
    const userIcon = L.icon({
      //iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png', // Ícono rojo
      iconUrl: 'marker-icon-red.pgn'
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });

    // Función para mostrar puntos cercanos
    function mostrarPuntosCercanos(lat, lng) {
      // Limpiar marcadores anteriores
      map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Filtrar puntos cercanos (por ejemplo, 400 metros)
      const puntosCercanos = data.features.filter(feature => {
        const [lngPunto, latPunto] = feature.geometry.coordinates;
        const distancia = calcularDistancia(lat, lng, latPunto, lngPunto);
        return distancia <= 400; // Mostrar puntos dentro de 400 metros
      });

      // Mostrar puntos en el mapa
      puntosCercanos.forEach(feature => {
        const [lngPunto, latPunto] = feature.geometry.coordinates;
        const propiedades = feature.properties;

        // Añadir marcador al mapa
        L.marker([latPunto, lngPunto]).addTo(map)
          .bindPopup(`${propiedades.NOM_CARRER} ${propiedades.NUM_CARRER}`);
      });
    }

    // Obtener la ubicación del usuario
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Centrar el mapa en la ubicación del usuario
        map.setView([userLat, userLng], 15);

        // Añadir marcador de la ubicación del usuario
        L.marker([userLat, userLng], { icon: userIcon }).addTo(map)
          .bindPopup('¡Estás aquí!')
          .openPopup();


        // Mostrar puntos cercanos
        mostrarPuntosCercanos(userLat, userLng);

        // Botón "Estoy aquí"
        document.getElementById('estoy-aqui').addEventListener('click', () => {
          map.setView([userLat, userLng], 15);
          mostrarPuntosCercanos(userLat, userLng);
        });

        // Botón "Centrar aquí"
        document.getElementById('centrar-aqui').addEventListener('click', () => {
          const center = map.getCenter();
          mostrarPuntosCercanos(center.lat, center.lng);
        });
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        alert('No se pudo obtener tu ubicación. Asegúrate de permitir el acceso a la ubicación.');
      }
    );
  })
  .catch(error => console.error('Error al cargar los datos:', error));

// Función para calcular la distancia entre dos puntos (en metros)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
