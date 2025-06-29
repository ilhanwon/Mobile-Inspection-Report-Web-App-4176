import { useState, useCallback } from 'react';

export const useFormData = (initialState) => {
  const [formData, setFormDataState] = useState(initialState);

  const updateField = useCallback((field, value) => {
    setFormDataState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormDataState(initialState);
  }, [initialState]);

  const setFormData = useCallback((data) => {
    setFormDataState(data);
  }, []);

  return {
    formData,
    updateField,
    resetForm,
    setFormData
  };
};