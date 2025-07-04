import { FC, ReactNode } from 'react';
import BaseSidebar from './BaseSidebar';

interface BaseLayoutProps {
  children: ReactNode;
  type: 'chat' | 'assets';
}

const BaseLayout: FC<BaseLayoutProps> = ({ children, type }) => {

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <BaseSidebar type={type} />
      {children}
    </div>
  );
};

export default BaseLayout; 
