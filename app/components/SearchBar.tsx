import React from "react";

interface SearchBarProps {
  query: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, onChange }) => {
  return (
    <div
      className="m-auto flex flex-col md:flex-row items-center gap-5 p-5"
      role="search"
    >
      <label htmlFor="nodeSearch" className="sr-only">
        Filter Nodes by Label
      </label>
      <input
        id="nodeSearch"
        value={query}
        onChange={onChange}
        type="text"
        className="rounded-2xl text-slate-500 text-sm pl-4 py-2"
        placeholder="Type a node label to filter"
        aria-label="Filter Nodes"
      />
    </div>
  );
};
