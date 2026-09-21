// Reusable Button component
export function Button({ variant = 'primary', children, className = '', ...props }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}
