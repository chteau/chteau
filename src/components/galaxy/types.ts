/**
 * One portfolio section. Most are represented by a decorative feature star
 * in the galaxy (see `sectionStars.ts`) — `blog`/`stars` are nav-only (no
 * star): `CameraRig` falls back to its normal ambient orbit when a focused
 * section has no registered star ref, so this is a safe, un-special-cased
 * addition.
 */
export type SectionId = 'projects' | 'github' | 'roblox' | 'bio' | 'contact' | 'blog' | 'stars';
