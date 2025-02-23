document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el mapa
    var map = L.map('map').setView([41.3937398218, 2.1595931864], 15);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Icono rojo para los marcadores
    var redIcon = L.icon({
        iconUrl: 'marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    // Cargar datos del JSON
    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                var coords = feature.geometry.coordinates;
                var marker = L.marker([coords[1], coords[0]], { icon: redIcon }).addTo(map);
                marker.bindPopup(`<b>Dirección:</b> ${feature.properties.NOM_CARRER} ${feature.properties.NUM_CARRER}`);
            });
        })
        .catch(error => console.error('Error cargando el JSON:', error));

    // Botón "Estoy aquí"
    document.getElementById('estoyAqui').addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                map.setView([lat, lng], 15);
                L.marker([lat, lng], { icon: redIcon }).addTo(map);
            }, function (error) {
                alert('Error al obtener la ubicación: ' + error.message);
            });
        } else {
            alert('Geolocalización no es soportada por este navegador.');
        }
    });

    // Botón "Seleccionar aquí"
    document.getElementById('seleccionarAqui').addEventListener('click', function () {
        map.once('click', function (e) {
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            L.marker([lat, lng], { icon: redIcon }).addTo(map);
            map.setView([lat, lng], 15);
        });
    });
});
