import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "schema.gql",
  documents: ["src/**"],
  generates: {
    "./src/gql/generated/": {
      preset: "client",
      plugins: ["fragment-matcher"],
    },
  },
  config: {
    namingConvention: {
      typeNames: "keep",
      enumValues: "keep",
    },
  },
};

export default config;
