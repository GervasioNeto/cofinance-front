import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce'; 
import { Search } from 'lucide-react';
import SearchBar from '@/components/SearchBar'; 
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Wallet } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface GroupDTO {
  id: string;
  name: string;
  description?: string;
  parentGroup?: string; 
  users?: any[]; 
  transactions?: any[];
}

const GroupSearch = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<GroupDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  console.log('searchResults:', searchResults);

const fetchGroups = async (term: string) => {
  if (term.trim() === '' || term.length < 2) {
    setSearchResults([]);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    const data = await api.groups.search(term);
    console.log('Fetched groups:', data);

    // 🟢 Igual à página Groups.tsx — busca as transactions
    const groupsWithTransactions = await Promise.all(
      data.map(async (group) => {
        const transactions = await api.groups.getGroupTransactions(group.id);
        return {
          ...group,
          transactions: transactions || [],
        };
      })
    );

    setSearchResults(groupsWithTransactions);

  } catch (err) {
    setError('Erro ao buscar grupos.');
    toast.error('Falha na busca.');
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
};

  const debouncedFetchGroups = useCallback(
    debounce((term: string) => { // Tipagem explícita aqui
      fetchGroups(term);
    }, 500), 
    []
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    debouncedFetchGroups(term);
  };

  const renderContent = () => {
    if (error) {
        return <p className="text-destructive font-semibold">{error}</p>;
    }

    if (isLoading) {
        return <p className="text-muted-foreground">Buscando resultados...</p>;
    }

    if (searchTerm.length === 0) {
        return <p className="text-muted-foreground">Digite o nome ou a descrição para iniciar a busca.</p>;
    }

    if (searchResults.length === 0) {
        return <p className="text-muted-foreground">Nenhum resultado encontrado para "{searchTerm}".</p>;
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((group) => (
                <Card 
                  key={group.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                                <Wallet className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                                {group.description && (
                                    <CardDescription className="line-clamp-2 mt-1">
                                        {group.description}
                                    </CardDescription>
                                )}
                                {group.parentGroup && (
                                    <p className="text-sm text-primary/80 mt-1">
                                        Subgrupo de: {group.parentGroup}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{group.members?.length || 0} membros</span>
                            <span className="mx-1">•</span>
                            <span>{group.transactions?.length || 0} transações</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Buscar Grupos</h2>
            <p className="text-muted-foreground">
              Encontre grupos e subgrupos por nome ou descrição.
            </p>
          </div>
        </div>
        
        <div className="pt-2">
            <SearchBar 
                searchTerm={searchTerm} 
                onSearch={handleSearchChange} 
            />
        </div>

        <div className="py-4">
            {renderContent()}
        </div>
        
      </div>
    </Layout>
  );
};

export default GroupSearch;