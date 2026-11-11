import type { CinevaultMedia, OnboardingFilters } from '../services/tmdb';

export type { CinevaultMedia, OnboardingFilters };

export type Tab = 'tonight' | 'wl' | 'wd';

export type FeedView = 'grid' | 'list';

export type CategoryFilter = 'all' | 'movie' | 'tv' | 'anime';

export type SortFilter = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc';

export type Sel = Record<string, Set<string>>;

export interface StepOpt {
  id: string;
  label: string;
  desc?: string;
}

export interface StepGroup {
  key: string;
  label?: string;
  min: number;
  max: number;
  opts: StepOpt[];
}

export interface ScreenDef {
  h: string;
  s: string;
  step: number;
  type: 'tiles' | 'pills';
  layout?: 'posters' | 'svg_time';
  groups: StepGroup[];
}
