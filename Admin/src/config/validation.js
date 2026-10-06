// Shared, stable validation rules for availity-reactstrap-validation fields.
// They must be module constants: an inline `validate={{...}}` object is new on every
// render, which makes AvField re-register itself and can loop forever.
export const REQUIRED = Object.freeze({ required: { value: true } })
