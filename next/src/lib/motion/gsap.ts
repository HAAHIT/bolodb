let gsapInstance: any = null;

export async function loadGsap(): Promise<any> {
  if (gsapInstance) return gsapInstance;
  const gsap = (await import("gsap")).default;
  const { default: ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  gsapInstance = gsap;
  return gsapInstance;
}
