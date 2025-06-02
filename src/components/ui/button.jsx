// src/components/ui/button.jsx
export function Button({ children, className = '', ...props }) {
    return (
      <button
        className={`px-4 py-2 rounded font-semibold transition ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  