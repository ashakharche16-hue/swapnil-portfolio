import type { Metric } from "@/types/content";
import { Reveal } from "@/components/ui/Reveal";

export function Metrics({ data }: { data: Metric[] }) {
  const metrics = data;

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
