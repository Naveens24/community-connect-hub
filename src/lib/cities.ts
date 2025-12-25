// Active cities where Assistix operates
export interface City {
  id: string;
  name: string;
  displayName: string;
}

export const ACTIVE_CITIES: City[] = [
  { id: 'bilaspur_cg', name: 'Bilaspur', displayName: 'Bilaspur, C.G' },
  { id: 'koni_bilaspur', name: 'Koni', displayName: 'Koni, Bilaspur' },
];

export const getCityById = (id: string): City | undefined => {
  return ACTIVE_CITIES.find(city => city.id === id);
};

export const getCityDisplayName = (id: string): string => {
  return getCityById(id)?.displayName || 'Unknown City';
};
