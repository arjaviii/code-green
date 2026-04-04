import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Leaf, 
  BarChart3, 
  AlertTriangle, 
  Globe, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const chartData = [
  { name: 'Mon', savings: 12 },
  { name: 'Tue', savings: 15 },
  { name: 'Wed', savings: 10 },
  { name: 'Thu', savings: 22 },
  { name: 'Fri', savings: 30 },
  { name: 'Sat', savings: 25 },
  { name: 'Sun', savings: 45 },
];

function App() {
  const [report, setReport] = useState({
    projectName: 'Loading...',
    score: 100,
    vampiresDetected: 0,
    potentialSavings: 0,
    filesAudited: 0,
    filesSkipped: 0,
    languages: [],
    rulesFired: []
  });

  // Listen for messages from the VS Code extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'updateReport') {
        setReport(message.data);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial data if running in VS Code
    // @ts-ignore
    if (window.acquireVsCodeApi) {
       // @ts-ignore
      const vscode = window.acquireVsCodeApi();
      vscode.postMessage({ type: 'ready' });
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="dashboard-container">
      <header className="animate">
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={28} color="white" />
          </div>
          <h1>Code-Green</h1>
        </div>
        <div className="status-badge glass-card" style={{ padding: '8px 16px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="var(--accent-green)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Real-time Audit Active</span>
          </div>
        </div>
      </header>

      <main className="main-grid">
        <div className="span-small animate">
          <div className="glass-card score-container">
            <div className="score-gauge">
              <span className="score-value">{report.score}</span>
            </div>
            <div className="score-label">Project Sustainability Score</div>
            <p style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {report.score > 90 ? 'Your project is Elite!' : report.score > 70 ? 'Your project is Highly Efficient.' : 'Your project needs optimization.'}
            </p>
          </div>

          <div className="glass-card" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={20} color="var(--accent-green)" />
              Project Impact
            </h3>
            <div className="stat-row">
              <div className="stat-item">
                <div className="stat-label">Vampires Found</div>
                <div className="stat-value red">{report.vampiresDetected}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Est. CO2 Saved</div>
                <div className="stat-value green">{report.potentialSavings}g</div>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-item">
                <div className="stat-label">Fleet Coverage</div>
                <div className="stat-value" style={{ fontSize: '1rem' }}>
                  <span className="green">{report.filesAudited} Audited</span> / <span className="red">{report.filesSkipped} Skipped</span>
                </div>
              </div>
            </div>
            <div className="stat-row" style={{ marginBottom: 0 }}>
              <div className="stat-item">
                <div className="stat-label">Languages</div>
                <div className="stat-value" style={{ fontSize: '1rem' }}>
                  {report.languages.join(', ') || 'Scanning...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="span-large animate" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} color="var(--accent-blue)" />
                Energy Savings Trend
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last 7 Days (grams CO2)</span>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}g`} />
                  <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="savings" stroke="var(--accent-green)" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card" style={{ marginTop: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={20} color="var(--vampire-red)" />
              Detected Energy Vampires
            </h3>
            <div className="vampire-list">
              {report.rulesFired.length > 0 ? report.rulesFired.map((vampire: any, index: number) => (
                <div className="vampire-item" key={index}>
                  <div className="vampire-icon"><Zap size={18} /></div>
                  <div className="vampire-info">
                    <div className="vampire-title">{vampire.description}</div>
                    <div className="vampire-desc">Detected {vampire.count} times in project code.</div>
                  </div>
                  <div className="vampire-saving">-{vampire.saving}% Energy</div>
                  <ArrowUpRight size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                </div>
              )) : <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No Energy Vampires detected. Great job!</div>}
            </div>
          </div>
        </div>
      </main>

      <footer style={{ marginTop: '64px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <p>© 2026 Code-Green AI. Powered by Sustainable Software Engineering principles.</p>
      </footer>
    </div>
  );
}

export default App;
