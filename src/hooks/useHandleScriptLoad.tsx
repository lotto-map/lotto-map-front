import { useEffect, useRef, useState } from 'react';
import { useMapEventInfoStore } from '@/store/MapEventInfo';
import useGetBoundsCoords from './useGetBoundsCoords';
import { useMapStore } from '@/store/MapStore';
import useFetchData from './useFetchData';
import { LottoDataType } from '@/models/LottoDataType';
import { mapOptionsCallBack, SCRIPT_TYPE, SCRIPT_URL } from '@/constants/NaverMapScript';
import { geoLocationOptionsFalseAccuracy, geoLocationOptionsTrueAccuracy } from '@/constants/GeolocationOptions';

const useHandleScriptLoad = (
  setLottoStoreData?: (lottoStoreDataParam: LottoDataType[]) => void,
  setDeny?: React.Dispatch<React.SetStateAction<boolean>>,
  mapDivString?: string,
  needCurrentPosition?: boolean
) => {
  const { fetchData } = useFetchData();
  const { setMap } = useMapStore();
  const { zoomLevel, setLatitude, setLongitude, setZoomLevel, setBoundsCoords } = useMapEventInfoStore();
  const getBoundsCoords = useGetBoundsCoords();
  const [mapDiv, setMapDiv] = useState(document.getElementById(`${mapDivString}`));

  const userMarker = useRef<any>();
  const [mobile, setMobile] = useState<boolean>(!(window.innerWidth >= 769));

  const createMapInstance = async (lat: number, lng: number, mapDivStringParam: string, zoomLevelParam: number) => {
    if (window.naver && window.naver.maps) {
      const center = new window.naver.maps.LatLng(lat, lng);
      const mapInstance = new window.naver.maps.Map(
        document.getElementById(`${mapDivStringParam}`),
        mapOptionsCallBack(center, zoomLevelParam)
      );

      return mapInstance;
    }
  };

  const handleLocationWatch = async (position: any) => {
    if (!position) {
      // 위치 정보를 가져오지 못한 경우 처리
      // eslint-disable-next-line no-console
      console.log('위치 정보를 가져올 수 없습니다.');
      return;
    }
    const { coords } = position;
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);

    if (coords.latitude === 0 || coords.longitude === 0) return;

    if (window.naver && userMarker.current) {
      // eslint-disable-next-line no-new
      userMarker.current.setPosition(new window.naver.maps.LatLng(coords.latitude, coords.longitude));
    }
  };

  // 현재 위치정보 공유 허용시
  const handleLocationPermission = async (position: any) => {
    if (setDeny) {
      setDeny(false);
    }

    if (!position) {
      // 위치 정보를 가져오지 못한 경우 처리
      // eslint-disable-next-line no-console
      console.log('위치 정보를 가져올 수 없습니다.');
      return;
    }

    const { coords } = position;
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);

    if (coords.latitude === 0 || coords.longitude === 0) return;

    if (window.naver) {
      const initialMapInstance = await createMapInstance(
        coords.latitude,
        coords.longitude,
        `${mapDivString}`,
        zoomLevel
      );

      // 유저 실시간 위치
      if (window.naver && mobile) {
        const userLocationForNow = new window.naver.maps.LatLng(coords.latitude, coords.longitude);
        // eslint-disable-next-line no-new
        userMarker.current = new window.naver.maps.Marker({
          map: initialMapInstance,
          position: userLocationForNow,
          icon: {
            content: [
              `<div style="border-radius: 50%; display: flex; justify-content: center; align-items: center; width: 12px; height: 12px; border: 1px solid blue; animation: pulse 1s infinite alternate;">`,
              `  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 12px; height: 12px;">`,
              `    <circle cx="12" cy="12" r="11" fill="blue"/>`,
              `  </svg>`,
              `<div>`,
            ].join(''),
            size: new window.naver.maps.Size(12, 12),
            anchor: new window.naver.maps.Point(9, 9),
          },
        });
      }
      // 유저 실시간 위치

      const initialBoundsCoords = await getBoundsCoords(initialMapInstance);
      const zoom = initialMapInstance.getZoom();

      setBoundsCoords(initialBoundsCoords);
      setMap(initialMapInstance);
      setZoomLevel(zoom);

      if (setLottoStoreData) {
        // 위치정보 허용 시 초기 데이터 가져오기
        const locationData = await fetchData('post', '/lotto-stores', {
          northEastLat: initialBoundsCoords.coordsNorthEast.lat,
          northEastLon: initialBoundsCoords.coordsNorthEast.lng,
          southWestLat: initialBoundsCoords.coordsSouthWest.lat,
          southWestLon: initialBoundsCoords.coordsSouthWest.lng,
        });

        setLottoStoreData(locationData);
      }
    }
  };

  // 현재 위치정보 공유 거절시
  const handleLocationError = async () => {
    if (setDeny) {
      setDeny(true);
    }
    // eslint-disable-next-line no-console
    console.log('사용자가 위치 공유 권한을 거부했습니다.');

    if (window.naver) {
      const initialMapInstance = await createMapInstance(36.2, 127.8, `${mapDivString}`, 7);
      setMap(initialMapInstance);

      if (setLottoStoreData) {
        // 위치정보 거절 시 초기 데이터 가져오기
        const locationDenyData = await fetchData('post', '/lotto-stores', {
          northEastLat: 38,
          northEastLon: 132,
          southWestLat: 33,
          southWestLon: 124,
        });

        setLottoStoreData(locationDenyData);
      }
    }
  };

  const handleGetCurrentPosition = async () => {
    if (needCurrentPosition && window.naver && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await handleLocationPermission(position);

          if (mobile) {
            navigator.geolocation.watchPosition(
              handleLocationWatch,
              // eslint-disable-next-line no-console
              () => console.log('실시간 위치 공유 실패!!'),
              geoLocationOptionsTrueAccuracy
            );
          }
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error('현재 위치 잡기 실패!!', error);
          handleLocationError();
        },
        geoLocationOptionsFalseAccuracy
      );
    }
  };

  useEffect(() => {
    const mapDivElement = document.getElementById(`${mapDivString}`);
    setMapDiv(mapDivElement);

    const handleResize = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth >= 769) {
        setMobile(false);
      } else {
        setMobile(true);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const existingScripts = document.querySelectorAll<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);

    if (existingScripts.length > 0) {
      existingScripts.forEach((script) => {
        script.parentNode?.removeChild(script);
      });
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.type = SCRIPT_TYPE;
    script.async = true;
    script.onload = handleGetCurrentPosition;
    document.head.appendChild(script);
  }, [mapDiv]);

  useEffect(() => {
    setMapDiv(document.getElementById(`${mapDivString}`));
  }, []);

  return { createMapInstance };
};

export default useHandleScriptLoad;
