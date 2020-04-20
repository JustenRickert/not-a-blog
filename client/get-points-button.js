import { useEffect, useState } from "react";

import { POINTS_PER_MS, POINTS_UPDATE_TIMEOUT } from "../constants.js";
import { formatInt, plural } from "./util.js";

const calculateEstimate = lastUpdatePointsDate => {
  const now = Date.now();
  const diffMs = now - lastUpdatePointsDate.valueOf();
  return POINTS_PER_MS * diffMs;
};

export default function GetPointsButton({ lastUpdatePointsDate, onClick }) {
  const [canRetrievePoints, setCanRetrievePoints] = useState(false);
  const [estimate, setEstimate] = useState(
    calculateEstimate(lastUpdatePointsDate)
  );

  useEffect(() => {
    const now = Date.now();
    const diff = now - lastUpdatePointsDate.valueOf();
    const timeout = setTimeout(() => {
      setCanRetrievePoints(true);
    }, Math.min(POINTS_UPDATE_TIMEOUT, Math.max(POINTS_UPDATE_TIMEOUT - diff, 0)));
    return () => {
      clearTimeout(timeout);
    };
  }, [lastUpdatePointsDate]);

  useEffect(() => {
    const timeout = setInterval(() => {
      setEstimate(calculateEstimate(lastUpdatePointsDate));
    }, 1e3);
    return () => {
      clearInterval(timeout);
    };
  }, [lastUpdatePointsDate]);

  const handleClick = () => {
    setCanRetrievePoints(false);
    onClick().then(() => {
      setEstimate(0);
    });
  };

  return (
    <button disabled={!canRetrievePoints} onClick={handleClick}>
      Get ~{formatInt(estimate)} more {plural(estimate, "point", "points")}!
    </button>
  );
}
