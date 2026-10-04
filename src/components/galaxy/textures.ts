import * as THREE from 'three';

/**
 * Circular glow (white-hot core fading into `color`) plus a 4-point
 * diffraction-spike cross — used for bright "hero" stars (the 5 clickable
 * feature stars) so they read as a sparkling point of light rather than a
 * plain blurred dot.
 */
export function createFlareTexture(color = '#ffffff', size = 256): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const c = size / 2;

    const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
    glow.addColorStop(0, 'rgba(255,255,255,1)');
    glow.addColorStop(0.16, color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(c, c);
    for (const angle of [0, Math.PI / 2]) {
        ctx.save();
        ctx.rotate(angle);
        const spike = ctx.createLinearGradient(-c, 0, c, 0);
        spike.addColorStop(0, 'rgba(255,255,255,0)');
        spike.addColorStop(0.5, 'rgba(255,255,255,0.75)');
        spike.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = spike;
        ctx.fillRect(-c, -size * 0.006, size, size * 0.012);
        ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}
