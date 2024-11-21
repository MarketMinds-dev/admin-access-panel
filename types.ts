// types.ts
export type Store = {
  store_id: number;
  store_name: string;
  center_id: number;
  center_name: string;
  center_location: string;
};

export type Center = {
  id: number;
  name: string;
  location: string;
};
