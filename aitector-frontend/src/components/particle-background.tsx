"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    // Create particle system with custom shader
    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    // Color palette - purple/pink gradient
    const palette = [
      new THREE.Color(0x8b5cf6), // violet-500
      new THREE.Color(0xa78bfa), // violet-400
      new THREE.Color(0xc4b5fd), // violet-300
      new THREE.Color(0xe879f9), // fuchsia-400
      new THREE.Color(0xf0abfc), // fuchsia-300
    ];

    // Initialize particles in spherical distribution
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Spherical coordinates for natural distribution
      const radius = 40 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Assign colors from palette
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 1;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    // Custom shader material for organic movement
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        attribute float phase;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        uniform float pixelRatio;
        
        // Simple noise function
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
        }
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Add wave-like motion
          float n = noise(pos * 0.02 + time * 0.1);
          pos += normalize(pos) * sin(time + phase) * 2.0;
          pos.x += sin(time * 0.3 + phase) * 5.0;
          pos.y += cos(time * 0.2 + phase * 1.5) * 5.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Pulsing size
          float sizeFactor = 1.0 + sin(time * 2.0 + phase) * 0.3;
          gl_PointSize = size * sizeFactor * pixelRatio * (300.0 / -mvPosition.z);
          
          // Fade based on distance
          vAlpha = smoothstep(150.0, 50.0, -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          // Circular particles with soft edges
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft glow
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 1.5) * vAlpha;
          
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let time = 0;
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.005;
      
      material.uniforms.time.value = time;
      
      // Slow rotation for dynamic feel
      particles.rotation.y = time * 0.05;
      particles.rotation.x = Math.sin(time * 0.1) * 0.2;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  );
}
