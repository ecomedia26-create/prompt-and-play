import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertex = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`

// שמיים נפחיים: raymarching דרך שכבת עננים מבוססת fbm, עם שמש רכה.
// הגלילה מעלה את המצלמה ומעבירה אותה קדימה בין העננים, כמו מלאך שמרחף.
const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform vec2 uCursor;
  uniform float uClear;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p, int oct) {
    float f = 0.0, a = 0.5;
    for (int i = 0; i < OCTAVES; i++) {
      if (i >= oct) break;
      f += a * noise(p);
      p = p * 2.03 + vec3(0.13, 0.31, 0.71);
      a *= 0.5;
    }
    return f;
  }
  float density(vec3 p, int oct) {
    // ים של עננים: בסיס שטוח ב-y=-0.6, צמרות קומולוס שמתנפחות עד y≈1.6
    float h = smoothstep(-0.9, -0.2, p.y) * smoothstep(2.3, 0.1, p.y);
    vec3 wind = vec3(uTime * 0.03, 0.0, uTime * 0.05);
    // מסכת כיסוי בתדר נמוך יוצרת "איים" של עננים ענקיים עם שמיים פתוחים ביניהם
    float cover = noise((p + wind) * vec3(0.09, 0.0, 0.09));
    vec3 q = (p + wind) * vec3(0.42, 0.6, 0.42);
    float d = cover * 0.7 + fbm(q, oct) * 0.65 - 0.8 + h * 0.3;
    return clamp(d * 4.0 * h, 0.0, 1.0);
  }

  const vec3 SUN = normalize(vec3(-0.7, 0.45, -0.55));

  vec3 sky(vec3 rd) {
    float y = rd.y;
    vec3 top = vec3(0.16, 0.20, 0.48);      // תכלת-אינדיגו עמוק
    vec3 mid = vec3(0.45, 0.52, 0.92);      // תכלת חלומי
    vec3 hor = vec3(0.98, 0.80, 0.86);      // ורוד-אפרסק באופק
    vec3 c = mix(hor, mid, smoothstep(-0.05, 0.25, y));
    c = mix(c, top, smoothstep(0.25, 0.9, y));
    float s = max(dot(rd, SUN), 0.0);
    c += vec3(1.0, 0.86, 0.66) * (pow(s, 24.0) * 0.3 + pow(s, 600.0) * 1.0);
    return c;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    // מרחפים מעל ים העננים; הגלילה מעיפה אותנו קדימה עם ריחוף עדין למעלה ולמטה
    vec3 ro = vec3(uMouse.x * 0.3 + sin(uScroll * 0.8) * 0.4, 2.75 + sin(uScroll * 1.3) * 0.15, -uTime * 0.1 - uScroll * 2.2);
    vec3 rd = normalize(vec3(uv.x + uMouse.x * 0.06, uv.y - 0.16 + uMouse.y * 0.04, -1.1));

    // "חלון" רך בעננים סביב הסמן, כאילו הגולש מפזר אותם ביד
    float clearing = 1.0 - uClear * (1.0 - smoothstep(0.06, 0.3, length(uv - uCursor)));
    vec4 acc = vec4(0.0);
    // המצלמה תמיד מעל צמרות העננים (y=2.3): קרן שעולה למעלה רואה רק שמיים, וקרן שיורדת מתחילה ישר בצמרות
    float t = rd.y < 0.0 ? (ro.y - 2.3) / -rd.y : 99.0;
    t += 0.12 * hash(vec3(gl_FragCoord.xy, uTime));
    for (int i = 0; i < STEPS; i++) {
      if (acc.a > 0.97 || t > 40.0) break;
      vec3 p = ro + rd * t;
      // מדללים עננים צמודים למצלמה כדי לא להיתקע בתוך ערפל
      float d = density(p, OCTAVES) * smoothstep(1.0, 5.0, t) * clearing;
      if (d > 0.008) {
        float dl = density(p + SUN * 0.6, LIGHT_OCTAVES);
        float lit = exp(-dl * 3.2);
        float amb = smoothstep(-0.8, 1.6, p.y);
        vec3 shade = mix(vec3(0.30, 0.32, 0.62), vec3(0.62, 0.60, 0.88), amb);  // צל לבנדר-אינדיגו
        vec3 light = vec3(1.0, 0.95, 0.92);                                     // לבן חם מואר שמש
        vec3 col = mix(shade, light, lit);
        col += vec3(1.0, 0.78, 0.6) * pow(max(dot(rd, SUN), 0.0), 4.0) * 0.35 * lit;
        col = mix(col, sky(rd), 1.0 - exp(-t * 0.022));
        float a = d * 0.8;
        acc.rgb += (1.0 - acc.a) * a * col;
        acc.a += (1.0 - acc.a) * a;
      }
      t += max(STEP_MIN, t * 0.06);
    }
    vec3 col = acc.rgb + (1.0 - acc.a) * sky(rd);
    col = pow(col, vec3(0.95));
    gl_FragColor = vec4(col, 1.0);
  }
`

interface Props {
  lite: boolean
}

// רקע שמיים קבוע לכל האתר. מרונדר ברזולוציה מוקטנת (העננים רכים ממילא) כדי לשמור על 60fps.
export function CloudSky({ lite }: Props) {
  const mount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch {
      return // בלי WebGL נשאר רקע ה-CSS
    }
    const scale = lite ? 0.35 : 0.5
    renderer.setPixelRatio(scale)
    el.appendChild(renderer.domElement)

    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uCursor: { value: new THREE.Vector2(9, 9) },
      uClear: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
    }
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      defines: lite ? { STEPS: 24, OCTAVES: 3, LIGHT_OCTAVES: 2, STEP_MIN: '0.25' } : { STEPS: 44, OCTAVES: 5, LIGHT_OCTAVES: 3, STEP_MIN: '0.12' },
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    const scene = new THREE.Scene()
    scene.add(mesh)
    const camera = new THREE.Camera()

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      renderer.getDrawingBufferSize(uniforms.uRes.value)
    }
    window.addEventListener('resize', resize)
    resize()

    const mouse = new THREE.Vector2()
    const cursor = new THREE.Vector2(9, 9)
    let clearTarget = 0
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth
      const h = window.innerHeight
      mouse.set((e.clientX / w) * 2 - 1, -((e.clientY / h) * 2 - 1))
      cursor.set(((e.clientX / w) - 0.5) * (w / h), 0.5 - e.clientY / h)
      clearTarget = 0.8
    }
    if (!lite) window.addEventListener('pointermove', onMove, { passive: true })

    const clock = new THREE.Clock()
    let raf = 0
    let last = 0
    const frameGap = lite ? 1 / 30 : 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) return
      const t = clock.getElapsedTime()
      if (t - last < frameGap) return
      last = t
      uniforms.uTime.value = t
      const target = window.scrollY / Math.max(window.innerHeight, 1)
      uniforms.uScroll.value += (target - uniforms.uScroll.value) * 0.06
      uniforms.uMouse.value.lerp(mouse, 0.04)
      if (uniforms.uCursor.value.x > 8) uniforms.uCursor.value.copy(cursor)
      uniforms.uCursor.value.lerp(cursor, 0.12)
      uniforms.uClear.value += (clearTarget - uniforms.uClear.value) * 0.05
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      mesh.geometry.dispose()
      material.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [lite])

  return (
    <div
      ref={mount}
      aria-hidden="true"
      className="sky-fallback pointer-events-none fixed inset-0 -z-10 [&>canvas]:h-full [&>canvas]:w-full"
    />
  )
}
