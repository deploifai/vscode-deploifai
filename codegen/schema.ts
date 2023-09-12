import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: process.env.SCHEMA,
  generates: {
    "./schema.gql": {
      plugins: ["schema-ast"],
    },
  },
};

export default config;
