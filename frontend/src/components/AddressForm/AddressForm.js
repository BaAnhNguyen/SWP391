import React, { useState, useEffect, useCallback, useRef } from "react";
import MapGL, { Marker } from "react-map-gl";
import { SearchBox } from "@mapbox/search-js-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = ""; //add token
const DEFAULT_LOCATION = { lat: 10.776889, lng: 106.700806 };

// Reverse geocode: tọa độ → place name
async function reverseGeocode(lng, lat) {
  console.log("Reverse geocoding for:", lng, lat);
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=vn&language=vi&types=address,poi,place`;
    console.log("API URL:", url);

    const resp = await fetch(url);
    const data = await resp.json();
    console.log("API Response:", data);

    if (data.features && data.features.length > 0) {
      const address = data.features[0].place_name;
      console.log("Found address:", address);
      return address;
    }
    const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    console.log("Using fallback:", fallback);
    return fallback;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// Geocode: place name → tọa độ
async function geocode(address) {
  console.log("Geocoding for:", address);
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${MAPBOX_TOKEN}&country=vn&language=vi&types=address,poi,place&limit=1`;
    console.log("Geocoding API URL:", url);

    const resp = await fetch(url);
    const data = await resp.json();
    console.log("Geocoding API Response:", data);

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const lat = feature.geometry.coordinates[1];
      const lng = feature.geometry.coordinates[0];
      const placeName = feature.place_name;
      console.log("Found coordinates:", { lat, lng, placeName });
      return { lat, lng, placeName };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

function AddressForm({ initialValue, onChange }) {
  const [address, setAddress] = useState(initialValue?.address || "");
  const [lat, setLat] = useState(
    initialValue?.location?.lat || DEFAULT_LOCATION.lat
  );
  const [lng, setLng] = useState(
    initialValue?.location?.lng || DEFAULT_LOCATION.lng
  );
  const [viewport, setViewport] = useState({
    latitude: lat,
    longitude: lng,
    zoom: 16,
  });

  const isUpdatingFromMarker = useRef(false);
  const lastSavedAddress = useRef("");
  const isUserTyping = useRef(false);
  const hasSelectedSuggestion = useRef(false);

  // Init từ parent
  useEffect(() => {
    const newAddress = initialValue?.address || "";
    const newLat = initialValue?.location?.lat || DEFAULT_LOCATION.lat;
    const newLng = initialValue?.location?.lng || DEFAULT_LOCATION.lng;

    setAddress(newAddress);
    setLat(newLat);
    setLng(newLng);
    setViewport((v) => ({
      ...v,
      latitude: newLat,
      longitude: newLng,
    }));
    lastSavedAddress.current = newAddress;
  }, [initialValue]);

  // Log mỗi khi address thay đổi
  useEffect(() => {
    console.log("Address changed to:", address);
  }, [address]);

  // Thông báo parent
  const notifyChange = useCallback(
    (newAddress, newLat, newLng) => {
      console.log("Notifying parent with:", { newAddress, newLat, newLng });
      onChange?.({
        address: newAddress,
        location: { lat: newLat, lng: newLng },
      });
      lastSavedAddress.current = newAddress;
    },
    [onChange]
  );

  // Khi user chọn suggestion từ SearchBox
  const handleRetrieve = (res) => {
    console.log("SearchBox retrieve full response:", res);
    if (res?.features?.[0]) {
      const feature = res.features[0];
      console.log("Selected feature:", feature);

      // Thử nhiều cách lấy tên địa điểm
      const newAddress =
        feature.place_name ||
        feature.properties?.full_address ||
        feature.properties?.name ||
        feature.text ||
        `${feature.geometry.coordinates[1].toFixed(
          6
        )}, ${feature.geometry.coordinates[0].toFixed(6)}`;

      const newLat = feature.geometry.coordinates[1];
      const newLng = feature.geometry.coordinates[0];
      console.log("SearchBox retrieve:", { newAddress, newLat, newLng });

      hasSelectedSuggestion.current = true;
      setAddress(newAddress);
      setLat(newLat);
      setLng(newLng);
      setViewport((v) => ({
        ...v,
        latitude: newLat,
        longitude: newLng,
      }));
      notifyChange(newAddress, newLat, newLng);
    }
  };

  // Kéo marker
  const onMarkerDragEnd = useCallback(
    async (event) => {
      console.log("Marker drag end event:", event);
      const { lng: newLng, lat: newLat } = event.lngLat;
      console.log("New coords:", newLat, newLng);

      isUpdatingFromMarker.current = true;
      setLat(newLat);
      setLng(newLng);
      setViewport((v) => ({
        ...v,
        latitude: newLat,
        longitude: newLng,
      }));

      setAddress("Đang tìm địa chỉ...");
      try {
        const placeName = await reverseGeocode(newLng, newLat);
        console.log("Reverse result:", placeName);
        setAddress(placeName);
        notifyChange(placeName, newLat, newLng);
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        const fallback = `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
        setAddress(fallback);
        notifyChange(fallback, newLat, newLng);
      } finally {
        isUpdatingFromMarker.current = false;
      }
    },
    [notifyChange]
  );

  // "Vị trí của tôi"
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return alert("Trình duyệt không hỗ trợ xác định vị trí!");
    }

    isUpdatingFromMarker.current = true;
    setAddress("Đang lấy vị trí hiện tại...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latNow = pos.coords.latitude;
        const lngNow = pos.coords.longitude;
        console.log("Current location:", latNow, lngNow);

        setLat(latNow);
        setLng(lngNow);
        setViewport((v) => ({
          ...v,
          latitude: latNow,
          longitude: lngNow,
        }));

        try {
          const placeName = await reverseGeocode(lngNow, latNow);
          console.log("Current location address:", placeName);
          setAddress(placeName);
          notifyChange(placeName, latNow, lngNow);
        } catch (error) {
          console.error("Failed to get address for current location:", error);
          const fallback = `${latNow.toFixed(6)}, ${lngNow.toFixed(6)}`;
          setAddress(fallback);
          notifyChange(fallback, latNow, lngNow);
        } finally {
          isUpdatingFromMarker.current = false;
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Không lấy được vị trí: " + err.message);
        setAddress(lastSavedAddress.current || "");
        isUpdatingFromMarker.current = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Khi user gõ tay
  const handleAddressChange = (newAddress) => {
    console.log("Address input changed:", newAddress);
    if (isUpdatingFromMarker.current) return; // Ngăn không cho update khi đang từ marker

    isUserTyping.current = true;
    hasSelectedSuggestion.current = false;
    setAddress(newAddress);
  };

  // Blur => geocode
  const handleAddressBlur = async () => {
    console.log("Blur with address:", address);
    console.log("isUpdatingFromMarker:", isUpdatingFromMarker.current);
    console.log("hasSelectedSuggestion:", hasSelectedSuggestion.current);
    console.log("lastSavedAddress:", lastSavedAddress.current);

    isUserTyping.current = false;

    // Nếu vừa chọn từ suggestion thì không cần geocode
    if (hasSelectedSuggestion.current) {
      hasSelectedSuggestion.current = false;
      return;
    }

    // Nếu đang update từ marker thì không cần geocode
    if (isUpdatingFromMarker.current) return;

    // Nếu không có địa chỉ hoặc giống với địa chỉ đã lưu
    if (!address.trim() || address === lastSavedAddress.current) {
      return;
    }

    // Nếu là tọa độ thô thì lưu luôn
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    if (coordPattern.test(address.trim())) {
      console.log("Raw coordinates detected, saving as is");
      notifyChange(address.trim(), lat, lng);
      return;
    }

    // Geocode địa chỉ
    const originalAddress = address;
    setAddress("Đang tìm tọa độ...");

    try {
      const result = await geocode(originalAddress.trim());
      if (result) {
        console.log("Geocoding successful:", result);
        setLat(result.lat);
        setLng(result.lng);
        setAddress(result.placeName);
        setViewport((v) => ({
          ...v,
          latitude: result.lat,
          longitude: result.lng,
        }));
        notifyChange(result.placeName, result.lat, result.lng);
      } else {
        console.log("Geocoding failed, keeping original address");
        setAddress(originalAddress);
        notifyChange(originalAddress, lat, lng);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress(originalAddress);
      notifyChange(originalAddress, lat, lng);
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
        }}
      >
        <div style={{ flex: 1 }}>
          <SearchBox
            accessToken={MAPBOX_TOKEN}
            value={address}
            onChange={handleAddressChange}
            onRetrieve={handleRetrieve}
            theme="light"
            placeholder="Nhập địa chỉ, ví dụ: 1A Đường 3/2, Quận 10..."
            country={["vn"]}
            proximity={{ longitude: lng, latitude: lat }}
            bbox={[102.144, 8.179, 109.464, 23.393]}
            language="vi"
            limit={5}
            types={["address", "poi", "place"]}
            style={{ width: "100%", minWidth: 320, fontSize: 16, padding: 10 }}
            inputProps={{
              style: {
                width: "100%",
                minWidth: 320,
                fontSize: 16,
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              },
              onBlur: handleAddressBlur,
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.target.blur();
                }
              },
            }}
          />
        </div>
        <button
          type="button"
          style={{ height: 40, minWidth: 120 }}
          onClick={handleGetCurrentLocation}
        >
          Vị trí của tôi
        </button>
      </div>
      <div style={{ margin: "16px 0", height: 320 }}>
        <MapGL
          mapboxAccessToken={MAPBOX_TOKEN}
          latitude={lat}
          longitude={lng}
          zoom={viewport.zoom}
          style={{
            width: "100%",
            height: 320,
            borderRadius: 8,
            boxShadow: "0 0 8px #ccc",
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onMove={(evt) =>
            setViewport({
              latitude: evt.viewState.latitude,
              longitude: evt.viewState.longitude,
              zoom: evt.viewState.zoom,
            })
          }
        >
          <Marker
            longitude={lng}
            latitude={lat}
            anchor="bottom"
            draggable
            onDragEnd={onMarkerDragEnd}
            color="red"
          />
        </MapGL>
      </div>
      <div style={{ marginTop: 8 }}>
        <small>
          Kéo marker hoặc nhập địa chỉ để xác nhận vị trí. Nhấn "Vị trí của tôi"
          nếu bạn đang đứng đúng địa điểm thực tế!
        </small>
      </div>
    </div>
  );
}

export default AddressForm;
