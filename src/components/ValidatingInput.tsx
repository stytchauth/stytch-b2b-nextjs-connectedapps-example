'use client';

import { useState, useEffect } from 'react';

/*
 * A form component that manages state and, given a validation function, renders as valid or invalid in the UI.
 */

const ValidatingInput = ({name,
                         defaultValue,
                         validator,
                         changeHandler}): JSX.Element => {

  // Store inputValue as state
  const [inputValue, setInputValue] = useState('');
  // Also store the class as state to trigger a rerender if valid / not valid
  const [inputValueValidClass, setInputValueValidClass] = useState('valid-input');
  // The return value of the validator can be a message for what went wrong
  const [validationError, setValidationError] = useState("");
  // The class changes on whether or not the validator returned a message (display or not)
  const [validationErrorClass, setValidationErrorClass] = useState("display: none");

  // Once on render, validate the default value (and update classes / messages)
  useEffect(() => {
    handleValueChanged(defaultValue);
  }, []);

  /**
   * Test if the value is valid.
   * If so, set appropriate valid classes / don't display validation error
   * If not, set appropriate invalid classes / display validation error.
   *
   * Finally, call the callback given in props to handle the value changing.
   */
  const handleValueChanged = (value: string) => {
    // Validate and set an appropriate class
    console.log(value)
    var reasonOrTrue = validator(value)
    if (reasonOrTrue === true) {
      setInputValueValidClass("valid-input")
      setValidationErrorClass("display: none")
      setValidationError("");
    } else {
      setInputValueValidClass("invalid-input")
      setValidationErrorClass("display: block");
      setValidationError(reasonOrTrue);
    }
    // call the changeHandler callback
    changeHandler(value);
  };

  return (
    <div>
    <input name={name}
      defaultValue={defaultValue}
      className={inputValueValidClass}
      onChange={(e) => handleValueChanged(e.target.value)} />
    <p className={`invalid ${validationErrorClass}`}>{validationError}</p>
    </div>
  );
};

ValidatingInput.defaultProps = {
  defaultValue: '',
  validator: (value) => {return handleValueChanged(value)},
  changeHandler: (value) => {return true;}
}

export default ValidatingInput;
