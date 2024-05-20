export interface School {
  name: string;
  lat: number;
  lon: number;
  totalCapacity: number;
  assignedStudents: number;
  capacityOverflowHandled: boolean;
}

export const schools: School[] = [
  {
    name: "Little Harbor",
    lat: 43.0671615,
    lon: -70.7542339,
    totalCapacity: 315,
    assignedStudents: 0,
    capacityOverflowHandled: false,
  },
  {
    name: "Dondero",
    lat: 43.0378247,
    lon: -70.7709701,
    totalCapacity: 335,
    assignedStudents: 0,
    capacityOverflowHandled: false,
  },
  {
    name: "New Franklin",
    lat: 43.0770831,
    lon: -70.7791392,
    totalCapacity: 250,
    assignedStudents: 0,
    capacityOverflowHandled: false,
  },
];
