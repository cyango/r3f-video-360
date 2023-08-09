import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as three from 'three';

const Cube = () => {
  const cube = useRef<three.Mesh>();

  useFrame(() => {
    cube.current!.rotation.x += 0.01;
    cube.current!.rotation.y += 0.01;
  });

  return (
    // @ts-ignore
    <mesh ref={cube}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#0391BA" />
    </mesh>
  );
};

export default Cube;
