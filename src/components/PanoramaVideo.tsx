import React, { useMemo } from "react";
import {
  BackSide,
  EquirectangularReflectionMapping,
  LinearFilter,
  sRGBEncoding
} from "three";

const PanoramaVideo = () => {
  const videoEl = document.getElementById("video360") as HTMLVideoElement;

  const renderMaterial = useMemo(() => {
    console.log("videoEl", videoEl);

    if (videoEl) {
      return (
        <meshBasicMaterial
          attach="material"
          side={BackSide}
          reflectivity={0}
          fog={false}
        >
          <videoTexture
            encoding={sRGBEncoding}
            mapping={EquirectangularReflectionMapping}
            minFilter={LinearFilter}
            magFilter={LinearFilter}
            attach="map"
            args={[videoEl]}
          />
        </meshBasicMaterial>
      );
    }
  }, [videoEl]);

  return (
    <mesh dispose={null}>
      <sphereGeometry attach="geometry" args={[500, 64, 32]} />
      {renderMaterial}
    </mesh>
  );
};

export default PanoramaVideo;
