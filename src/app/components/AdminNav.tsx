import { Button } from './ui/button';

export function AdminNav() {
  const tabs = [
    'Territories',
    'Bodies',
    'Tiers',
    'Countries',
    'Categories',
    'Sub-categories',
    'Competitions',
    'Teams',
    'Players',
    'Transfers',
    'Users'
  ];
  
  return (
    <div className="border-b bg-card">
      <div className="px-6 flex gap-2 overflow-x-auto">
        {tabs.map((tab, index) => (
          <Button
            key={tab}
            variant={index === 0 ? 'default' : 'ghost'}
            className={`rounded-none border-b-2 ${
              index === 0 
                ? 'bg-primary hover:bg-primary/80 border-primary' 
                : 'bg-transparent hover:bg-accent border-transparent text-muted-foreground'
            } rounded-t-lg`}
          >
            {tab}
          </Button>
        ))}
      </div>
    </div>
  );
}