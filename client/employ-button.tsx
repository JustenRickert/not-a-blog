import { useEffect, useState, memo } from "react";

import { INDUSTRIES_EMPLOYMENT_TIMEOUT } from "../constants";

function EmployButton({
  industryName,
  onClick,
  lastEmploymentUpdateDate,
  disabled
}) {
  const [canEmploy, setCanEmploy] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const diff = now - lastEmploymentUpdateDate.getTime();
    const employmentTimeout = INDUSTRIES_EMPLOYMENT_TIMEOUT[industryName];
    const timeout = setTimeout(() => {
      setCanEmploy(true);
    }, Math.min(employmentTimeout, Math.max(0, employmentTimeout - diff)));
    return () => {
      clearTimeout(timeout);
    };
  }, [lastEmploymentUpdateDate]);

  const handleClick = () => {
    setCanEmploy(false);
    onClick();
  };

  return (
    <button disabled={disabled || !canEmploy} onClick={handleClick}>
      employ
    </button>
  );
}

export default EmployButton;
