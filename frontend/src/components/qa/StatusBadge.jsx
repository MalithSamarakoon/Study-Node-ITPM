import '../../styles/qa/StatusBadge.css';

function StatusBadge({ status }) {
  const getStatusClass = () => {
    switch (status) {
      case 'SOLVED':
        return 'status-solved';
      case 'ANSWERED':
        return 'status-answered';
      case 'OPEN':
      default:
        return 'status-open';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
