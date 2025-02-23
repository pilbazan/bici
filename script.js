document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([41.3937398218, 2.1595931864], 15); // Centrado en las coordenadas iniciales

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var redIcon = L.icon({
        iconUrl: 'marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    fetch('datos.json')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                var coords = feature.geometry.coordinates;
                var marker = L.marker([coords[1], coords[0]], {icon: redIcon}).addTo(map);
                marker.bindPopup(`<b>Dirección:</b> ${feature.properties.NOM_CARRER} ${feature.properties.NUM_CARRER}`);
            });
        });

    document.getElementById('estoyAqui').addEventListener('click', function() {
        navigator.geolocation.getCurrentPosition(function(position) {
            map.setView([position.coords.latitude, position.coords.longitude], 15);
            L.marker([position.coords.latitude, position.coords.longitude], {icon: redIcon}).addTo(map);
        });
    });

    document.getElementById('seleccionarAqui').addEventListener('click', function() {
        map.once('click', function(e) {
            L.marker([e.latlng.lat, e.latlng.lng], {icon: redIcon}).addTo(map);
            map.setView([e.latlng.lat, e.latlng.lng], 15);
        });
    });
});
