import React from 'react';

interface SceneProps {
  children?: React.ReactNode;
  className?: string;
}

const Scene: React.FC<SceneProps> = ({ children, className = '' }) => {
  return (
    <div className={`pointer-events-none ${className}`}>
      {children}
    </div>
  );
};

export default Scene;
