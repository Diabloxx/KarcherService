import { useMemo } from 'react';
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

function App() {
  const avgWait = useMemo(() => getAverageWaitTime(serviceOrders), []);
  const statusCounts = useMemo(() => getStatusCounts(serviceOrders), []);
  // Prepare daily data for each status
  const statusDailyData = useMemo(() => {
    const result = {};
    Object.entries(STATUS_CODES).forEach(([code, name]) => {
      result[name] = getStatusDailyData(serviceOrders, Number(code));
    });
    return result;
  }, []);

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
      </div>
      <div className="dashboard-row">
        <div className="dashboard-card">
          <h2>Average Wait Time (days)</h2>
          <div className="wait-time">{avgWait}</div>
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
