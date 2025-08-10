/**
 * Fonctions de validation de formulaire
 */
export const validate = (data, rules) => {
  const errors = {};

  for (const field in rules) {
    const value = data[field] || '';
    const fieldRules = rules[field];

    for (const rule of fieldRules) {
      const [ruleName, ruleParam] = rule.split(':');
      
      switch (ruleName) {
        case 'required':
          if (!value.trim()) {
            errors[field] = 'Ce champ est requis';
          }
          break;
          
        case 'min':
          if (value.length < parseInt(ruleParam)) {
            errors[field] = `Doit contenir au moins ${ruleParam} caractères`;
          }
          break;
          
        case 'max':
          if (value.length > parseInt(ruleParam)) {
            errors[field] = `Ne doit pas dépasser ${ruleParam} caractères`;
          }
          break;
          
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[field] = 'Email invalide';
          }
          break;
          
        case 'number':
          if (isNaN(value)) {
            errors[field] = 'Doit être un nombre';
          }
          break;
          
        default:
          break;
      }
      
      // Si une erreur est trouvée, on passe au champ suivant
      if (errors[field]) break;
    }
  }

  return errors;
};