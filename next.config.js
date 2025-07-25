/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.NODE_ENV === 'production' ? '/SurveyDU' : '',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig 