import { seed } from "@/db/seed";
import { Reveal } from "@/components/ui/Reveal";

export function Metrics() {
  const { metrics } = seed;

  return (
    <section className="wrap" aria-label="Career metrics">
      <Reveal>
        <div className="metrics">
          {metrics.map((metric) => (
            <div className="metric" key={metric.label}>
              <div className="metric-num">
                {metric.value}
                {metric.unit && <span className="unit">{metric.unit}</span>}
              </div>
              <div className="metric-label">{metric.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
