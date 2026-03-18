export default function AlertBadge({ type = 'alert' }) {
  const config = {
    alert:   { label: 'ALERTE STOCK', cls: 'badge badge-red' },
    warning: { label: 'STOCK BAS',    cls: 'badge badge-yellow' },
    ok:      { label: 'EN STOCK',     cls: 'badge badge-green' },
  };
  const { label, cls } = config[type] || config.alert;
  return <span className={cls}>{label}</span>;
}
