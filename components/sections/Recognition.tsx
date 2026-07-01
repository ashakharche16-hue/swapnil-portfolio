import { Fragment } from "react";
import { seed } from "@/db/seed";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/SectionHead";
import type { RecItem } from "@/types/content";

function RecRow({ item }: { item: RecItem }) {
  return (
    <div className="rec-item">
      <span className="what">{item.what}</span>
      <span className="by">{item.by}</span>
    </div>
  );
}

export function Recognition() {
  const { recognition } = seed;

  return (
    <section className="block" id="recognition">
      <div className="wrap">
        <Reveal>
          <SectionHead heading={recognition.heading} />
        </Reveal>

        <Reveal className="rec-grid">
          {recognition.columns.map((column) => (
            <div className="rec-col" key={column.heading}>
              <h3>{column.heading}</h3>
              {column.items.map((item) => (
                <RecRow key={item.what} item={item} />
              ))}
              {column.extraHeading && (
                <Fragment>
                  <h3 className="stacked">{column.extraHeading}</h3>
                  {column.extraItems?.map((item) => (
                    <RecRow key={item.what} item={item} />
                  ))}
                </Fragment>
              )}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
