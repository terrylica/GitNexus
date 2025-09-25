import React from 'react';

interface WarningDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger' | 'info';
}

const WarningDialog: React.FC<WarningDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}) => {
  if (!isOpen) return null;

  const colors = {
    warning: {
      icon: '⚠️',
      iconColor: '#f59e0b',
      confirmBg: '#f59e0b',
      confirmHover: '#d97706'
    },
    danger: {
      icon: '🚨',
      iconColor: '#ef4444',
      confirmBg: '#ef4444',
      confirmHover: '#dc2626'
    },
    info: {
      icon: 'ℹ️',
      iconColor: '#3b82f6',
      confirmBg: '#3b82f6',
      confirmHover: '#2563eb'
    }
  };

  const theme = colors[variant];

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease-out'
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    animation: 'slideIn 0.3s ease-out'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '24px',
    color: theme.iconColor
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    marginBottom: '24px'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  };

  const baseButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '80px'
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  };

  const confirmButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: theme.confirmBg,
    color: 'white'
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <>
      <div 
        style={backdropStyle} 
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div style={dialogStyle} role="dialog" aria-modal="true">
          <div style={headerStyle}>
            <span style={iconStyle}>{theme.icon}</span>
            <h3 style={titleStyle}>{title}</h3>
          </div>
          
          <div style={messageStyle}>
            {message}
          </div>
          
          <div style={buttonContainerStyle}>
            <button
              style={cancelButtonStyle}
              onClick={onCancel}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              {cancelText}
            </button>
            <button
              style={confirmButtonStyle}
              onClick={onConfirm}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.confirmHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.confirmBg;
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default WarningDialog;
