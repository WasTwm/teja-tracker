import { useState, useEffect } from 'react';
import { Sun, Dumbbell, Code2, Smartphone, Moon, CheckCircle2, Circle, Plus, Trash2, TrendingUp, Target, Flame, BookOpen, Smile, Zap } from 'lucide-react';
import './App.css';

const HABITS = [
  { id: 'wakeup', label: 'Wake up by 6 AM', icon: Sun, color: 'amber' },
  { id: 'gym', label: 'Gym done', icon: Dumbbell, color: 'green' },
  { id: 'dsa', label: 'DSA session', icon: Code2, color: 'accent' },
  { id: 'nophone', label: 'No phone in bedroom', icon: Smartphone, color: 'red' },
  { id: 'sleep', label: 'Sleep by 10:30 PM', icon: Moon, color: 'accent' },
];

const MOODS = ['😔','😐','🙂','💪','🔥'];
const MOOD_LABELS = ['Struggling','Okay','Good','Focused','On fire'];

const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultState = () => ({
  habits: {}, problems: [], mood: {}, notes: {}, streak: 0, lastDate: null, longestStreak: 0
});

function loadState() {
  try { return JSON.parse(localStorage.getItem('teja_v2') || 'null') || defaultState(); }
  catch { return defaultState(); }
}

