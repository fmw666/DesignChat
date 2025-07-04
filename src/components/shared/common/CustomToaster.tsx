import { Toaster } from 'react-hot-toast';

const CustomToaster = () => {
  return (
    <Toaster
      position="top-center"
      containerStyle={{
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#1F2937',
          boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          zIndex: 99999,
        },
        success: {
          iconTheme: {
            primary: '#059669',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #059669',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC2626',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #DC2626',
          },
        },
        loading: {
          iconTheme: {
            primary: '#6366F1',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #6366F1',
          },
        },
        custom: {
          iconTheme: {
            primary: '#6366F1',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #6366F1',
          },
        },
      }}
    />
  );
};

export default CustomToaster;
