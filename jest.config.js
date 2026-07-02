/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transformIgnorePatterns: [
    "/node_modules/(?!(react-markdown|remark-gfm|rehype-raw|rehype-sanitize|micromark|mdast-util-.*|unist-util-.*|unified|bail|is-plain-obj|trough|vfile.*|hast-util-.*|hastscript|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|zwitch|html-void-elements|decode-named-character-reference|character-entities|devlop|escape-string-regexp|markdown-table|ccount|parse-entities|stringify-entities|trim-lines)/)",
  ],
};
