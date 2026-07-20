import { TrendingUp, TrendingDown, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function VideoDepartmentDashboard() {
  // Video editor leaderboard data
  const editorLeaderboard = [
    {
      rank: 1,
      name: 'Chinonso Okafor',
      avatar: 'CO',
      packagesCompleted: 94,
      uploadPercentage: 98,
      avgTurnaround: '1.8 days',
      qualityScore: 4.9,
      trend: 'up'
    },
    {
      rank: 2,
      name: 'Amara Mensah',
      avatar: 'AM',
      packagesCompleted: 89,
      uploadPercentage: 96,
      avgTurnaround: '2.1 days',
      qualityScore: 4.8,
      trend: 'up'
    },
    {
      rank: 3,
      name: 'Kofi Adeyemi',
      avatar: 'KA',
      packagesCompleted: 86,
      uploadPercentage: 94,
      avgTurnaround: '2.3 days',
      qualityScore: 4.7,
      trend: 'same'
    },
    {
      rank: 4,
      name: 'Thandiwe Nkosi',
      avatar: 'TN',
      packagesCompleted: 82,
      uploadPercentage: 91,
      avgTurnaround: '2.5 days',
      qualityScore: 4.6,
      trend: 'up'
    },
    {
      rank: 5,
      name: 'Ibrahim Kamara',
      avatar: 'IK',
      packagesCompleted: 78,
      uploadPercentage: 88,
      avgTurnaround: '2.7 days',
      qualityScore: 4.5,
      trend: 'down'
    },
    {
      rank: 6,
      name: 'Fatima Diallo',
      avatar: 'FD',
      packagesCompleted: 75,
      uploadPercentage: 85,
      avgTurnaround: '2.9 days',
      qualityScore: 4.4,
      trend: 'same'
    },
    {
      rank: 7,
      name: 'Kwame Boateng',
      avatar: 'KB',
      packagesCompleted: 71,
      uploadPercentage: 82,
      avgTurnaround: '3.1 days',
      qualityScore: 4.3,
      trend: 'up'
    },
    {
      rank: 8,
      name: 'Zainab Hassan',
      avatar: 'ZH',
      packagesCompleted: 68,
      uploadPercentage: 79,
      avgTurnaround: '3.2 days',
      qualityScore: 4.2,
      trend: 'down'
    },
  ];

  // Players awaiting video packages
  const awaitingVideoPlayers = [
    {
      name: 'Emmanuel Osei',
      position: 'CF',
      age: 17,
      club: 'Hearts of Oak U19',
      priority: 'high',
      daysWaiting: 12,
      assignedTo: 'Chinonso Okafor',
      status: 'In Progress'
    },
    {
      name: 'Kwesi Appiah',
      position: 'CM',
      age: 16,
      club: 'Asante Kotoko U17',
      priority: 'high',
      daysWaiting: 10,
      assignedTo: 'Amara Mensah',
      status: 'In Progress'
    },
    {
      name: 'Youssef El-Sayed',
      position: 'RW',
      age: 18,
      club: 'Al Ahly U20',
      priority: 'medium',
      daysWaiting: 8,
      assignedTo: 'Kofi Adeyemi',
      status: 'Footage Review'
    },
    {
      name: 'Mamadou Sakho',
      position: 'CB',
      age: 17,
      club: 'AS Mande U19',
      priority: 'high',
      daysWaiting: 7,
      assignedTo: 'Thandiwe Nkosi',
      status: 'Not Started'
    },
    {
      name: 'Oluwatobi Akinlade',
      position: 'GK',
      age: 16,
      club: 'Shooting Stars U17',
      priority: 'medium',
      daysWaiting: 6,
      assignedTo: 'Ibrahim Kamara',
      status: 'In Progress'
    },
  ];

  // Weekly production data
  const weeklyProductionData = [
    { week: 'Week 1', completed: 82, pending: 38 },
    { week: 'Week 2', completed: 91, pending: 29 },
    { week: 'Week 3', completed: 98, pending: 22 },
    { week: 'Week 4', completed: 106, pending: 14 },
  ];

  return (
    <div className="space-y-6">
      {/* Video Department KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Packages Completed
            </p>
            <div className="p-2 rounded-xl bg-[#E8F5E9] shrink-0 ml-3">
              <CheckCircle className="w-5 h-5 text-[#43A047]" strokeWidth={2.5} />
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
            This week (+24% vs last week)
          </div>
        </div>

        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Missing Video Packages
            </p>
            <div className="p-2 rounded-xl bg-[#FFEBEE] shrink-0 ml-3">
              <AlertCircle className="w-5 h-5 text-[#E53935]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              125
            </div>
            <div className="flex items-center gap-1 text-[#E53935] text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
              -8
            </div>
          </div>
          <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Pending player packages
          </div>
        </div>

        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Avg. Turnaround Time
            </p>
            <div className="p-2 rounded-xl bg-[#E3F2FD] shrink-0 ml-3">
              <Clock className="w-5 h-5 text-[#1E88E5]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              2.4
            </div>
            <div className="text-muted-foreground text-xl font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              days
            </div>
          </div>
          <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            From footage to upload
          </div>
        </div>

        <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Editor Capacity
            </p>
            <div className="p-2 rounded-xl bg-[#FFF9C4] shrink-0 ml-3">
              <Video className="w-5 h-5 text-[#F9A825]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              70%
            </div>
            <div className="flex items-center gap-1 text-[#43A047] text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              +5%
            </div>
          </div>
          <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Current workload utilization
          </div>
        </div>
      </div>

      {/* Weekly Production Chart */}
      <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>
            Weekly Production Trends
          </h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Video packages completed vs pending over the last 4 weeks
          </p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyProductionData}>
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
            <Bar dataKey="completed" fill="#43A047" name="Completed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="pending" fill="#E53935" name="Pending" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Main Content: Video Editor Leaderboard and Players Awaiting Video */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Video Editor Performance Leaderboard - 60% */}
        <div className="lg:col-span-3 bg-card border border-[#e0e7ef] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#e8edf2]">
            <h3 className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Video Editor Performance Leaderboard
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ranked by upload completion percentage and quality scores
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card border-b border-[#e8edf2]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Editor
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Packages
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Upload %
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Avg. Time
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Quality
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf2]">
                {editorLeaderboard.map((editor) => (
                  <tr key={editor.rank} className="hover:bg-card transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          editor.rank === 1 ? 'bg-[#FFD700] text-[#8B6914]' :
                          editor.rank === 2 ? 'bg-[#C0C0C0] text-[#4A4A4A]' :
                          editor.rank === 3 ? 'bg-[#CD7F32] text-white' :
                          'bg-[#F1F5F9] text-muted-foreground'
                        }`} style={{ fontFamily: "'Figtree', sans-serif" }}>
                          {editor.rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white font-semibold text-sm"
                          style={{ fontFamily: "'Figtree', sans-serif" }}>
                          {editor.avatar}
                        </div>
                        <div>
                          <div className="text-[#0a0e1a] font-medium text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {editor.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[#0a0e1a] font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {editor.packagesCompleted}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            editor.uploadPercentage >= 95 ? 'text-[#43A047]' :
                            editor.uploadPercentage >= 85 ? 'text-[#F9A825]' :
                            'text-[#E53935]'
                          }`} style={{ fontFamily: "'Figtree', sans-serif" }}>
                            {editor.uploadPercentage}%
                          </span>
                          {editor.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#43A047]" strokeWidth={2.5} />}
                          {editor.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-[#E53935]" strokeWidth={2.5} />}
                        </div>
                        <div className="w-full bg-[#E8EDF2] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              editor.uploadPercentage >= 95 ? 'bg-[#43A047]' :
                              editor.uploadPercentage >= 85 ? 'bg-[#F9A825]' :
                              'bg-[#E53935]'
                            }`}
                            style={{ width: `${editor.uploadPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-muted-foreground text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {editor.avgTurnaround}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F5E9]">
                        <span className="text-[#43A047] text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {editor.qualityScore}
                        </span>
                        <span className="text-[#43A047] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          /5.0
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#e8edf2] bg-card">
            <button className="text-[#1E88E5] text-sm hover:underline font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              View Full Editor Performance Details →
            </button>
          </div>
        </div>

        {/* Players Awaiting Video Packages - 40% */}
        <div className="lg:col-span-2 bg-card border border-[#e0e7ef] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#e8edf2]">
            <h3 className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Priority Video Queue
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Players awaiting video packages
            </p>
          </div>

          <div className="divide-y divide-[#e8edf2]">
            {awaitingVideoPlayers.map((player, index) => (
              <div key={index} className="p-4 hover:bg-card transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[#0a0e1a] font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {player.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        player.priority === 'high' ? 'bg-[#FFEBEE] text-[#E53935]' : 'bg-[#FFF9C4] text-[#F9A825]'
                      }`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {player.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-xs mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {player.position} • {player.age}y • {player.club}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span className="font-medium text-[#E53935]">{player.daysWaiting} days</span> waiting
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-[#e8edf2]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Assigned to: <span className="font-medium text-[#0a0e1a]">{player.assignedTo}</span>
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs font-medium ${
                      player.status === 'In Progress' ? 'text-[#1E88E5]' :
                      player.status === 'Not Started' ? 'text-[#E53935]' :
                      'text-[#F9A825]'
                    }`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {player.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#e8edf2] bg-card">
            <button className="text-[#1E88E5] text-sm hover:underline font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              View All Pending Videos ({awaitingVideoPlayers.length + 120}) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}