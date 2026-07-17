import { Link } from "react-router-dom";
import { Badge, Button } from "../../design-system";
import { useLandingContext } from "../../layout/LandingLayout";
import { useLocalization } from "../../localization";
import { trackEvent } from "../../platform/analytics";
import { ComparisonTable } from "./components/ComparisonTable";
import { ContrastPanel } from "./components/ContrastPanel";
import { GuidedQuestionPreview } from "./components/GuidedQuestionPreview";
import { useRevealSection } from "./motion/useRevealSection";
import "./motion/motion.css";
import "./HomePage.css";

// The 7-section sequence below is fixed by sdd/landing/02_information_architecture.md
// and identical across every A/B/C variant — only `content`'s copy differs
// per variant (sdd/context/07_landing_experiment_strategy.md). Do not add,
// remove, merge, or reorder sections here without updating that spec first.
export function HomePage() {
  const { t } = useLocalization();
  const { variant, assignmentSource } = useLandingContext();
  const content = t.landingVariants[variant];
  const shared = t.landing;

  const hero = useRevealSection<HTMLElement>();
  const gap = useRevealSection<HTMLElement>();
  const mechanism = useRevealSection<HTMLElement>();
  const sv = useRevealSection<HTMLElement>();
  const notSection = useRevealSection<HTMLElement>();
  const vision = useRevealSection<HTMLElement>();
  const closing = useRevealSection<HTMLElement>();

  const trackCta = (placement: string) => {
    trackEvent({
      eventName: "cta_clicked",
      pagePath: "/",
      properties: { cta: "open_workspace", placement, variant, assignmentSource },
    });
    trackEvent({
      eventName: "workspace_started",
      pagePath: "/",
      properties: { source: placement },
    });
  };

  const sectionClass = (inView: boolean) => `landing-section reveal-section${inView ? " in-view" : ""}`;

  return (
    <div className="landing-home">
      {/* Section 1 — Hero */}
      <section ref={hero.ref} className={`landing-hero ${sectionClass(hero.inView)}`}>
        <Badge tone="primary" className="reveal d0">
          {content.heroEyebrow}
        </Badge>
        <h1 className="landing-hero__title reveal d1">{content.heroTitle}</h1>
        <p className="landing-hero__lede reveal d2">{content.heroSubtitle}</p>
        <div className="landing-hero__actions reveal d3">
          <Link to="/app" onClick={() => trackCta("hero")}>
            <Button className="hover-lift">{content.ctaLabel}</Button>
          </Link>
          <a href="#vision" className="landing-secondary-link hover-fade">
            {content.secondaryLinkLabel}
          </a>
        </div>
      </section>

      <hr className="landing-divider" />

      {/* Section 2 — The Gap */}
      <section ref={gap.ref} className={sectionClass(gap.inView)}>
        <Badge>{content.gapEyebrow}</Badge>
        <h2 className="landing-section__title">{content.gapTitle}</h2>
        <p className="landing-section__support">{content.gapSupport}</p>
        <ContrastPanel
          items={[
            { label: shared.gapNoteToolTag, description: content.gapNoteToolBody },
            { label: shared.gapExecToolTag, description: content.gapExecToolBody },
            { label: shared.gapHyporaTag, description: content.gapHyporaBody, emphasized: true },
          ]}
        />
      </section>

      <hr className="landing-divider" />

      {/* Section 3 — How Hypora Thinks */}
      <section ref={mechanism.ref} className={sectionClass(mechanism.inView)}>
        <Badge>{shared.mechanismEyebrow}</Badge>
        <div className="landing-mechanism">
          <div className="landing-mechanism__copy">
            <h2 className="landing-section__title">{content.mechanismTitle}</h2>
            <p className="landing-section__support">{content.mechanismSupport}</p>
            <ul className="landing-mechanism__points">
              <li>{content.mechanismPoint1}</li>
              <li>{content.mechanismPoint2}</li>
              <li>{content.mechanismPoint3}</li>
            </ul>
          </div>
          <GuidedQuestionPreview
            questionLabel={shared.mechanismQuestionLabel}
            questionText={shared.mechanismQuestionText}
            chips={[shared.mechanismChip1, shared.mechanismChip2, shared.mechanismChip3, shared.mechanismChip4]}
            selectedIndex={1}
            resultLabel={shared.mechanismResultLabel}
          />
        </div>
      </section>

      <hr className="landing-divider" />

      {/* Section 4 — Structuring vs. Validating */}
      <section ref={sv.ref} className={sectionClass(sv.inView)}>
        <Badge>{content.svEyebrow}</Badge>
        <h2 className="landing-section__title">{content.svTitle}</h2>
        <p className="landing-section__support">{content.svSupport}</p>
        <ContrastPanel
          items={[
            { label: content.svStructuringLabel, description: content.svStructuringBody },
            {
              label: content.svValidatingLabel,
              description: content.svValidatingBody,
              content: (
                <div className="landing-sv-checks">
                  <div className="landing-sv-check landing-sv-check--open reveal-sm d1">
                    {shared.svCheckOpenLabel}
                  </div>
                  <div className="landing-sv-check landing-sv-check--done reveal-sm d2">
                    {shared.svCheckDoneLabel}
                  </div>
                </div>
              ),
            },
          ]}
        />
        <p className="landing-section__note">{content.svNote}</p>
      </section>

      <hr className="landing-divider" />

      {/* Section 5 — What Hypora Is Not */}
      <section ref={notSection.ref} className={sectionClass(notSection.inView)}>
        <Badge>{shared.notEyebrow}</Badge>
        <h2 className="landing-section__title">{content.notTitle}</h2>
        <ComparisonTable
          rows={[
            { label: content.notRow1Label, description: content.notRow1Desc },
            { label: content.notRow2Label, description: content.notRow2Desc },
            { label: content.notRow3Label, description: content.notRow3Desc },
            { label: content.notRow4Label, description: content.notRow4Desc },
          ]}
        />
        <p className="landing-section__note">{content.notScope}</p>
      </section>

      <hr className="landing-divider" />

      {/* Section 6 — Vision. Not a roadmap: no version numbers, no stage
          list, no feature checklist — see
          sdd/landing/02_information_architecture.md#vision-section-specification. */}
      <section id="vision" ref={vision.ref} className={`landing-vision ${sectionClass(vision.inView)}`}>
        <Badge className="reveal d0">{shared.visionEyebrow}</Badge>
        <h2 className="landing-section__title landing-vision__title reveal d1">{content.visionTitle}</h2>
        <p className="landing-section__support landing-vision__support reveal d2">{content.visionSupport}</p>
        <ul className="landing-vision__themes reveal d3">
          {content.visionThemes.map((theme) => (
            <li key={theme}>{theme}</li>
          ))}
        </ul>
      </section>

      {/* Section 7 — Closing */}
      <section ref={closing.ref} className={`landing-closing-wrap ${sectionClass(closing.inView)}`}>
        <div className="landing-closing reveal d0">
          <h2 className="landing-section__title">{content.closingTitle}</h2>
          <p className="landing-hero__lede">{content.closingLede}</p>
          <Link to="/app" onClick={() => trackCta("closing")}>
            <Button className="hover-lift">{content.ctaLabel}</Button>
          </Link>
          <p className="landing-closing__micro-copy">{content.microCopy}</p>
          <a href="#vision" className="landing-secondary-link hover-fade">
            {content.secondaryLinkLabel}
          </a>
        </div>
      </section>
    </div>
  );
}
