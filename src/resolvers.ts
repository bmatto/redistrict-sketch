import { getNeighborHoods } from "./factories/neighborhoods.js";
import { getSchools } from "./factories/schools.js";

export const resolvers = {
  Query: {
    schools: async () => {
      return Object.values(getSchools());
    },
    neighborhoods: async () => {
      return Object.values(getNeighborHoods());
    },
  },
};
