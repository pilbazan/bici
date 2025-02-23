// Cargar los datos del archivo JSON
fetch('datos.json')
  .then(response => response.json())
  .then(data => {
    // Inicializar el mapa
    const map = L.map('map').setView([41.3937, 2.1595], 15); // Centro en Barcelona (cambia según tu ubicación inicial)

    // Añadir capa de mapa (usando OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let userMarker = null; // Marcador de la ubicación del usuario
    let centerMarker = null; // Marcador del centro del mapa
    let puntosMarkers = []; // Array para almacenar los marcadores de los puntos

    // Función para añadir un marcador rojo en una posición
    function addRedMarker(lat, lng) {
      return L.marker([lat, lng], { icon: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', iconSize: [25, 41], iconAnchor: [12, 41] }) });
    }

    // Obtener la ubicación del usuario
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Añadir marcador de la ubicación del usuario
        userMarker = addRedMarker(userLat, userLng).addTo(map)
          .bindPopup('¡Estás aquí!')
          .openPopup();

        // Centrar el mapa en la ubicación del usuario
        map.setView([userLat, userLng], 15);

        // Añadir marcador rojo en el centro del mapa
        centerMarker = addRedMarker(userLat, userLng).addTo(map);
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
      }
    );

    // Evento para el botón 'Estoy aquí'
    document.getElementById('estoy-aqui').addEventListener('click', () => {
      if (userMarker) {
        const userLatLng = userMarker.getLatLng();
        map.setView(userLatLng, 15);
        if (centerMarker) {
          centerMarker.setLatLng(userLatLng);
        }
      }
    });

    // Evento para el botón 'Seleccionar aquí'
    document.getElementById('seleccionar-aqui').addEventListener('click', () => {
      const centerLatLng = map.getCenter();
      if (centerMarker) {
        centerMarker.setLatLng(centerLatLng);
      }

      // Filtrar puntos cercanos (por ejemplo, 400 metros)
      const puntosCercanos = data.features.filter(feature => {
        const [lng, lat] = feature.geometry.coordinates; // Extraer coordenadas
        const distancia = calcularDistancia(centerLatLng.lat, centerLatLng.lng, lat, lng);
        return distancia <= 400; // Mostrar puntos dentro de 400 metros
      });

      // Limpiar marcadores anteriores
      puntosMarkers.forEach(marker => map.removeLayer(marker));
      puntosMarkers = []; // Reiniciar el array de marcadores

      // Mostrar solo los puntos cercanos en el mapa
      puntosCercanos.forEach(feature => {
        const [lng, lat] = feature.geometry.coordinates; // Extraer coordenadas
        const propiedades = feature.properties; // Extraer propiedades

        // Añadir marcador al mapa
        const marker = L.marker([lat, lng]).addTo(map)
          .bindPopup(`${propiedades.NOM_CARRER} ${propiedades.NUM_CARRER}`);
        puntosMarkers.push(marker); // Guardar el marcador en el array
      });
    });
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
