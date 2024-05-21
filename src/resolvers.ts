import { schoolFactory } from "./schools.js";
import districtSort from "./district-sort.js";

export const resolvers = {
  Query: {
    schools: async () => {
      const { schools } = await districtSort(schoolFactory());

      return schools;
    },
  },
};
