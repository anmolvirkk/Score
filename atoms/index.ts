import { atom } from "recoil";

export const searchAtom = atom({
  key: 'search',
  default: '',
});

export const minimumGoalsLastMatchAtom = atom({
  key: 'minimumGoalsLastMatch',
  default: [0,0],
});