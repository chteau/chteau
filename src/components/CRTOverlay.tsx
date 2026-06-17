/**
 * Settings configuration interface parameter for CRT overlay emulation.
 */
interface CRTOverlayProps {
    enabled: boolean;
    scanlines: boolean;
    vignette: boolean;
    flicker: boolean;
}

/**
 * Renders CRT screen retro effects including scanlines, custom vignette gradients, and light flicker.
 *
 * @example
 * <CRTOverlay enabled={true} scanlines={true} vignette={true} flicker={false} />
 *
 * @param {CRTOverlayProps} props - Layout configuring properties
 * @returns {React.ReactElement | null} - Interactive overlay layers or null if disabled
 */
export default function CRTOverlay({ enabled, scanlines, vignette, flicker }: CRTOverlayProps) {
    if (!enabled) return null;

    return (
        <>
            {/* Grid Scanlines - adjusted for softer contrast and reduced eye-strain */}
            {scanlines && (
                <div
                    className="pointer-events-none fixed inset-0 w-full h-full z-9999"
                    style={{
                        background: `
              linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.04) 50%),
              linear-gradient(90deg, rgba(255, 0, 0, 0.01), rgba(0, 255, 0, 0.005), rgba(0, 0, 255, 0.04))
            `,
                        backgroundSize: '100% 4px, 4px 100%',
                    }}
                />
            )}

            {/* Screen Vignette Corner Shadowing - softened to optimize viewing perimeter */}
            {vignette && (
                <div
                    className="pointer-events-none fixed inset-0 w-full h-full z-9998 shadow-[inset_0_0_60px_rgba(0,0,0,0.28)]"
                />
            )}

            {/* Retro Phosphor Screen Flicker effect - attenuated to minimize fatigue */}
            {flicker && (
                <div
                    className="pointer-events-none fixed inset-0 w-full h-full z-9997 bg-transparent"
                    style={{
                        animation: 'crt-flicker 0.4s infinite'
                    }}
                />
            )}

            <style>{`
        @keyframes crt-flicker {
          0% { opacity: 0.995; }
          50% { opacity: 1; }
          100% { opacity: 0.995; }
        }
      `}</style>
        </>
    );
}
