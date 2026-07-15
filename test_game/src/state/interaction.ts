import { useSyncExternalStore } from 'react';
import * as THREE from 'three';

/**
 * Shared interaction state (module singleton so it crosses the R3F <Canvas>
 * boundary). The controller writes the live player position every frame; an
 * in-scene manager reads it to detect proximity to a door/NPC and publishes the
 * current prompt, which a DOM overlay renders ("Press E to enter …").
 */
export const playerPos = new THREE.Vector3();

export interface Prompt {
  /** target id (house id, or 'exit' for leaving an interior). */
  id: string;
  label: string;
}

let prompt: Prompt | null = null;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function setPrompt(next: Prompt | null) {
  // avoid churn if unchanged
  if (next?.id === prompt?.id && next?.label === prompt?.label) return;
  prompt = next;
  emit();
}
export function getPrompt(): Prompt | null {
  return prompt;
}
export function usePrompt(): Prompt | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getPrompt,
    getPrompt,
  );
}
