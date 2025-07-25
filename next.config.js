/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    typescript: {
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig 