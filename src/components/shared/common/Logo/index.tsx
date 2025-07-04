import { motion } from 'framer-motion';

export const Logo = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-6"
    >
      <div className="relative">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          DesignChat
        </h1>
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full" />
      </div>
    </motion.div>
  );
};
