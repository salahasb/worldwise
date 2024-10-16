import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Map.module.css";
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvents,
} from "react-leaflet";
import { useCities } from "../../contexts/CitiesContext";
import useGeoLocation from "../../hooks/useGeoLocation";
import Button from "../Button";
import { useUrlPosition } from "../../hooks/useUrlPosition";
import Flag from "react-world-flags";

function Map({ setShowSidebar }) {
	const {
		isLoading: isLoadingPosition,
		position: geoLocationPosition,
		getCoordinates,
	} = useGeoLocation();

	const [lat, lng] = useUrlPosition();

	const { cities } = useCities();

	const [mapPosition, setMapPosition] = useState([51.505, -0.09]);

	useEffect(() => {
		if (lat && lng) {
			setMapPosition([lat, lng]);
		}
	}, [lat, lng]);

	return (
		<div className={styles.mapContainer}>
			{/* for browser geolocation api */}
			{!geoLocationPosition && (
				<Button
					type="position"
					onClick={() =>
						getCoordinates((lat, lng) => setMapPosition([lat, lng]))
					}
				>
					{isLoadingPosition ? "loading..." : "Use your position"}
				</Button>
			)}

			{/* The Map */}
			<MapContainer
				center={mapPosition}
				zoom={9}
				scrollWheelZoom={true}
				className={styles.map}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
				/>

				{cities.map((city) => (
					<Marker
						position={[city.position.lat, city.position.lng]}
						key={city.id}
					>
						<Popup>
							<Flag
								code={city.emoji}
								alt={`${city.country} flag`}
								width={30}
								height={20}
								className={styles.flag}
							/>
							<span>{city.cityName}</span>
						</Popup>
					</Marker>
				))}

				<ChangeCenter position={mapPosition} />
				<DetectClick setShowSidebar={setShowSidebar} />
			</MapContainer>
		</div>
	);
}

function ChangeCenter({ position }) {
	const map = useMap();

	useEffect(() => {
		map.closePopup();

		map.setView(position);
	}, [map, position]);

	return null;
}

function DetectClick({ setShowSidebar }) {
	const navigate = useNavigate();

	useMapEvents({
		click: (e) => {
			setShowSidebar(true);
			navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
		},
	});
}

export default Map;
