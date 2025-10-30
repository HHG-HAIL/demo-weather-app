import React from 'react';

/**
 * Reusable component for displaying a weather information item
 * @param {string} value - The value to display (bold text)
 * @param {string} label - The label describing the value
 * @param {string} className - Optional CSS class name for the container div
 */
const WeatherInfoItem = ({ value, label, className }) => {
  return (
    <div className={className}>
      <p className="bold">{value}</p>
      <p>{label}</p>
    </div>
  );
};

export default WeatherInfoItem;
