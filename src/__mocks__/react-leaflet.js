import React from 'react';

export const MapContainer = ({ children, ...props }) => (
  <div data-testid="map-container" {...props}>{children}</div>
);

export const TileLayer = (props) => <div data-testid="tile-layer" {...props} />;

export const Marker = ({ children, ...props }) => (
  <div data-testid="marker" {...props}>{children}</div>
);

export const Popup = ({ children }) => <div data-testid="popup">{children}</div>;
