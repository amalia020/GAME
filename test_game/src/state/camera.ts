import type { Camera } from 'three';

/** The live scene camera, published each frame from inside the Canvas so DOM
 *  overlays (e.g. house name labels) can project world points to the screen. */
export const cameraRef: { cam: Camera | null } = { cam: null };
