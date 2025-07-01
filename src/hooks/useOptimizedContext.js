import { useContext, useMemo } from 'react';

// Context 최적화 훅
export const useOptimizedContext = (context, selector) => {
  const contextValue = useContext(context);
  
  return useMemo(() => {
    if (selector) {
      return selector(contextValue);
    }
    return contextValue;
  }, [contextValue, selector]);
};

// 특정 값만 선택하는 훅
export const useContextSelector = (context, selector) => {
  const contextValue = useContext(context);
  
  return useMemo(() => selector(contextValue), [contextValue, selector]);
};