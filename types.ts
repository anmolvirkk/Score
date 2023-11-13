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
      team: string;
      goals: number;
    }[];
    minMaxGoals: {
      highestTotalGoals: {
        score: number;
        teams: {
          team: string;
          score: number;
        }[]
      };
      lowestTotalGoals: {
        score: number;
        teams: {
          team: string;
          score: number;
        }[]
      };
      highestTeam1Score: {
        team: string,
        score: number
      };
      lowestTeam1Score: {
        team: string,
        score: number
      };
      highestTeam2Score: {
        team: string,
        score: number
      };
      lowestTeam2Score: {
        team: string,
        score: number
      };
    };
  };
  home_team_table_data: {
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
  home_team_data: {
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
      team: string;
      goals: number;
    };
    minMaxGoals: {
      highestTotalGoals: {
        score: number;
        teams: {
          team: string;
          score: number;
        }[]
      };
      lowestTotalGoals: {
        score: number;
        teams: {
          team: string;
          score: number;
        }[]
      };
      highestTeamScore: {
        team: string,
        score: number
      };
      lowestTeamScore: {
        team: string,
        score: number
      };
    };
  };
  away_team_table_data: {
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
  away_team_data: {
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
      team: string;
      goals: number;
    };
    minMaxGoals: {
      highestTotalGoals: {
        score: number;
        teams: {
          team: string;
          score: number;
        }[]
      };
      lowestTotalGoals: {
        score: number;
        teams: {
          team: string;
          score: number;
        }[]
      };
      highestTeamScore: {
        team: string,
        score: number
      };
      lowestTeamScore: {
        team: string,
        score: number
      };
    };
  };
};