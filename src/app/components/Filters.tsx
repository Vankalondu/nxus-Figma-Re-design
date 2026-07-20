import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function Filters() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm text-muted-foreground mb-2">Filter by Team:</label>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            <SelectItem value="team1">Team 1</SelectItem>
            <SelectItem value="team2">Team 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm text-muted-foreground mb-2">Filter by Country:</label>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="All Countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="ghana">Ghana</SelectItem>
            <SelectItem value="nigeria">Nigeria</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm text-muted-foreground mb-2">Filter by Weeks:</label>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="All weeks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All weeks</SelectItem>
            <SelectItem value="week1">Week 1</SelectItem>
            <SelectItem value="week2">Week 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}