import { Checkbox } from './ui/checkbox';

export function PositionFilter() {
  const positions = [
    { id: 'st', label: 'ST' },
    { id: 'lw', label: 'LW' },
    { id: 'rw', label: 'RW' },
    { id: 'acm', label: 'ACM' },
    { id: 'cm', label: 'CM' },
    { id: 'dcm', label: 'DCM' },
    { id: 'rb', label: 'RB' },
    { id: 'lb', label: 'LB' },
    { id: 'lcb', label: 'LCB' },
    { id: 'rcb', label: 'RCB' },
    { id: 'cb', label: 'CB' },
    { id: 'gk', label: 'GK' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {positions.map((position) => (
        <div key={position.id} className="flex items-center gap-2">
          <Checkbox id={position.id} />
          <label 
            htmlFor={position.id}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {position.label}
          </label>
        </div>
      ))}
    </div>
  );
}