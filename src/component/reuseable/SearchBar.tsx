import { Search } from "lucide-react"

type SearchBarProps = {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  className,
}) => {
  return (
    <div className={`relative w-full ${className || ""}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 size-4" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-md bg-base-200 border border-base-300 text-sm 
                   focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
    </div>
  )
}

export default SearchBar
