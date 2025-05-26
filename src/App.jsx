import { useEffect, useMemo, useState } from 'react';
import { serviceOrders } from './mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const STATUS_CODES = {
  100: 'New',
  151: 'Waiting for Spare Parts',
  500: 'Problem Solved',
  600: 'Submitted',
};
const STATUS_COLORS = {
  'New': '#4e79a7',
  'Waiting for Spare Parts': '#e15759',
  'Problem Solved': '#59a14f',
  'Submitted': '#f28e2b',
};

function getStatusDailyData(orders, statusCode) {
  const filtered = orders.filter(o => o.code === statusCode);
  const daily = {};
  filtered.forEach(order => {
    const date = order.finishedDate || order.createdDate;
    if (date) {
      daily[date] = (daily[date] || 0) + 1;
    }
  });
  return Object.entries(daily).map(([date, count]) => ({ date, count }));
}

function getAverageWaitTime(orders) {
  const finished = orders.filter(o => o.finishedDate && o.createdDate);
  if (!finished.length) return 0;
  const totalDays = finished.reduce((sum, o) => {
    const created = new Date(o.createdDate);
    const finished = new Date(o.finishedDate);
    return sum + (finished - created) / (1000 * 60 * 60 * 24);
  }, 0);
  return (totalDays / finished.length).toFixed(1);
}

function getStatusCounts(orders) {
  const counts = {};
  Object.entries(STATUS_CODES).forEach(([code, name]) => {
    counts[name] = orders.filter(o => o.code === Number(code)).length;
  });
  return counts;
}

function getLastMonthSubmissions(orders) {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  
  return orders.filter(o => {
    const date = new Date(o.submittedDate);
    return date >= lastMonth && date <= lastMonthEnd;
  }).length;
}

function App() {
  // Use state for live-updating mock data
  const [liveOrders, setLiveOrders] = useState(serviceOrders);

  // Live update effect: randomly add/finish orders every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOrders(prevOrders => {
        let orders = [...prevOrders];
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        // 50% chance to add a new order
        if (Math.random() < 0.5) {
          const codeOptions = [100, 151, 600];
          const code = codeOptions[Math.floor(Math.random() * codeOptions.length)];
          const status = STATUS_CODES[code];
          orders.push({
            id: orders.length + 1,
            code,
            status,
            createdDate: todayStr,
            finishedDate: null,
            submittedDate: code === 600 ? todayStr : null,
            waitingForParts: code === 151
          });
        }
        // 40% chance to finish a random 'New' or 'Waiting for Spare Parts' order
        if (Math.random() < 0.4) {
          const unfinished = orders.filter(o => (o.code === 100 || o.code === 151) && !o.finishedDate);
          if (unfinished.length > 0) {
            const idx = orders.indexOf(unfinished[Math.floor(Math.random() * unfinished.length)]);
            if (idx !== -1) {
              orders[idx] = {
                ...orders[idx],
                code: 500,
                status: 'Problem Solved',
                finishedDate: todayStr
              };
            }
          }
        }
        // Keep only the last 200 orders for performance
        if (orders.length > 200) orders = orders.slice(orders.length - 200);
        return orders;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const avgWait = useMemo(() => getAverageWaitTime(liveOrders), [liveOrders]);
  const statusCounts = useMemo(() => getStatusCounts(liveOrders), [liveOrders]);
  const lastMonthCount = useMemo(() => getLastMonthSubmissions(liveOrders), [liveOrders]);
  // Prepare daily data for each status
  const statusDailyData = useMemo(() => {
    const result = {};
    Object.entries(STATUS_CODES).forEach(([code, name]) => {
      result[name] = getStatusDailyData(liveOrders, Number(code));
    });
    return result;
  }, [liveOrders]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-logo-row">
        <img src="/logo.png" alt="Karcher Logo" className="dashboard-logo" />
        <h1>Karcher Service Orders Dashboard</h1>
      </div>
      <div className="dashboard-header-status">
        {Object.entries(STATUS_CODES).map(([code, name]) => (
          <div key={code} className="status-count-box" style={{ borderColor: STATUS_COLORS[name] }}>
            <span className="status-count-label">{name}</span>
            <span className="status-count-value">{statusCounts[name]}</span>
          </div>
        ))}
        <div className="status-count-box" style={{ borderColor: '#9b59b6' }}>
          <span className="status-count-label">Last Month Submissions</span>
          <span className="status-count-value">{lastMonthCount}</span>
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-card">
          <h2>Average Wait Time (days)</h2>
          <div className="wait-time">{avgWait}</div>
        </div>
        <div className="dashboard-card">
          <h2>Monthly Submissions Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={statusDailyData['Submitted']}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#9b59b6" 
                name="Submissions" 
                strokeWidth={3} 
                dot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="dashboard-row" style={{ flexWrap: 'wrap' }}>
        {Object.entries(STATUS_CODES).map(([code, name]) => (
          <div className="dashboard-card" key={code} style={{ minWidth: 320 }}>
            <h2>{name} Orders Per Day</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={statusDailyData[name]}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke={STATUS_COLORS[name]} name={name} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
