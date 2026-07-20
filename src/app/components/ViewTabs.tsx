import { Button } from './ui/button';

export function ViewTabs() {
  const tabs = ['Long', 'Short', 'Target', 'Database', 'Settings'];
  
  return (
    <div className="flex gap-2">
      {tabs.map((tab, index) => (
        <Button
          key={tab}
          variant={index === 0 ? 'default' : 'outline'}
          className={index === 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
}
