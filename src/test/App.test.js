import React from 'react';
import { motion } from 'framer-motion';

const SwingAnimation = ({ delay = 0, onFinish, children }) => {
  const variants = {
    hidden: { rotate: 0 },
    swing: {
      rotate: [0, 30, -20, 10, -10, 0],
      transition: {
        duration: 0.8,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        loop: Infinity,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="swing"
      onAnimationComplete={onFinish}
    >{children}
    </motion.div>
  );
};

export default SwingAnimation;
