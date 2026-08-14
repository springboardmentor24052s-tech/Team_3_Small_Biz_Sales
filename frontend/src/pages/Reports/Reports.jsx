import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Download, FileText, Clock, HardDrive,
  ChevronRight, FileDown,
} from 'lucide-react';
import {
  reportCategories, recentReports, revenueByCategoryMonthly, formatCurrency,
} from '../../data/mockData';
import './Reports.css';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('this-month');

  return (
    <div className="page-content animate-in">
      {/* Report Categories */}
      <div className="report-categories" id="report-categories">
        {reportCategories.map((cat) => (
          <div
            key={cat.id}
            className={`report-category-card ${selectedReport === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedReport(selectedReport === cat.id ? null : cat.id)}
            id={`report-${cat.id}`}
          >
            <span className="report-cat-icon">{cat.icon}</span>
            <h3>{cat.name}</h3>
            <p>{cat.description}</p>
            <ChevronRight size={18} className="report-cat-arrow" />
          </div>
        ))}
      </div>

      {/* Revenue by Category Chart */}
      <div className="card" style={{ marginBottom: '24px' }} id="revenue-chart-section">
        <div className="card-header">
          <h3>Revenue by Product Category</h3>
          <div className="toolbar-right">
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              id="report-date-filter"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="btn btn-secondary btn-sm" id="download-chart-btn">
              <Download size={16} /> Download
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="chart-container" style={{ height: '340px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCategoryMonthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="HomeDécor" fill="#6366f1" name="Home Décor" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="Kitchenware" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="PartySupplies" fill="#f59e0b" name="Party Supplies" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="Bags" fill="#0ea5e9" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="Stationery" fill="#8b5cf6" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="Gifts" fill="#ec4899" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="Other" fill="#94a3b8" radius={[3, 3, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card" id="recent-reports-section">
        <div className="card-header">
          <h3>Recent Reports</h3>
          <button className="btn btn-primary btn-sm" id="generate-report-btn">
            <FileText size={16} /> Generate New Report
          </button>
        </div>
        <div className="card-body">
          <table className="data-table" id="reports-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated At</th>
                <th>Format</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="report-name-cell">
                      <FileText size={18} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 500 }}>{report.name}</span>
                    </div>
                  </td>
                  <td><span className="badge primary">{report.type}</span></td>
                  <td>
                    <div className="report-date-cell">
                      <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
                      <span>{report.generatedAt}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${report.format === 'PDF' ? 'danger' : 'success'}`}>
                      {report.format}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <HardDrive size={14} />
                      {report.size}
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm">
                      <FileDown size={16} /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
