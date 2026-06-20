export const mockGlobalStats = {
  totalUsers: 12847,
  totalCompletions: 89234,
  globalCompletionRate: 67,
  labCompletionRates: {
    'sqli-001': 89,
    'sqli-002': 76,
    'xss-001': 91,
    'xss-002': 84,
    'ssrf-001': 72,
    'csrf-001': 78,
    'path-001': 85,
    'idor-001': 80,
    'jwt-001': 69,
    'cmdi-001': 73,
  },
  mostAttempted: ['sqli-001', 'xss-001', 'xss-002', 'csrf-001', 'path-001'],
  hardest: ['smuggling-001', 'jwt-003', 'ssti-002', 'sqli-005', 'cache-001'],
  weeklyStats: {
    completions: 1247,
    newUsers: 342,
    avgTimePerLab: 23,
  }
};

