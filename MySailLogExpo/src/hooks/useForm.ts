import { useState, useCallback } from 'react';

type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type FieldRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface FormHookOptions<T> {
  initialValues: T;
  rules?: FieldRules<T>;
  onSubmit: (values: T) => Promise<boolean> | boolean;
}

interface FormHookResult<T> {
  values: T;
  errors: FormErrors<T>;
  touched: { [K in keyof T]?: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  submitForm: () => Promise<boolean>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  rules = {},
  onSubmit
}: FormHookOptions<T>): FormHookResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (field: keyof T, value: T[typeof field]): string | undefined => {
      const fieldRules = rules[field];
      if (!fieldRules) return undefined;

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }

      return undefined;
    },
    [rules]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const field = key as keyof T;
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const handleChange = useCallback(
    <K extends keyof T>(field: K) =>
      (value: T[K]) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (touched[field]) {
          const error = validateField(field, value);
          setErrors((prev) => ({
            ...prev,
            [field]: error
          }));
        }
      },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, values[field]);
      setErrors((prev) => ({
        ...prev,
        [field]: error
      }));
    },
    [values, validateField]
  );

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error
      }));
    }
  }, [touched, validateField]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(async (): Promise<boolean> => {
    setTouched(
      Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    const isValid = validateForm();
    if (!isValid) return false;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(values);
      if (result) {
        resetForm();
      }
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, resetForm]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    resetForm,
    submitForm
  };
}

// Common validation rules
export const validationRules = {
  required: (message: string = 'This field is required'): ValidationRule<any> => ({
    validate: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return true;
      return value !== null && value !== undefined;
    },
    message
  }),
  
  minLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= length,
    message: message || `Must be at least ${length} characters`
  }),

  maxLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= length,
    message: message || `Must be no more than ${length} characters`
  }),

  email: (message: string = 'Invalid email address'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  numeric: (message: string = 'Must be a number'): ValidationRule<string> => ({
    validate: (value) => !isNaN(Number(value)),
    message
  }),

  match: (matchValue: any, message: string): ValidationRule<any> => ({
    validate: (value) => value === matchValue,
    message
  })
};