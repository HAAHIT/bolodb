let lenisInstance: any = null;

export async function initLenis(): Promise<any> {
  if (lenisInstance) return lenisInstance;
  const Lenis = (await import("lenis")).default;
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    smoothWheel: true,
  });

  const raf = (time: number) => {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  return lenisInstance;
}

export function getLenis() {
  return lenisInstance;
}

export function destroyLenis() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export function scrollTo(target: string | HTMLElement, options?: any) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, options);
  } else {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}
