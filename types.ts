export type MatchData = {
  url: string;
  date: string;
  time: string;
  odds: {
    [team: string]: number;
  };
  head_to_head_table_data: {
    date: string;
    home: {
      team: string;
      score: number;
    };
    away: {
      team: string;
      score: number;
    };
  }[];
  head_to_head_data: {
    goals: {
      [team: string]: number;
      total: number;
    };
    form: {
      [team: string]: {
        wins: number;
        losses: number;
        draws: number;
      };
    };
    average_scored: {
      [team: string]: number;
    };
    total_matches: number;
    thresholds: {
      threshold: number;
      teams: {
        team: string;
        matches_over_threshold: number;
        percentage_over_threshold: string;
      }[];
    }[];
    prediction: {
      goals: {
        over: null | number;
        under: null | number;
      };
      winner: null | {
        team: string;
        confidence: string;
      };
    };
  };
  home_team_table_data: {
    [date: string]: {
      [team: string]: number;
    };
  };
  away_team_table_data: {
    [date: string]: {
      [team: string]: number;
    };
  };
};