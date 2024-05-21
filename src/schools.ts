export interface Student {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  gradeLevel: number;
  neighbourhood: string;
}

export interface School {
  name: string;
  lat: number;
  long: number;
  maxCapacity: number;
  students: Student[];
  capacityOverflowHandled: boolean;
}

export const schoolFactory = (): School[] => {
  return [
    {
      name: "Little Harbor",
      lat: 43.0671615,
      long: -70.7542339,
      maxCapacity: 315,
      students: [],
      capacityOverflowHandled: false,
    },
    {
      name: "Dondero",
      lat: 43.0378247,
      long: -70.7709701,
      maxCapacity: 335,
      students: [],
      capacityOverflowHandled: false,
    },
    {
      name: "New Franklin",
      lat: 43.0770831,
      long: -70.7791392,
      maxCapacity: 250,
      students: [],
      capacityOverflowHandled: false,
    },
  ];
};
