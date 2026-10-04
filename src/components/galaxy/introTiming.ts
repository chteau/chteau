import * as THREE from 'three';

/**
 * Shared staging constants for the unified big-bang intro: the one camera
 * and star/galaxy "birth" timeline every piece of the galaxy scene reads
 * from, so the explosion, the reveal, and the handoff into normal orbiting
 * interaction all stay in lockstep within a single mounted scene.
 */

/** Wide establishing camera pose at the start of the bang. */
export const INTRO_START_POS = new THREE.Vector3(0, 5, 34);
/** The normal interactive scene's resting camera pose (orbit radius 9, height 2.8) — the dolly's destination. */
export const ORBIT_START_POS = new THREE.Vector3(0, 2.8, 9);

/** How long the wide shot holds before the camera starts easing in. */
export const INTRO_HOLD_END_S = 2.0;
/** When the ease-in-out dolly onto our galaxy finishes and normal orbiting takes over. */
export const INTRO_DOLLY_END_S = 4.6;

/** How long the "birth" wavefront takes to sweep from the origin out past the whole field. */
export const REVEAL_DURATION_S = 1.9;
/** The wavefront's reach — comfortably past both the background star shell and the farthest field galaxy. */
export const REVEAL_MAX_RADIUS = 48;