function saveState(s) {
  localStorage.setItem('teja_v2', JSON.stringify(s));
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('today');
  const [problem, setProblem] = useState('');
  const [diff, setDiff] = useState('easy');
  const [topic, setTopic] = useState('');

  useEffect(() => { saveState(state); }, [state]);

  const today = todayKey();
  const todayHabits = state.habits[today] || {};
  const habitsDone = HABITS.filter(h => todayHabits[h.id]).length;
  const allDone = habitsDone === HABITS.length;

  function toggleHabit(id) {
    setState(prev => {
      const th = { ...(prev.habits[today] || {}), [id]: !prev.habits[today]?.[id] };
      const habits = { ...prev.habits, [today]: th };
      const count = HABITS.filter(h => th[h.id]).length;
      let streak = prev.streak, lastDate = prev.lastDate, longestStreak = prev.longestStreak;
      if (count === HABITS.length && lastDate !== today) {
        const yest = new Date(); yest.setDate(yest.getDate() - 1);
        const yKey = yest.toISOString().slice(0, 10);
        streak = (lastDate === yKey ? streak : 0) + 1;
        lastDate = today;
        longestStreak = Math.max(longestStreak, streak);
      }
      return { ...prev, habits, streak, lastDate, longestStreak };
    });
  }

  function addProblem() {
    if (!problem.trim()) return;
    setState(prev => ({
      ...prev,
      problems: [...prev.problems, { name: problem.trim(), diff, topic: topic.trim() || 'General', date: today, id: Date.now() }]
    }));
    setProblem(''); setTopic('');
  }

  function deleteProblem(id) {
    setState(prev => ({ ...prev, problems: prev.problems.filter(p => p.id !== id) }));
  }

  function setMood(idx) {
    setState(prev => ({ ...prev, mood: { ...prev.mood, [today]: idx } }));
  }

  function setNote(val) {
    setState(prev => ({ ...prev, notes: { ...prev.notes, [today]: val } }));
  }

  const bondStart = new Date('2026-04-15');
  const bondEnd = new Date('2027-07-15');
  const now = new Date();
  const bondPct = Math.min(100, Math.max(0, Math.round((now - bondStart) / (bondEnd - bondStart) * 100)));
  const bondDays = Math.max(0, Math.round((bondEnd - now) / 86400000));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const done = Object.values(state.habits[key] || {}).filter(Boolean).length;
    return { key, done, day: ['S','M','T','W','T','F','S'][d.getDay()], isToday: key === today };
  });

  const totalProblems = state.problems.length;
  const easyCount = state.problems.filter(p => p.diff === 'easy').length;
  const medCount = state.problems.filter(p => p.diff === 'medium').length;
  const hardCount = state.problems.filter(p => p.diff === 'hard').length;

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <Zap size={20} className="logo-icon" />
            <span>Teja's Tracker</span>
          </div>
          <div className="header-meta">
            <span className="streak-pill">
              <Flame size={14} />
              {state.streak} day streak
            </span>
          </div>
        </div>
        <nav className="tabs">
          {['today','dsa','progress'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'today' ? 'Today' : t === 'dsa' ? 'DSA Log' : 'Progress'}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {tab === 'today' && (
          <div className="section-stack">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Habits today</div>
                <div className="stat-value">{habitsDone}<span className="stat-denom">/{HABITS.length}</span></div>
                {allDone && <div className="stat-badge green">All done!</div>}
              </div>
              <div className="stat-card">
                <div className="stat-label">Problems solved</div>
                <div className="stat-value">{totalProblems}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Best streak</div>
                <div className="stat-value">{state.longestStreak}<span className="stat-denom"> days</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Bond left</div>
                <div className="stat-value">{bondDays}<span className="stat-denom"> days</span></div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <CheckCircle2 size={16} />
                Daily habits
              </div>
              <div className="habit-list">
                {HABITS.map(h => {
                  const done = todayHabits[h.id];
                  const Icon = h.icon;
                  return (
                    <button key={h.id} className={`habit-row ${done ? 'done' : ''}`} onClick={() => toggleHabit(h.id)}>
                      <div className="habit-left">
                        <div className={`habit-icon-wrap ${h.color}`}>
                          <Icon size={15} />
                        </div>
                        <span className="habit-name">{h.label}</span>
                      </div>
                      <div className={`habit-check ${done ? 'checked' : ''}`}>
                        {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-title"><Smile size={16} />How are you feeling?</div>
              <div className="mood-row">
                {MOODS.map((m, i) => (
                  <button key={i} className={`mood-btn ${state.mood[today] === i ? 'selected' : ''}`} onClick={() => setMood(i)} title={MOOD_LABELS[i]}>
                    <span className="mood-emoji">{m}</span>
                    <span className="mood-label">{MOOD_LABELS[i]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title"><BookOpen size={16} />Today's note</div>
              <textarea
                className="note-area"
                placeholder="What did you solve today? How did you feel? What's the plan for tomorrow?"
                value={state.notes[today] || ''}
                onChange={e => setNote(e.target.value)}
                rows={4}
              />
            </div>

            <div className="card">
              <div className="card-title"><Target size={16} />Bond countdown — Apr 2027</div>
              <div className="bond-label">{bondPct}% complete · {bondDays} days until freedom 🚀</div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: bondPct + '%' }} />
              </div>
              <div className="progress-ends">
                <span>Apr 2026</span><span>Apr 2027</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'dsa' && (
          <div className="section-stack">
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{totalProblems}</div></div>
              <div className="stat-card easy-card"><div className="stat-label">Easy</div><div className="stat-value green-text">{easyCount}</div></div>
              <div className="stat-card med-card"><div className="stat-label">Medium</div><div className="stat-value amber-text">{medCount}</div></div>
              <div className="stat-card hard-card"><div className="stat-label">Hard</div><div className="stat-value red-text">{hardCount}</div></div>
            </div>

            <div className="card">
              <div className="card-title"><Plus size={16} />Log a problem</div>
              <div className="input-group">
                <input className="field" placeholder="Problem name (e.g. Two Sum)" value={problem} onChange={e => setProblem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addProblem()} />
                <input className="field" placeholder="Topic (e.g. Arrays, Loops)" value={topic} onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addProblem()} />
                <div className="row-controls">
                  <select className="field select" value={diff} onChange={e => setDiff(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <button className="add-btn" onClick={addProblem}><Plus size={16} /> Add problem</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title"><TrendingUp size={16} />Problem history</div>
              {state.problems.length === 0
                ? <div className="empty-state">No problems logged yet. Add your first one above! 💪</div>
                : <div className="problem-list">
                    {[...state.problems].reverse().map(p => (
                      <div key={p.id} className="problem-row">
                        <div className="problem-left">
                          <span className={`diff-badge ${p.diff}`}>{p.diff}</span>
                          <div>
                            <div className="problem-name">{p.name}</div>
                            <div className="problem-meta">{p.topic} · {p.date}</div>
                          </div>
                        </div>
                        <button className="delete-btn" onClick={() => deleteProblem(p.id)}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}

        {tab === 'progress' && (
          <div className="section-stack">
            <div className="card">
              <div className="card-title"><Flame size={16} />Last 7 days</div>
              <div className="week-row">
                {last7.map(d => (
                  <div key={d.key} className={`day-col ${d.isToday ? 'today' : ''}`}>
                    <div className="day-bar-wrap">
                      <div className="day-bar" style={{ height: Math.round((d.done / HABITS.length) * 100) + '%' }} />
                    </div>
                    <div className="day-done">{d.done}/{HABITS.length}</div>
                    <div className="day-name">{d.day}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title"><Target size={16} />Your roadmap</div>
              <div className="roadmap">
                {[
                  { month: 'Jul–Aug 2026', topic: 'C++ basics + Loops + Arrays', status: 'current' },
                  { month: 'Sep–Oct 2026', topic: 'Recursion + Linked Lists + Stacks', status: 'upcoming' },
                  { month: 'Nov–Dec 2026', topic: 'Trees + Graphs + Binary Search', status: 'upcoming' },
                  { month: 'Jan–Feb 2027', topic: 'Dynamic Programming + Greedy', status: 'upcoming' },
                  { month: 'Mar–Apr 2027', topic: 'Mock interviews + Apply to companies', status: 'upcoming' },
                ].map((r, i) => (
                  <div key={i} className={`roadmap-row ${r.status}`}>
                    <div className={`roadmap-dot ${r.status}`} />
                    <div>
                      <div className="roadmap-month">{r.month}</div>
                      <div className="roadmap-topic">{r.topic}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card goal-card">
              <div className="goal-top">
                <div className="goal-title">The goal 🎯</div>
                <div className="goal-sub">You vs. the timeline</div>
              </div>
              <div className="goal-grid">
                <div className="goal-item"><span className="goal-num">{totalProblems}</span><span className="goal-label">Problems solved</span></div>
                <div className="goal-item"><span className="goal-num">400+</span><span className="goal-label">Google-ready target</span></div>
                <div className="goal-item"><span className="goal-num">{state.streak}</span><span className="goal-label">Current streak</span></div>
                <div className="goal-item"><span className="goal-num">{state.longestStreak}</span><span className="goal-label">Best streak</span></div>
              </div>
              <div className="goal-bar-wrap">
                <div className="goal-bar-fill" style={{ width: Math.min(100, Math.round(totalProblems / 400 * 100)) + '%' }} />
              </div>
              <div className="goal-pct">{Math.min(100, Math.round(totalProblems / 400 * 100))}% to Google-ready</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
