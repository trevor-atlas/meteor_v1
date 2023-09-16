interface SearchInputProps {
  text: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchInput({ text, onChange }: SearchInputProps) {
  return (
    <input
      className="search-input"
      type="text"
      value={text}
      onChange={onChange}
    />
  );
}
