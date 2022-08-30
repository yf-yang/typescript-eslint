declare module '@typescript-eslint/eslint-plugin/dist/rules' {
  import { TSESLint } from '@typescript-eslint/utils';

  const rules: Record<string, TSESLint.RuleModule<string, unknown[]>>;
  // eslint-disable-next-line import/no-default-export
  export default rules;
}
