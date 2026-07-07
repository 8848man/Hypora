import "./Stepper.css";

export function Stepper({ steps }: { steps: { name: string; description: string }[] }) {
  return (
    <ol className="ds-stepper">
      {steps.map((step, i) => (
        <li key={step.name} className="ds-stepper__item">
          <span className="ds-stepper__index">{i + 1}</span>
          <div>
            <p className="ds-stepper__name">{step.name}</p>
            <p className="ds-stepper__description">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
