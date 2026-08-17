export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'Error de validación', errors });
    }
    req.validatedBody = result.data;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'Error de validación', errors });
    }
    req.validatedQuery = result.data;
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'Error de validación', errors });
    }
    req.validatedParams = result.data;
    next();
  };
};
