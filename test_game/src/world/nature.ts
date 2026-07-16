import { useGLTF } from '@react-three/drei';

const K = '/models/kits/nature/';

export interface Variant { url: string; names: string[]; }

/** CC0 Quaternius Ultimate Stylized Nature Pack — cluster GLBs, one child per variant. */
export const TREE_VARIANTS: Variant[] = [
  { url: K + 'trees.glb', names: ['NormalTree_1', 'NormalTree_2', 'NormalTree_3', 'NormalTree_4', 'NormalTree_5'] },
  { url: K + 'maple-trees.glb', names: ['MapleTree_1', 'MapleTree_2', 'MapleTree_3', 'MapleTree_4', 'MapleTree_5'] },
  { url: K + 'birch-trees.glb', names: ['BirchTree_1', 'BirchTree_2', 'BirchTree_3', 'BirchTree_4', 'BirchTree_5'] },
  { url: K + 'pine-trees.glb', names: ['PineTree_1', 'PineTree_2', 'PineTree_3', 'PineTree_4', 'PineTree_5'] },
];

export const BUSH_VARIANTS: Variant[] = [
  { url: K + 'bushes.glb', names: ['Bush', 'Bush_Flowers', 'Plant_1'] },
  { url: K + 'flower-bushes.glb', names: ['Plant_2', 'Plant_Flowers', 'Petals_1'] },
];

export const ROCK_VARIANT: Variant = {
  url: K + 'rocks.glb', names: ['Rock_1', 'Rock_2', 'Rock_3', 'Rock_4', 'Rock_5'],
};

export const GRASS_VARIANT: Variant = {
  url: K + 'grass.glb', names: ['Grass_Large_Extruded', 'Grass_Small'],
};

export const FLOWER_VARIANT: Variant = {
  url: K + 'flowers.glb', names: ['Flower_1_Clump', 'Flower_2_Clump', 'Flower_3_Clump', 'Flower_4_Clump', 'Flower_5_Clump'],
};

// warm up the cache so foliage doesn't pop in
[...TREE_VARIANTS, ...BUSH_VARIANTS, ROCK_VARIANT, GRASS_VARIANT, FLOWER_VARIANT].forEach((v) => useGLTF.preload(v.url));
