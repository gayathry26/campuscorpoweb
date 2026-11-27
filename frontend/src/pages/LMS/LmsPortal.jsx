import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { StudentViews } from './components/StudentViews';
import { FacultyViews } from './components/FacultyViews';

export function LmsPortal() {
  const { user, isModuleEnabled } = useAuth();
  const { section } = useParams();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  if (!isModuleEnabled('LMS')) {
    return <Navigate to={user?.roleName === 'STUDENT' ? '/profile' : '/'} replace />;
  }

  const isStudent = user?.roleName === 'STUDENT';
  const defaultSection = isStudent ? 'my-learning' : 'faculty-dashboard';
  const activeSection = section || defaultSection;

  const handleSelectSection = (key) => {
    navigate(`/lms/${key}`);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      >
        {isStudent ? (
          <StudentViews activeSection={activeSection} onSelectSection={handleSelectSection} />
        ) : (
          <FacultyViews activeSection={activeSection} onSelectSection={handleSelectSection} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default LmsPortal;
