import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vMix;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float t = uTime * 0.35;
    // גל הד: פעימות רדיאליות שמתפשטות מהמרכז
    float r = length(p);
    float wave = sin(r * 2.4 - uTime * 1.6) * 0.18;
    p += normalize(p) * wave;
    p.x += sin(t + aSeed * 6.2831) * 0.08;
    p.y += cos(t * 1.3 + aSeed * 6.2831) * 0.08;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // דחייה עדינה מסמן העכבר
    vec2 toMouse = mv.xy - uMouse * 3.0;
    float d = length(toMouse);
    mv.xy += normalize(toMouse) * smoothstep(1.4, 0.0, d) * 0.55;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.0 + aSeed * 3.5) * uPixelRatio * (6.0 / -mv.z);
    vMix = clamp(p.y * 0.35 + 0.5 + wave, 0.0, 1.0);
    vAlpha = 0.35 + aSeed * 0.65;
  }
`

const fragment = /* glsl */ `
  varying float vMix;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float glow = smoothstep(0.5, 0.0, d);
    vec3 blue = vec3(0.0, 0.94, 1.0);
    vec3 purple = vec3(0.576, 0.2, 0.918);
    gl_FragColor = vec4(mix(purple, blue, vMix), glow * vAlpha);
  }
`

interface Props {
  interactive: boolean
}

// קנבס Three.js: ענן חלקיקים זוהר בצורת "הד" המגיב לעכבר. ניקוי מלא ב-unmount.
export function ParticleField({ interactive }: Props) {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
    const pixelRatio = Math.min(window.devicePixelRatio, interactive ? 2 : 1.5)
    renderer.setPixelRatio(pixelRatio)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.set(0, 0, 6.5)

    // נקודות על פני כדור + טבעות הד
    const count = interactive ? 9000 : 3500
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const ring = i % 5 === 0
      if (ring) {
        const a = Math.random() * Math.PI * 2
        const rr = 2.6 + Math.floor(Math.random() * 3) * 0.55 + Math.random() * 0.05
        positions.set([Math.cos(a) * rr, (Math.random() - 0.5) * 0.06, Math.sin(a) * rr], i * 3)
      } else {
        const u = Math.random() * 2 - 1
        const th = Math.random() * Math.PI * 2
        const rad = 1.6 + Math.random() * 0.25
        const s = Math.sqrt(1 - u * u)
        positions.set([s * Math.cos(th) * rad, u * rad, s * Math.sin(th) * rad], i * 3)
      }
      seeds[i] = Math.random()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(10, 10) },
      uPixelRatio: { value: pixelRatio },
    }
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geometry, material)
    points.rotation.x = 0.35
    scene.add(points)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h, false)
      camera.aspect = w / Math.max(h, 1)
      camera.position.z = camera.aspect < 0.8 ? 9 : 6.5
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const target = new THREE.Vector2(10, 10)
    const tilt = new THREE.Vector2()
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
    }
    const onLeave = () => target.set(10, 10)
    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true })
      el.addEventListener('pointerleave', onLeave)
    }

    // עוצרים רינדור כשהקנבס מחוץ למסך
    let visible = true
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const t = clock.getElapsedTime()
      uniforms.uTime.value = t
      uniforms.uMouse.value.lerp(target, 0.08)
      if (interactive && target.x < 5) tilt.lerp(target, 0.05)
      else tilt.lerp(new THREE.Vector2(0, 0), 0.03)
      points.rotation.y = t * 0.08 + tilt.x * 0.4
      points.rotation.x = 0.35 - tilt.y * 0.25
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [interactive])

  return <div ref={mount} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" aria-hidden="true" />
}
