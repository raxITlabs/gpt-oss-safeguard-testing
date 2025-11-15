"use client";

import { useEffect, useState } from "react";

interface DateDisplayProps {
  format?: "full" | "year";
}

export function DateDisplay({ format = "full" }: DateDisplayProps) {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    if (format === "full") {
      setDate(
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    } else {
      setDate(new Date().getFullYear().toString());
    }
  }, [format]);

  return <>{date}</>;
}

