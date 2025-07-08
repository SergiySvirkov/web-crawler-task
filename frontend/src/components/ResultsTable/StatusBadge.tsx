import React from 'react';
import { AnalysisStatus } from '../../types/analysis';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: AnalysisStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // The CSS class will be determined by the status value
  const statusClassName = `status-badge ${status}`;
  
  return <span className={statusClassName}>{status}</span>;
};

export default StatusBadge;
