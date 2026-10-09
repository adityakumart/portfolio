import { User, UserModules } from '@portfolio/shared-types';

export interface UserModuleConfig {
  key: keyof UserModules;
  label: string;
  route: string;
  icon: string;
  description: string;
  badge: string;
  gradientClass: string;
  iconBgClass: string;
  iconTextClass: string;
}

export const USER_MODULES: UserModuleConfig[] = [
  {
    key: 'aiSpace',
    label: 'AI Space',
    route: '/user/chat',
    icon: 'lucideZap',
    description:
      'Engage in real-time streaming conversations with full contextual conversation tracking and multi-turn insights.',
    badge: 'Real-Time',
    gradientClass:
      'bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-700 hover:to-amber-600 text-white shadow-md shadow-violet-500/15',
    iconBgClass: 'bg-amber-500/10 border-amber-500/20',
    iconTextClass: 'text-amber-500',
  },
  {
    key: 'aiAssistant',
    label: 'AI Assistant',
    route: '/user/ai',
    icon: 'lucideMessageSquare',
    description:
      'Ask questions, format code, and get real-time pair programming assistance from your personalized AI copilot.',
    badge: 'Copilot',
    gradientClass:
      'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md',
    iconBgClass: 'bg-primary/10 border-primary/20',
    iconTextClass: 'text-primary',
  },
  {
    key: 'fileManager',
    label: 'File Manager',
    route: '/user/files',
    icon: 'lucideFolderArchive',
    description:
      'Upload, download, organize, and securely manage your project storage files in your isolated, encrypted vault.',
    badge: 'Storage',
    gradientClass:
      'bg-card border border-border/80 hover:bg-accent text-foreground',
    iconBgClass: 'bg-cyan-500/10 border-cyan-500/20',
    iconTextClass: 'text-cyan-500',
  },
  {
    key: 'dietHydration',
    label: 'Diet & Hydration',
    route: '/user/diet-hydration',
    icon: 'lucideActivity',
    description:
      'Track your daily nutrition, calorie intake, hydration targets, and wellness health metrics.',
    badge: 'Health',
    gradientClass:
      'bg-card border border-border/80 hover:bg-accent text-foreground',
    iconBgClass: 'bg-emerald-500/10 border-emerald-500/20',
    iconTextClass: 'text-emerald-500',
  },
  {
    key: 'planner',
    label: 'Planner',
    route: '/user/planner',
    icon: 'lucideCheckSquare',
    description:
      'Capture instant notes, organize prioritized checklists, and receive intelligent reminders.',
    badge: 'Productivity',
    gradientClass:
      'bg-card border border-border/80 hover:bg-accent text-foreground',
    iconBgClass: 'bg-teal-500/10 border-teal-500/20',
    iconTextClass: 'text-teal-500',
  },
  {
    key: 'game',
    label: 'Movie Guesser',
    route: '/user/game',
    icon: 'lucideGamepad2',
    description:
      'Time-based multiplayer game guessing Telugu movies from English translations with text-to-speech audio clues.',
    badge: 'Multiplayer',
    gradientClass:
      'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-500/15',
    iconBgClass: 'bg-violet-500/10 border-violet-500/20',
    iconTextClass: 'text-violet-400',
  },
  {
    key: 'movies',
    label: 'Movies Dataset',
    route: '/user/movies',
    icon: 'lucideFilm',
    description:
      'Manage and explore the movie dataset, review Telugu titles and English translations.',
    badge: 'Dataset',
    gradientClass:
      'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-md shadow-amber-500/15',
    iconBgClass: 'bg-amber-500/10 border-amber-500/20',
    iconTextClass: 'text-amber-500',
  },
];

/**
 * Returns all modules currently assigned (flag is true) for the given user.
 */
export function getAssignedUserModules(
  user: User | null | undefined,
): UserModuleConfig[] {
  if (!user || !user.modules) {
    return [];
  }
  return USER_MODULES.filter((moduleConfig) => {
    return Boolean(user.modules?.[moduleConfig.key]);
  });
}

/**
 * Evaluates destination navigation based on user module assignments:
 * - 0 modules assigned -> 'none' (navigate to /user/no-modules)
 * - 1 module assigned -> 'single' (directly navigate to that module's route)
 * - >1 modules assigned -> 'multiple' (show default user hub at /user)
 */
export function resolveUserDestination(user: User | null | undefined): {
  mode: 'none' | 'single' | 'multiple';
  targetRoute: string;
  assigned: UserModuleConfig[];
} {
  const assigned = getAssignedUserModules(user);
  if (assigned.length === 0) {
    return {
      mode: 'none',
      targetRoute: '/user/no-modules',
      assigned,
    };
  }
  if (assigned.length === 1) {
    return {
      mode: 'single',
      targetRoute: assigned[0].route,
      assigned,
    };
  }
  return {
    mode: 'multiple',
    targetRoute: '/user',
    assigned,
  };
}
