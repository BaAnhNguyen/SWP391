import React, { useState, useEffect, useCallback, useRef } from "react";
import MapGL, { Marker } from "react-map-gl";
import { SearchBox } from "@mapbox/search-js-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoibGg4b24iLCJhIjoiY21jZWVkaGd6MHQ3ZzJpcHVzbzUwZjM3NyJ9.HZOMcXUmOi8FtkFL7_DShQ";
const DEFAULT_LOCATION = { lat: 10.776889, lng: 106.700806 };

// Reverse geocode: tọa độ → place name
async function reverseGeocode(lng, lat) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=vn&language=vi&types=address,poi,place`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// Geocode: place name → tọa độ
async function geocode(address) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${MAPBOX_TOKEN}&country=vn&language=vi&types=address,poi,place&limit=1`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        placeName: feature.place_name,
      };
    }
    return null;
  } catch (error) {
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

  // === "Bắt" sự kiện click suggestion Mapbox ===
  useEffect(() => {
    // Lắng nghe sự kiện trên toàn document
    const handleDocumentMouseDown = async (e) => {
      const option = e.target.closest('[role="option"]');
      if (option) {
        // Lấy text hiển thị của suggestion
        const place = option.innerText;
        // Gọi geocode để lấy lại toạ độ (nếu place không đổi)
        const result = await geocode(place);
        if (result) {
          setAddress(result.placeName);
          setLat(result.lat);
          setLng(result.lng);
          setViewport((v) => ({
            ...v,
            latitude: result.lat,
            longitude: result.lng,
          }));
          if (onChange) {
            onChange({
              address: result.placeName,
              location: { lat: result.lat, lng: result.lng },
            });
          }
        }
      }
    };
    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [onChange]);
  // === END fix click chuột ===

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
  }, [initialValue]);

  const notifyChange = useCallback(
    (newAddress, newLat, newLng) => {
      onChange?.({
        address: newAddress,
        location: { lat: newLat, lng: newLng },
      });
    },
    [onChange]
  );

  // Khi chọn suggestion bằng bàn phím vẫn nhận từ Mapbox như cũ
  const handleRetrieve = (res) => {
    if (res?.features?.[0]) {
      const feature = res.features[0];
      const newAddress =
        feature.place_name ||
        feature.text ||
        `${feature.geometry.coordinates[1].toFixed(
          6
        )}, ${feature.geometry.coordinates[0].toFixed(6)}`;
      const newLat = feature.geometry.coordinates[1];
      const newLng = feature.geometry.coordinates[0];
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
      const { lng: newLng, lat: newLat } = event.lngLat;
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
        setAddress(placeName);
        notifyChange(placeName, newLat, newLng);
      } catch (error) {
        const fallback = `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
        setAddress(fallback);
        notifyChange(fallback, newLat, newLng);
      }
    },
    [notifyChange]
  );

  // "Vị trí của tôi"
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return alert("Trình duyệt không hỗ trợ xác định vị trí!");
    }
    setAddress("Đang lấy vị trí hiện tại...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latNow = pos.coords.latitude;
        const lngNow = pos.coords.longitude;
        setLat(latNow);
        setLng(lngNow);
        setViewport((v) => ({
          ...v,
          latitude: latNow,
          longitude: lngNow,
        }));

        try {
          const placeName = await reverseGeocode(lngNow, latNow);
          setAddress(placeName);
          notifyChange(placeName, latNow, lngNow);
        } catch (error) {
          const fallback = `${latNow.toFixed(6)}, ${lngNow.toFixed(6)}`;
          setAddress(fallback);
          notifyChange(fallback, latNow, lngNow);
        }
      },
      (err) => {
        alert("Không lấy được vị trí: " + err.message);
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
    setAddress(newAddress);
  };

  // Blur => geocode nếu cần
  const handleAddressBlur = async () => {
    if (!address.trim()) return;
    // Nếu là tọa độ thô thì lưu luôn
    const coordPattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    if (coordPattern.test(address.trim())) {
      notifyChange(address.trim(), lat, lng);
      return;
    }
    // Geocode địa chỉ
    const originalAddress = address;
    setAddress("Đang tìm tọa độ...");
    try {
      const result = await geocode(originalAddress.trim());
      if (result) {
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
        setAddress(originalAddress);
        notifyChange(originalAddress, lat, lng);
      }
    } catch (error) {
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
