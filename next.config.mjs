/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const repoName = '/AllIndiaAccountable';

const nextConfig = {
  output: 'export',
  basePath: isGitHubPages ? repoName : '',
  assetPrefix: isGitHubPages ? repoName : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
