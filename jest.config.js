module.exports = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    transform: {
      "^.+\\.(ts|tsx|js|jsx)$": "babel-jest", // Use Babel to transform files
    },
    moduleNameMapper: {
      // Map static assets to mock files if needed (e.g., for CSS or images)
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    transformIgnorePatterns: [
      "node_modules/(?!(your-library|another-library)/)" // Add libraries if needed
    ],
  };
  