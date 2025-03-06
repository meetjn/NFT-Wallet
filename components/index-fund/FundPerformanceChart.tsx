"use client";
import React from 'react';

const FundPerformanceChart = () => {
  // Mock data for the chart
  const data = [
    { month: 'Jan', value: 1000 },
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 1500 },
    { month: 'Apr', value: 1300 },
    { month: 'May', value: 1600 },
  ];

  return (
    <div className="performance-chart">
      <h2>Fund Performance</h2>
      <ul>
        {data.map((entry, index) => (
          <li key={index}>
            {entry.month}: ${entry.value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FundPerformanceChart;