import React, { useState } from 'react';
import { supabase } from '@/services/api';

const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleTestConnection = async () => {
    setStatus('loading');
    setMessage('');
    try {
      // 尝试获取服务器时间，作为连接测试
      const { data, error } = await supabase.rpc('get_server_time');
      if (error) {
        setStatus('error');
        setMessage('连接失败: ' + error.message);
      } else {
        setStatus('success');
        setMessage('连接成功，服务器时间: ' + (data?.now || JSON.stringify(data)));
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('连接异常: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Supabase 连接测试</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleTestConnection}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? '测试中...' : '测试 Supabase 连接'}
      </button>
      {message && (
        <div className={`mt-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
      )}
    </div>
  );
};

export default SupabaseTest;
