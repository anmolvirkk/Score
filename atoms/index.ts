import { MatchData } from "@/types";
import { atom } from "recoil";

export const gamesDataAtom = atom({
  key: 'gamesData',
  default: null as null | MatchData[],
});

export const filteredGamesAtom = atom({
  key: 'filteredGames',
  default: [],
});

export const filtersAtom = atom({
  key: 'fiters',
  default: {}
})

export const showMoreDetailsAtom = atom({
  key: 'showMoreDetails',
  default: true
})