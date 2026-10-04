import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// מטוס הנייר: הקמע של Prompt & Play. גיאומטריה פרוצדורלית (בלי קובץ מודל),
// מרחף בעננים ליד הסמן, נוטה בפניות וממריא למעלה כשגוללים.
function planeGeometry() {
  const nose = [0, 0, 1.25]
  const top = [0, 0.02, -0.8]
  const keel = [0, -0.28, -0.8]
  const left = [-0.95, 0.14, -0.85]
  const right = [0.95, 0.14, -0.85]
  const verts = [...nose, ...left, ...top, ...nose, ...top, ...right, ...nose, ...top, ...keel]
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  g.computeVertexNormals()
  return g
}

export function PaperPlane({ touch }: { touch: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
    camera.position.set(0, 0, 9)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7fd6, 1.6))
    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(3, 5, 4)
    scene.add(sun)

    const plane = new THREE.Mesh(
      planeGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide, flatShading: true }),
    )
    // קו כחול עדין לאורך השדרה, נגיעה של צבע המותג
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(plane.geometry, 1),
      new THREE.LineBasicMaterial({ color: 0x5ad8ff, transparent: true, opacity: 0.55 }),
    )
    plane.add(edge)
    const rig = new THREE.Group()
    rig.add(plane)
    rig.scale.setScalar(0.55)
    scene.add(rig)

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    // יעד במרחב: הסמן מוקרן למישור z=0
    const mouse = new THREE.Vector2(0.45, 0.25)
    const onMove = (e: PointerEvent) => mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    if (!touch) window.addEventListener('pointermove', onMove, { passive: true })
    const toWorld = (v: THREE.Vector2) => {
      const p = new THREE.Vector3(v.x, v.y, 0.5).unproject(camera)
      const dir = p.sub(camera.position).normalize()
      return camera.position.clone().add(dir.multiplyScalar(-camera.position.z / dir.z))
    }

    const pos = new THREE.Vector3(2.5, 1, 0)
    const vel = new THREE.Vector3()
    const look = new THREE.Object3D()
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 })
    const hero = document.getElementById('top')
    if (hero) io.observe(hero)

    const clock = new THREE.Clock()
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      // ממריא ונעלם ככל שגוללים מחוץ לגיבור
      const lift = Math.min(window.scrollY / (window.innerHeight * 0.8), 1)
      canvas.style.opacity = String(1 - lift)

      // מסלול: חג סביב הסמן במעגל רחב (במגע: שיוט חופשי)
      const base = touch ? new THREE.Vector3(Math.sin(t * 0.4) * 2.2, Math.sin(t * 0.7) * 0.9 + 0.6, 0) : toWorld(mouse)
      const target = base.add(new THREE.Vector3(Math.cos(t * 0.9) * 0.9, Math.sin(t * 1.3) * 0.35 + lift * 6, Math.sin(t * 0.9) * 0.8))
      const steer = target.sub(pos).multiplyScalar(2.2)
      vel.lerp(steer, 1 - Math.exp(-dt * 2.5))
      pos.addScaledVector(vel, dt)
      rig.position.copy(pos)

      // מסתכל לכיוון התנועה ונוטה בפנייה
      look.position.copy(pos)
      look.lookAt(pos.clone().add(vel.lengthSq() > 1e-4 ? vel : new THREE.Vector3(0, 0, 1)))
      rig.quaternion.slerp(look.quaternion, 1 - Math.exp(-dt * 6))
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, THREE.MathUtils.clamp(-vel.x * 0.35, -0.9, 0.9), 1 - Math.exp(-dt * 4))
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      renderer.dispose()
    }
  }, [touch])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5] h-full w-full" />
}
