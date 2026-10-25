import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { Sparkles } from "lucide-react";

const Experience = createContext({
  quiet: false,
  toggle: () => {},
  reduced: false,
});
export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const [quiet, setQuiet] = useState(() => {
    try {
      return localStorage.getItem("finora-quiet") === "true";
    } catch {
      return false;
    }
  });
  const reduced = quiet || !!systemReduced;
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "quiet" : "playful";
    try {
      localStorage.setItem("finora-quiet", String(quiet));
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
  }, [quiet, reduced]);
  return (
    <Experience.Provider
      value={{ quiet, toggle: () => setQuiet((q) => !q), reduced }}
    >
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        {children}
      </MotionConfig>
    </Experience.Provider>
  );
}
export const useExperience = () => useContext(Experience);
export function MotionToggle() {
  const { quiet, toggle } = useExperience();
  return (
    <button
      className="icon-button motion-toggle"
      aria-label="Giảm chuyển động"
      aria-pressed={quiet}
      title={quiet ? "Bật hiệu ứng vui nhộn" : "Giảm chuyển động"}
      onClick={toggle}
    >
      <Sparkles size={19} />
    </button>
  );
}

/** Decorative illustration; all financial information remains in the real cards below. */
export function MoneyOrbit() {
  return (
    <div className="money-orbit" aria-hidden="true">
      <div className="orbit-ring" />
      <div className="orbit-ticket">
        <span>YOUR MONEY</span>
        <strong>your rules.</strong>
        <i>✦</i>
        <div className="ticket-chip" />
      </div>
      <div className="orbit-coin">₫</div>
      <div className="orbit-star">✳</div>
      <span className="orbit-caption">small steps. big energy.</span>
    </div>
  );
}
