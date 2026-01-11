"use client";

import { useState } from "react";
import { CalendarBotanical } from "@/components/designs/calendar-botanical";
import { CalendarMorningDew } from "@/components/designs/calendar-morning-dew";
import { CalendarCottage } from "@/components/designs/calendar-cottage";

type Occasion = {
  id: string;
  occasionType: string;
  date: string;
  recipient: {
    id: string;
    name: string;
    relationship: string | null;
  } | null;
};

interface DesignPreviewProps {
  occasions: Occasion[];
}

const designs = [
  {
    id: "botanical",
    name: "Botanical Garden",
    description: "Hand-drawn leaves, sage & blush, paper textures",
  },
  {
    id: "morning-dew",
    name: "Morning Dew",
    description: "Soft gradients, flowing waves, glass morphism",
  },
  {
    id: "cottage",
    name: "Cottage Core",
    description: "Washi tape, scrapbook feel, warm honey tones",
  },
];

export function DesignPreview({ occasions }: DesignPreviewProps) {
  const [activeDesign, setActiveDesign] = useState("botanical");

  return (
    <div className="space-y-6">
      {/* Design selector tabs */}
      <div className="flex flex-wrap gap-2">
        {designs.map((design) => (
          <button
            key={design.id}
            onClick={() => setActiveDesign(design.id)}
            className={`
              px-4 py-3 rounded-lg text-left transition-all duration-200
              ${
                activeDesign === design.id
                  ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                  : "bg-muted hover:bg-muted/80"
              }
            `}
          >
            <div className="font-medium text-sm">{design.name}</div>
            <div
              className={`text-xs mt-0.5 ${
                activeDesign === design.id
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              }`}
            >
              {design.description}
            </div>
          </button>
        ))}
      </div>

      {/* Active design preview */}
      <div className="transition-all duration-500">
        {activeDesign === "botanical" && (
          <CalendarBotanical occasions={occasions} />
        )}
        {activeDesign === "morning-dew" && (
          <CalendarMorningDew occasions={occasions} />
        )}
        {activeDesign === "cottage" && (
          <CalendarCottage occasions={occasions} />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          onClick={() => alert(`You selected: ${designs.find(d => d.id === activeDesign)?.name}`)}
        >
          Use This Design
        </button>
        <button
          className="px-6 py-2.5 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
