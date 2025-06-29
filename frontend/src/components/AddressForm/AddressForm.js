import React, { useState, useEffect, useCallback } from "react";
import MapGL, { Marker } from "react-map-gl";
import { SearchBox } from "@mapbox/search-js-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoibGg4b24iLCJhIjoiY21jZWVkaGd6MHQ3ZzJpcHVzbzUwZjM3NyJ9.HZOMcXUmOi8FtkFL7_DShQ";
const DEFAULT_LOCATION = { lat: 10.776889, lng: 106.700806 };

// Reverse geocode: tọa độ → place name
async function reverseGeocode(lng, lat) {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&country=vn&language=vi&types=address,poi,place`;
    const resp = await fetch(url);
    const data = await resp.json();
    return data.features?.[0]?.place_name || null;
  } catch {
    return null;
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
    if (data.features?.[0]?.geometry?.coordinates) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng, placeName: data.features[0].place_name };
    }
    return null;
  } catch {
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
  const [addressValid, setAddressValid] = useState(true);
  const [isAddressBySuggestion, setIsAddressBySuggestion] = useState(false);

  // Sync initialValue khi có dữ liệu mới
  useEffect(() => {
    const a = initialValue?.address || "";
    const la = initialValue?.location?.lat || DEFAULT_LOCATION.lat;
    const lo = initialValue?.location?.lng || DEFAULT_LOCATION.lng;
    setAddress(a);
    setLat(la);
    setLng(lo);
    setViewport((v) => ({ ...v, latitude: la, longitude: lo }));
    setAddressValid(true);
    setIsAddressBySuggestion(false);
  }, [initialValue]);

  const notifyChange = useCallback(
    (newAddress, newLat, newLng) =>
      onChange?.({
        address: newAddress,
        location: { lat: newLat, lng: newLng },
      }),
    [onChange]
  );

  // Xử lý chọn suggestion (chuột hoặc bàn phím)
  const handleRetrieve = (res) => {
    const feat = res?.features?.[0];
    if (feat?.geometry?.coordinates) {
      const [newLng, newLat] = feat.geometry.coordinates;
      const newAddress =
        feat.place_name ||
        feat.text ||
        "Không rõ địa chỉ! Vui lòng kéo marker để chọn chính xác vị trí!";
      setAddress(newAddress);
      setLat(newLat);
      setLng(newLng);
      setViewport((v) => ({ ...v, latitude: newLat, longitude: newLng }));
      setAddressValid(true);
      setIsAddressBySuggestion(true);
      notifyChange(newAddress, newLat, newLng);
    } else {
      setAddress(
        "Không rõ địa chỉ! Vui lòng kéo marker để chọn chính xác vị trí!"
      );
      setAddressValid(false);
      setIsAddressBySuggestion(false);
    }
  };

  // Kéo marker: reverse geocode
  const onMarkerDragEnd = useCallback(
    async (event) => {
      const { lng: newLng, lat: newLat } = event.lngLat;
      setLat(newLat);
      setLng(newLng);
      setViewport((v) => ({ ...v, latitude: newLat, longitude: newLng }));
      setAddress("Đang tìm địa chỉ...");
      const place = await reverseGeocode(newLng, newLat);
      if (place) {
        setAddress(place);
        setAddressValid(true);
        setIsAddressBySuggestion(false);
        notifyChange(place, newLat, newLng);
      } else {
        setAddress("Không rõ địa chỉ!");
        setAddressValid(false);
        setIsAddressBySuggestion(false);
      }
    },
    [notifyChange]
  );

  // "Vị trí của tôi"
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation)
      return alert("Trình duyệt không hỗ trợ xác định vị trí!");
    setAddress("Đang lấy vị trí hiện tại...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latNow = pos.coords.latitude;
        const lngNow = pos.coords.longitude;
        setLat(latNow);
        setLng(lngNow);
        setViewport((v) => ({ ...v, latitude: latNow, longitude: lngNow }));
        const place = await reverseGeocode(lngNow, latNow);
        if (place) {
          setAddress(place);
          setAddressValid(true);
          setIsAddressBySuggestion(false);
          notifyChange(place, latNow, lngNow);
        } else {
          setAddress("Không rõ địa chỉ!");
          setAddressValid(false);
          setIsAddressBySuggestion(false);
        }
      },
      (err) => alert("Không lấy được vị trí: " + err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Gõ tay
  const handleAddressChange = (newAddr) => {
    setAddress(newAddr);
    setAddressValid(true);
    setIsAddressBySuggestion(false);
  };

  // Blur → geocode nếu nhập tay
  const handleAddressBlur = async () => {
    if (!address.trim() || isAddressBySuggestion) return;
    const coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (coordRegex.test(address)) {
      setAddress("Không rõ địa chỉ!");
      setAddressValid(false);
      return;
    }
    setAddress("Đang tìm tọa độ...");
    const result = await geocode(address.trim());
    if (result) {
      setLat(result.lat);
      setLng(result.lng);
      setAddress(result.placeName);
      setViewport((v) => ({
        ...v,
        latitude: result.lat,
        longitude: result.lng,
      }));
      setAddressValid(true);
      notifyChange(result.placeName, result.lat, result.lng);
    } else {
      setAddress(
        "Không rõ địa chỉ! Vui lòng kéo marker để chọn chính xác vị trí!"
      );
      setAddressValid(false);
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
        <small style={{ color: addressValid ? "#555" : "#d00" }}>
          {addressValid
            ? 'Kéo marker hoặc nhập địa chỉ để xác nhận vị trí. Nhấn "Vị trí của tôi" nếu bạn đang đứng đúng địa điểm thực tế!'
            : "Không rõ địa chỉ! Vui lòng kéo marker để chọn chính xác vị trí!"}
        </small>
      </div>
    </div>
  );
}

export default AddressForm;
