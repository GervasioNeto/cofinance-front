import React from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchTerm }) => (
  <Input
    type="text"
    placeholder="Buscar por nome do grupo ou subgrupo..."
    value={searchTerm}
    onChange={(e) => onSearch(e.target.value)}
    className="h-10 w-full" 
  />
);

export default SearchBar;