import apiClient from '../api/client';

export const githubScannerService = {
  /**
   * Scan a public GitHub repository
   * @param {string} repoUrl - URL or owner/repo format
   */
  async scanRepository(repoUrl) {
    const res = await apiClient.post('/github/scan-repo', { repoUrl });
    return res.data?.data || res.data;
  },

  /**
   * Import and verify detected skills into the student's profile
   */
  async verifyAndImportSkills(repoUrl, detectedSkills, proficiencyLevel = 'INTERMEDIATE') {
    const res = await apiClient.post('/github/verify-and-import-skills', {
      repoUrl,
      detectedSkills,
      proficiencyLevel,
    });
    return res.data;
  },
};

export default githubScannerService;

