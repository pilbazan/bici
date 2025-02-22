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

    // Obtener la ubicación del usuario
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Añadir marcador de la ubicación del usuario
        L.marker([userLat, userLng]).addTo(map)
          .bindPopup('¡Estás aquí!')
          .openPopup();

        // Filtrar puntos cercanos (por ejemplo, 400 metros)
        const puntosCercanos = data.features.filter(feature => {
          const [lng, lat] = feature.geometry.coordinates; // Extraer coordenadas
          const distancia = calcularDistancia(userLat, userLng, lat, lng);
          return distancia <= 400; // Mostrar puntos dentro de 400 metros
        });

        // Mostrar puntos en el mapa y en la lista
        const listaPuntos = document.getElementById('lista-puntos');
        puntosCercanos.forEach(feature => {
          const [lng, lat] = feature.geometry.coordinates; // Extraer coordenadas
          const propiedades = feature.properties; // Extraer propiedades

          // Añadir marcador al mapa
          L.marker([lat, lng]).addTo(map)
            .bindPopup(`${propiedades.NOM_CARRER} ${propiedades.NUM_CARRER}`);

          // Añadir punto a la lista
          const item = document.createElement('div');
          item.textContent = `${propiedades.NOM_CARRER} ${propiedades.NUM_CARRER} (${calcularDistancia(userLat, userLng, lat, lng).toFixed(2)} metros)`;
          listaPuntos.appendChild(item);
        });
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
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