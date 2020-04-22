import { INDUSTRIES_STUB } from "./constants";

export type IndustryNames = keyof typeof INDUSTRIES_STUB;

export type Industries = Record<
  IndustryNames,
  {
    allocation: number;
    supply: number;
    lastEmploymentUpdateDate: Date;
    lastUpdateSupplyDate: Date;
  }
>;
