// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {
      // Optimize for production
      optimize: {
        minify: true,
        removeUnused: true,
        removeUnusedVariables: true,
      },
    },
  },
};

export default config;