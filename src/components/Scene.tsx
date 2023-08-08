import Cube from "./Cube";
import PanoramaVideo from "components/PanoramaVideo";

const CustomScene = () => {
  return (
    <>
      <gridHelper />
      <axesHelper />
      <pointLight intensity={1.0} position={[5, 3, 5]} />
      <Cube />
      <PanoramaVideo />
    </>
  );
};

export default CustomScene;
