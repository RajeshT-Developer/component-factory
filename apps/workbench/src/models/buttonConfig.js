import buttonContract from "../contracts/button.contract.json";

export { buttonContract };

export function createDefaultButtonConfig() {
  const { props } = buttonContract;

  return {
    label: props.label.default,
    icon: props.icon.default,
    disabled: props.disabled.default,
    type: props.type.default
  };
}

export function validateButtonConfig(config) {
  const errors = {};
  const { props } = buttonContract;

  if (typeof config.label !== "string") {
    errors.label = "Label must be text.";
  } else if (config.label.trim().length < props.label.minLength) {
    errors.label = "Enter a button label.";
  } else if (config.label.length > props.label.maxLength) {
    errors.label =
      `Label must not exceed ${props.label.maxLength} characters.`;
  }

  if (!props.icon.values.includes(config.icon)) {
    errors.icon = "Choose a supported icon.";
  }

  if (typeof config.disabled !== "boolean") {
    errors.disabled = "Disabled must be true or false.";
  }

  if (!props.type.values.includes(config.type)) {
    errors.type = "Choose a supported button type.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}