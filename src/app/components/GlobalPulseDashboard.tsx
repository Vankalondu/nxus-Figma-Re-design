import { TrendingUp, Users, Video, FileCheck, Target, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export function GlobalPulseDashboard() {
  // Weekly performance data for all departments
  const weeklyPerformanceData = [
    { week: 'Week 1', scouting: 520, video: 380, data: 410 },
    { week: 'Week 2', scouting: 580, video: 420, data: 450 },
    { week: 'Week 3', scouting: 612, video: 485, data: 490 },
    { week: 'Week 4', scouting: 650, video: 510, data: 520 },
  ];

  // Department efficiency comparison
  const departmentEfficiency = [
    { name: 'Scouting Dept', value: 84, color: '#43A047' },
    { name: 'Video Dept', value: 78, color: '#1E88E5' },
    { name: 'Data Entry', value: 72, color: '#F9A825' },
  ];

  // Task completion rates
  const taskCompletionData = [
    { department: 'Scouting', completed: 612, pending: 88 },
    { department: 'Video', completed: 485, pending: 125 },
    { department: 'Data Entry', completed: 490, pending: 110 },
  ];

  const COLORS = ['#43A047', '#1E88E5', '#F9A825'];

  return (
    <div className="space-y-6">
      {/* Top-level Organization KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Total Active Players
            </p>
            <div className="p-2 rounded-xl bg-[#E8F5E9] shrink-0 ml-3">
              <Users className="w-5 h-5 text-[#43A047]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              1,587
            </div>
            <div className="flex items-center gap-1 text-[#43A047] text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              +12%
            </div>
          </div>
          <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            In pipeline across all territories
          </div>
        </div>

        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Organization Velocity
            </p>
            <div className="p-2 rounded-xl bg-[#E3F2FD] shrink-0 ml-3">
              <Activity className="w-5 h-5 text-[#1E88E5]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              78%
            </div>
            <div className="flex items-center gap-1 text-[#43A047] text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              +5%
            </div>
          </div>
          <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Average completion rate
          </div>
        </div>

        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Video Packages Ready
            </p>
            <div className="p-2 rounded-xl bg-[#FFF9C4] shrink-0 ml-3">
              <Video className="w-5 h-5 text-[#F9A825]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              485
            </div>
            <div className="flex items-center gap-1 text-[#43A047] text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              +18
            </div>
          </div>
          <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            This week
          </div>
        </div>

        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Grade A Conversion
            </p>
            <div className="p-2 rounded-xl bg-[#FCE4EC] shrink-0 ml-3">
              <Target className="w-5 h-5 text-[#E53935]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              34%
            </div>
            <div className="flex items-center gap-1 text-[#43A047] text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              +3%
            </div>
          </div>
          <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Players upgraded to Grade A
          </div>
        </div>
      </div>

      {/* Department Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Throughput Trend */}
        <div className="lg:col-span-2 bg-card border border-[#e0e7ef] rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Department Throughput Trends
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Weekly player processing across all departments
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf2" />
              <XAxis 
                dataKey="week" 
                stroke="#94a3b8" 
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e8edf2', 
                  borderRadius: '12px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px' }}
              />
              <Line 
                type="monotone" 
                dataKey="scouting" 
                stroke="#43A047" 
                strokeWidth={3}
                name="Scouting Dept"
                dot={{ fill: '#43A047', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="video" 
                stroke="#1E88E5" 
                strokeWidth={3}
                name="Video Dept"
                dot={{ fill: '#1E88E5', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="data" 
                stroke="#F9A825" 
                strokeWidth={3}
                name="Data Entry"
                dot={{ fill: '#F9A825', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Efficiency */}
        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Department Efficiency
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Current week completion rates
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={departmentEfficiency}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {departmentEfficiency.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e8edf2', 
                  borderRadius: '12px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {departmentEfficiency.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {dept.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {dept.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Completion Breakdown */}
      <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>
            Task Completion Overview
          </h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Completed vs pending tasks by department
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskCompletionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8edf2" />
            <XAxis 
              dataKey="department" 
              stroke="#94a3b8"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px' }}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e8edf2', 
                borderRadius: '12px',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            />
            <Legend 
              wrapperStyle={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px' }}
            />
            <Bar dataKey="completed" fill="#43A047" name="Completed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" fill="#E53935" name="Pending" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scouting Summary */}
        <div className="bg-gradient-to-br from-[#E8F5E9] to-white border border-[#43A047]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-card shadow-sm">
              <Users className="w-6 h-6 text-[#43A047]" strokeWidth={2.5} />
            </div>
            <h4 className="text-[#0a0e1a] font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Scouting Department
            </h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Discover Rate
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                84%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Active Territories
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                22/24
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Players Raised
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                612
              </span>
            </div>
            <button className="text-[#43A047] text-sm hover:underline font-medium mt-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              View Scouting Dashboard →
            </button>
          </div>
        </div>

        {/* Video Department Summary */}
        <div className="bg-gradient-to-br from-[#E3F2FD] to-white border border-[#1E88E5]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-card shadow-sm">
              <Video className="w-6 h-6 text-[#1E88E5]" strokeWidth={2.5} />
            </div>
            <h4 className="text-[#0a0e1a] font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Video Department
            </h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Packages Ready
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                485
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Editor Capacity
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                70%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Avg. Turnaround
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                2.4 days
              </span>
            </div>
            <button className="text-[#1E88E5] text-sm hover:underline font-medium mt-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              View Video Dashboard →
            </button>
          </div>
        </div>

        {/* Data Entry Summary */}
        <div className="bg-gradient-to-br from-[#FFF9C4] to-white border border-[#F9A825]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-card shadow-sm">
              <FileCheck className="w-6 h-6 text-[#F9A825]" strokeWidth={2.5} />
            </div>
            <h4 className="text-[#0a0e1a] font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Data Entry
            </h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Entries Completed
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                490
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Field Completeness
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                92%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Quality Score
              </span>
              <span className="text-sm font-semibold text-[#0a0e1a]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                4.6/5.0
              </span>
            </div>
            <button className="text-[#F9A825] text-sm hover:underline font-medium mt-2"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              View Data Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}