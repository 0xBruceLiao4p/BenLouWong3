"use strict";

const hamburger = document.querySelector(".searchBar__hamburger");
const closeHam = document.querySelector(".sidebar__close");
const sidebar = document.querySelector(".sidebar");
const sidebarOverlay = document.querySelector(".sidebar__overlay");
const preLoadCont = document.querySelector(".loader__container");
const defaultPos = [151.2057150002948, -33.87303520459041];

const stores = {
	type: "FeatureCollection",
	features: [
		{
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [151.1550074469862, -33.755056531730645],
			},
			properties: {
				title: "The Wyatt",
				address: "77 Werona Ave, Gordon",
				city: "Sydney",
				country: "Australia",
				postalCode: "2072",
				state: "NSW",
			},
		},
		{
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [151.15393561298666, -33.7560608225008],
			},
			properties: {
				title: "Pure Brew",
				address: "1/3 St Johns Ave, Gordon",
				city: "Sydney",
				country: "Australia",
				postalCode: "2072",
				state: "NSW",
			},
		},
		{
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [151.2053977942415, -33.865536805070235],
			},
			properties: {
				title: "Normcore Coffee",
				address: "Shop 1/37 York St",
				city: "Sydney",
				country: "Australia",
				postalCode: "2000",
				state: "NSW",
			},
		},
		{
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: [151.20964326707173, -33.88097863465398],
			},
			properties: {
				title: "Single O",
				address: "60-64 Reservoir St",
				city: "Surry Hills",
				country: "Australia",
				postalCode: "2010",
				state: "NSW",
			},
		},
	],
};

stores.features.forEach((store, i) => {
	store.properties.id = i;
});

mapboxgl.accessToken =
	"pk.eyJ1IjoiYmVubHciLCJhIjoiY2t2N2p1YTQ4OWtsbzJwbWFxbGlxeTR5aSJ9.h-C9wZFdtTINvHwcJXKfMg";

// ////////////// Side navigation functionality
const openMenu = function () {
	sidebar.classList.add("sidebar__active");
	sidebarOverlay.classList.add("sidebar__overlay--active");
};

const closeMenu = function () {
	sidebar.classList.remove("sidebar__active");
	sidebarOverlay.classList.remove("sidebar__overlay--active");
};

hamburger.addEventListener("click", openMenu);
closeHam.addEventListener("click", closeMenu);

// ////////////// Preloader

const preLoadClose = function () {
	preLoadCont.classList.add("loader__container--hidden");
};

// ////////////// Loading the map

const successLocation = function (position) {
	// console.log(position);
	setupMap([position.coords.longitude, position.coords.latitude]);
};

const errorLocation = function () {
	alert("Please enable location services for a better user experience!");
	setupMap(defaultPos);
};

const setupMap = function (center) {
	const map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/mapbox/streets-v11",
		center: center,
		zoom: 13,
	});
	//   Create Geocoder search bar
	const geocoder = new MapboxGeocoder({
		// Initialize the geocoder
		accessToken: mapboxgl.accessToken, // Set the access token
		setRouting: true,
		mapboxgl: mapboxgl, // Set the mapbox-gl instance
		marker: false, // Do not use the default marker style
		placeholder: "Enter Suburb",
		zoom: 13,
	});
	document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

	// Cafe functionality including popup, marker and card
	const addCafe = function () {
		//     Add feature cafes
		map.addLayer({
			id: "locations",
			type: "circle",
			/* Add a GeoJSON source containing place coordinates and information. */
			source: {
				type: "geojson",
				data: stores,
			},
		});
	};

	const createPopups = function (currentFeature) {
		const popUps = document.getElementsByClassName("mapboxgl-popup");
		/** Check if there is already a popup on the map and if so, remove it */
		if (popUps[0]) popUps[0].remove();

		const popup = new mapboxgl.Popup({ closeOnClick: false })
			.setLngLat(currentFeature.geometry.coordinates)
			.setHTML(
				`<h3 class='heading-3'>${currentFeature.properties.title}</h3><h4>${currentFeature.properties.address}</h4>`
			)
			.addTo(map);
	};

	const flyTo = function (currentFeature) {
		map.flyTo({
			center: currentFeature.geometry.coordinates,
			zoom: 15,
		});
	};

	const addMarkers = function () {
		for (const marker of stores.features) {
			/* Create a div element for the marker. */
			const el = document.createElement("div");
			/* Assign a unique `id` to the marker. */
			el.id = `markerCafe-${marker.properties.id}`;
			console.log(el.id);
			/* Assign the `marker` class to each marker for styling. */
			el.className = "markerCafe";

			new mapboxgl.Marker(el)
				.setLngLat(marker.geometry.coordinates)
				.addTo(map);

			el.addEventListener("click", function (e) {
				flyTo(marker);
				createPopups(marker);
			});
		}
	};

	const addStart = function () {
		const start = center;
		// Add starting point to the map
		map.addLayer({
			id: "locations",
			type: "circle",
			/* Add a GeoJSON source containing place coordinates and information. */
			source: {
				type: "geojson",
				data: start,
			},
		});
		const element = document.createElement("div");
		/* Assign the `marker` class to each marker for styling. */
		element.className = "markerUser";

		new mapboxgl.Marker(element).setLngLat(start).addTo(map);
	};

	const mapFunctions = function () {
		addCafe();
		addStart();
		addMarkers();
		setTimeout(preLoadClose);
	};

	map.on("load", mapFunctions);
};

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
	enableHighAccuracy: true,
});
