import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { toonifyMaterial } from '../render/toon';

/** Describes how to mount + animate a rigged character GLB. */
export interface CharacterRig {
  url: string;
  scale: number;
  /** extra yaw if the model's "forward" isn't -Z. */
  yaw?: number;
  clips: { idle: string; walk: string; run: string; jump?: string };
  /** node names matching this are hidden (e.g. equipped weapons). */
  hideNodes?: RegExp;
}

/** Held props we hide so KayKit characters read as friendly, empty-handed folk. */
export const HIDE_WEAPONS = /wand|staff|spellbook|sword|shield|axe|dagger|crossbow|quiver|arrow|knife|mug|smoke/i;

/** All KayKit Adventurers/Skeletons share this rig shape (clip names + forward). */
export function kaykitRig(url: string, scale = 0.5): CharacterRig {
  return {
    url,
    scale,
    yaw: Math.PI, // KayKit forward is +Z; flip to face travel direction (−Z)
    clips: { idle: 'Idle', walk: 'Walking_A', run: 'Running_A', jump: 'Jump_Idle' },
    hideNodes: HIDE_WEAPONS,
  };
}

/** The player character — KayKit Mage (hat + cape), weapons hidden. */
export const MAGE_RIG: CharacterRig = kaykitRig('/models/kits/characters/Mage.glb');

/** NPC roster (challenge houses) — distinct KayKit characters, same rig shape. */
export const NPC_RIGS: Record<string, CharacterRig> = {
  knight: kaykitRig('/models/kits/characters/Knight.glb'),
  rogue: kaykitRig('/models/kits/characters/Rogue.glb'),
  rogueHooded: kaykitRig('/models/kits/characters/Rogue_Hooded.glb'),
  barbarian: kaykitRig('/models/kits/characters/Barbarian.glb'),
  skeletonWarrior: kaykitRig('/models/kits/characters/Skeleton_Warrior.glb'),
  skeletonMage: kaykitRig('/models/kits/characters/Skeleton_Mage.glb'),
  skeletonRogue: kaykitRig('/models/kits/characters/Skeleton_Rogue.glb'),
  skeletonMinion: kaykitRig('/models/kits/characters/Skeleton_Minion.glb'),
};

/**
 * Skeleton-aware clone of a loaded GLB scene: hides weapon nodes, toonifies every
 * material, enables shadows. Shared by the player and NPCs so they look identical.
 */
export function buildCharacterModel(scene: THREE.Object3D, rig: CharacterRig): THREE.Object3D {
  const cloned = cloneSkeleton(scene);
  cloned.traverse((o: THREE.Object3D) => {
    if (rig.hideNodes && o.name && rig.hideNodes.test(o.name)) {
      o.visible = false;
      return;
    }
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && mesh.material) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => toonifyMaterial(m))
        : toonifyMaterial(mesh.material as THREE.Material);
    }
  });
  return cloned;
}
