import { FC } from 'react';
import { useParams } from 'react-router-dom';
import ChatLayout from './ChatLayout';
import ChatInterface from './ChatInterface';

const Chat: FC = () => {
  const { chatId } = useParams();

  return (
    <ChatLayout>
      <ChatInterface chatId={ chatId as string } />
    </ChatLayout>
  );
};

export default Chat;
