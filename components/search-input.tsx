"use client";

import { ChangeEvent } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? "Search tokens"}
        className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40"
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted-foreground">🔍</span>
    </div>
  );
}
