/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: process.env.NODE_ENV === 'production' ? '/SurveyDU' : '',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    distDir: 'out',
    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig 