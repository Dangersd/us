import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
    ...nextCoreWebVitals,
    eslintPluginPrettierRecommended,
    {
        plugins: {
            import: eslintPluginImport,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "react-hooks/exhaustive-deps": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/ban-types": "off",
            "import/no-anonymous-default-export": "off",
            "@typescript-eslint/no-wrapper-object-types": "off",
            "prettier/prettier": "warn",
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["./*", "../*", "./", "../"],
                            message:
                                "Relative imports are not allowed. Use absolute imports with aliases (~, @) or package names instead.",
                        },
                    ],
                },
            ],
            "import/no-unresolved": "error",
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
                node: {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                },
            },
        },
    },
]);

export default eslintConfig;
