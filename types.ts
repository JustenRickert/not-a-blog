import { INDUSTRIES_STUB } from "./constants";

export type IndustryName = keyof typeof INDUSTRIES_STUB;

export type Industry = {
  allocation: number;
  supply: number;
  lastEmploymentUpdateDate: Date;
  lastUpdateSupplyDate: Date;
};

export type Industries = Record<IndustryName, Industry>;
