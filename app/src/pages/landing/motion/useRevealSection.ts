import { useEffect, useRef, useState } from "react";

// One IntersectionObserver per Landing section — never per individual
// element — per sdd/landing/06_motion_system.md's Motion Principles ("one
// animated 'beat' per section") and Motion Rhythm rule ("plays once per page
// load ... never replays"). A section applies the returned `inView` as the
// `in-view` class on a `.reveal-section` root; every descendant `.reveal`/
// `.reveal-sm`/etc. utility (motion.css) reads that ancestor state via a CSS
// selector, so no motion state is threaded down as props to any component —
// consistent with sdd/landing/04_component_contracts.md's "component itself
// holds no animation logic" rule for every Landing-owned component.
export function useRevealSection<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}
