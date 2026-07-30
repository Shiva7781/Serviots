import Icon from './Icon';

const CONFIG = {
  pending: { label: 'Pending', icon: 'clock' },
  approved: { label: 'Approved', icon: 'check-circle' },
  rejected: { label: 'Rejected', icon: 'x-circle' },
  cancelled: { label: 'Cancelled', icon: 'ban' },
  maintenance: { label: 'Maintenance', icon: 'wrench' },
  available: { label: 'Available', icon: 'check-circle' },
};

export default function StatusBadge({ status }) {
  const { label, icon } = CONFIG[status] || { label: status, icon: 'tag' };
  return (
    <span className={`badge badge-${status}`}>
      <Icon name={icon} size={12} />
      {label}
    </span>
  );
}
