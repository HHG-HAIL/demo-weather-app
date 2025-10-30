/**
 * Custom styles for React Select component
 */
export const customSelectStyles = {
  control: provided => ({
    ...provided,
    backgroundColor: "rgba(0,0,0,0.1)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    borderRadius: "25px",
    padding: ".2rem .5rem",
  }),
  option: (provided) => ({
    ...provided,
    backgroundColor: "white",
    color: "black",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#ffffff",
  })
};
