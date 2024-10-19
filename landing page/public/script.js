let map;
let platform;
let ui;

function initMap() {
    platform = new H.service.Platform({
        'apikey': 'YOUR_HERE_API_KEY'
    });

    const defaultLayers = platform.createDefaultLayers();

    map = new H.Map(
        document.getElementById('map-container'),
        defaultLayers.vector.normal.map,
        {
            zoom: 10,
            center: { lat: 0, lng: 0 }
        }
    );

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    ui = H.ui.UI.createDefault(map, defaultLayers);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                map.setCenter({ lat: latitude, lng: longitude });
                fetchNearbyStations(latitude, longitude);
            },
            error => {
                console.error('Error getting user location:', error);
            }
        );
    }
}

function fetchNearbyStations(lat, lon) {
    fetch(`/api/stations?lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            displayStations(data.items);
            addStationsToMap(data.items);
        })
        .catch(error => {
            console.error('Error fetching nearby stations:', error);
        });
}

function displayStations(stations) {
    const stationList = document.getElementById('station-list');
    stationList.innerHTML = '';

    stations.forEach(station => {
        const stationElement = document.createElement('div');
        stationElement.classList.add('station-item');
        stationElement.innerHTML = `
            <div class="station-name">${station.title}</div>
            <div class="station-address">${station.address.label}</div>
            <div class="station-distance">${station.distance} meters</div>
        `;
        stationList.appendChild(stationElement);
    });
}

function addStationsToMap(stations) {
    stations.forEach(station => {
        const marker = new H.map.Marker({
            lat: station.position.lat,
            lng: station.position.lng
        });
        map.addObject(marker);
    });
}

document.getElementById('search-button').addEventListener('click', () => {
    const locationInput = document.getElementById('location-input').value;
    if (locationInput) {
        const geocodingParams = {
            q: locationInput
        };

        const geocoder = platform.getGeocodingService();
        geocoder.geocode(geocodingParams, result => {
            if (result.items.length > 0) {
                const location = result.items[0].position;
                map.setCenter(location);
                fetchNearbyStations(location.lat, location.lng);
            } else {
                alert('Location not found. Please try again.');
            }
        }, error => {
            console.error('Geocoding error:', error);
        });
    }
});

window.onload = initMap;