"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/types";
import { cn } from "@/lib/utils/cn";

export interface FaqAccordionProps {
  faqs: Faq[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-line border-line flex flex-col divide-y border-y">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="focus-ring flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="text-ink text-sm font-medium">{faq.question["zh-CN"]}</span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "text-ink-muted h-4 w-4 shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <p className="text-ink-muted pb-4 text-sm leading-6">{faq.answer["zh-CN"]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
