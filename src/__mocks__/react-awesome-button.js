import React from 'react';

export const AwesomeButton = ({ children, onPress, ...props }) => (
  <button onClick={onPress} {...props}>
    {children}
  </button>
);
