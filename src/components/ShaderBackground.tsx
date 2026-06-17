"use client";

// Dependencies
import { useEffect, useRef } from 'react';

const VERTEX_SHADER_SOURCE = `
    attribute vec2 position;
    varying vec2 v_uv;
    void main() {
        v_uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER_SOURCE = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_resolution;
    varying vec2 v_uv;

    float rand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
      
        float a = rand(i);
        float b = rand(i + vec2(1.0, 0.0));
        float c = rand(i + vec2(0.0, 1.0));
        float d = rand(i + vec2(1.0, 1.0));
      
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 2.0;
      
        for(int i = 0; i < 6; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
        }
      
        return value;
    }

    void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0);
        uv = uv * aspect;

        vec2 mouseInfluence = u_mouse * aspect;
        float dist = length(uv - mouseInfluence);
        float mouseFactor = smoothstep(0.5, 0.0, dist);

        vec2 movement = vec2(u_time * 0.025, u_time * 0.012);

        // Rolling hill silhouette using fbm noise
        float hillNoise = fbm(vec2(uv.x * 1.2 + u_time * 0.01, 0.5));
        float hillLine = 0.32 + hillNoise * 0.10;
        float isAboveHills = smoothstep(hillLine - 0.02, hillLine + 0.06, v_uv.y);

        // Sky gradient: deeper blue at top, lighter near horizon
        vec3 skyTop    = vec3(0.18, 0.44, 0.82);
        vec3 skyHorizon = vec3(0.48, 0.72, 0.98);
        vec3 skyColor = mix(skyHorizon, skyTop, v_uv.y);

        // Soft clouds in sky using fbm
        float cloudNoise = fbm(uv * 2.2 + movement);
        float cloudMask = smoothstep(0.46, 0.70, cloudNoise + mouseFactor * 0.12);
        cloudMask *= isAboveHills;
        vec3 cloudColor = vec3(0.93, 0.96, 1.0);
        vec3 skyWithClouds = mix(skyColor, cloudColor, cloudMask * 0.72);

        // Rolling green hills with subtle brightness variation
        float hillVar = fbm(uv * 3.5 - movement * 0.6);
        vec3 hillDark   = vec3(0.22, 0.52, 0.10);
        vec3 hillBright = vec3(0.38, 0.70, 0.20);
        vec3 hillColor = mix(hillDark, hillBright, hillVar);

        vec3 finalColor = mix(hillColor, skyWithClouds, isAboveHills);
        finalColor += mouseFactor * 0.04;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

/**
 * WebGL Canvas component rendering custom fluid smoke wallpaper background.
 * Animates relative to screen dimensions and normalization mouse coordinates.
 *
 * @returns {React.ReactElement} - GPU accelerated backdrop
 */
export default function ShaderBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const animationFrameRef = useRef<number | null>(null);

    /**
     * Main shader logic for rendering fluid smoke effect.
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
        if (!gl) {
            console.warn("WebGL configuration could not be loaded on this current viewport context.");
            return;
        }

        /**
         * Helper function for compiling shaders.
         * 
         * @param {number} type - Type of shader
         * @param {string} source - Source code of shader
         * @returns {WebGLShader | null} - Compiled shader
         */
        const createShader = (type: number, source: string): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader build failure:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        // Compiling shaders
        const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
        const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program link failure:", gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Coordinate vertices setup for fullscreen triangle quad
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations fetch
        const uTimeLoc = gl.getUniformLocation(program, 'u_time');
        const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
        const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const width = canvas.clientWidth * dpr;
            const height = canvas.clientHeight * dpr;
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX / window.innerWidth,
                y: 1.0 - (e.clientY / window.innerHeight), // Invert Y axis for WebGL UV coordinate systems
            };
        };

        window.addEventListener('mousemove', handleMouseMove);

        const startTime = performance.now();

        const render = () => {
            const elapsedSeconds = (performance.now() - startTime) / 1000;

            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            // Bind dynamic uniform values
            gl.uniform1f(uTimeLoc, elapsedSeconds);
            gl.uniform2f(uMouseLoc, mouseRef.current.x, mouseRef.current.y);
            gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buffer);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ display: 'block' }}
        />
    );
}
