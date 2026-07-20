import { Header } from '../components/Header';
import { AdminNav } from '../components/AdminNav';
import { TableMenu } from '../components/TableMenu';
import { TerritoriesTable } from '../components/TerritoriesTable';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminNav />
      
      <main className="p-6">
        <div className="max-w-[1400px] mx-auto flex gap-6">
          <aside className="flex-shrink-0">
            <Button className="bg-primary hover:bg-primary/80 mb-4 w-full">
              <Plus className="w-4 h-4 mr-2" />
              New Territory
            </Button>
            <TableMenu />
          </aside>
          
          <div className="flex-1">
            <TerritoriesTable />
          </div>
        </div>
      </main>

      <button className="fixed bottom-8 right-8 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
        <Plus className="w-5 h-5" />
        New Player
      </button>
    </div>
  );
}