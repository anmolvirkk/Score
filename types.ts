export type MatchData = {
  url: string;
  date: string;
  time: string;
  odds: {
    [team: string]: number;
  };
  tip: string;
  lastScore: {
    goals: number;
    team: string;
  }[];
  teamForm: {
    [team: string]: {
      wins: number;
      losses: number;
      draws: number;
    };
  };
  additional_data: {
    compare_teams_table_data: {
      games_won: {
        [team: string]: number;
      };
      games_lost_or_draw: {
        [team: string]: number;
      };
      games_lost: {
        [team: string]: number;
      };
      games_draw: {
        [team: string]: number;
      };
      last_five_games: {
        [team: string]: {
          wins: number;
          draws: number;
          losses: number;
        };
      };
      last_five_games_against_each_other: {
        [team: string]: {
          wins: number;
          draws: number;
          losses: number;
        };
      };
    };
    predictions_table_data: {
      winner: {
        confidence: number;
        team: string;
      };
      goals: number;
      score: {
        winner: number;
        loser: number;
      };
    };
    head_to_head_table_data: {
      [date: string]: {
        [team: string]: number;
      };
    };
    latest_games_goals_table_data: {
      "over 1.5": {
        [team: string]: string;
      };
      "over 2.5": {
        [team: string]: string;
      };
      "over 3.5": {
        [team: string]: string;
      };
      average_scored: {
        [team: string]: number;
      };
      average_conceded: {
        [team: string]: number;
      };
    };
    power_rank_table_data: {
      [team : string]: {
        [team: string]: {
          W: number;
          D: number;
          L: number;
          GOALS: string;
          O2_5: string;
          BTTS: string;
          POWER: number;
        };
      } | {
        W: number;
        D: number;
        L: number;
        GOALS: string;
        O2_5: string;
        BTTS: string;
        POWER: number;
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
    overall_standings_table_data: {
      [team: string]: {
        position: number;
        G: string;
        W: number;
        D: number;
        L: number;
        P: number;
      };
    };
  };
};