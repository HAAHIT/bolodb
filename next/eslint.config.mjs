import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];
