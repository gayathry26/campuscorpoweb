import apiClient from '../api/client';

export const githubScannerService = {
  /**
   * Scan a public GitHub repository or user profile
   * @param {string} repoUrl - URL, owner/repo, or username
   * @param {string} [githubToken] - Optional PAT for private repos or higher rate limits
   */
  async scanRepository(repoUrl, githubToken = '') {
    const payload = { repoUrl };
    if (githubToken && githubToken.trim()) {
      payload.githubToken = githubToken.trim();
    }
    const res = await apiClient.post('/github/scan-repo', payload);
    return res.data?.data || res.data;
  },

  /**
   * Live Server-Sent Events (SSE) scan stream with progressive step updates
   * Automatically falls back to REST POST if SSE connection drops
   */
  scanRepositoryLiveStream(repoUrl, { githubToken = '', onProgress } = {}) {
    return new Promise((resolve, reject) => {
      if (typeof EventSource === 'undefined') {
        return this.scanRepository(repoUrl, githubToken).then(resolve).catch(reject);
      }

      const params = new URLSearchParams({ repoUrl: String(repoUrl || '').trim() });
      if (githubToken && githubToken.trim()) {
        params.set('githubToken', githubToken.trim());
      }

      const es = new EventSource(`/api/v1/github/scan-stream?${params.toString()}`);
      let settled = false;

      es.addEventListener('progress', (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          onProgress && onProgress(parsed);
        } catch (e) {}
      });

      es.addEventListener('complete', (ev) => {
        if (settled) return;
        settled = true;
        es.close();
        try {
          const parsed = JSON.parse(ev.data);
          resolve(parsed.data || parsed);
        } catch (e) {
          reject(new Error('Invalid scan response received from live stream.'));
        }
      });

      es.addEventListener('scan_error', (ev) => {
        if (settled) return;
        settled = true;
        es.close();
        try {
          const parsed = JSON.parse(ev.data);
          reject(new Error(parsed.message || 'Live repository scan failed.'));
        } catch (e) {
          reject(new Error('Live repository scan failed.'));
        }
      });

      es.onerror = () => {
        if (settled) return;
        settled = true;
        es.close();
        // Graceful fallback to standard REST POST endpoint
        this.scanRepository(repoUrl, githubToken).then(resolve).catch(reject);
      };
    });
  },

  /**
   * Fetch live public repositories for a GitHub user/organization
   */
  async getUserRepositories(username, githubToken = '') {
    const params = githubToken ? { githubToken } : {};
    const res = await apiClient.get(`/github/user-repos/${encodeURIComponent(username)}`, { params });
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
