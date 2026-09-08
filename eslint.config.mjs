import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import n8n from 'eslint-plugin-n8n-nodes-base';
import parser from '@typescript-eslint/parser';

export default [
    { ignores: ['dist/**', 'node_modules/**', 'tests/**', 'scripts/**'] },
    n8nCommunityNodesPlugin.configs.recommended,
    { plugins: { 'n8n-nodes-base': n8n }, languageOptions: { parser } },
    { files: ['package.json'], rules: n8n.configs.community.rules },
    { files: ['credentials/**/*.ts'], rules: {
        ...n8n.configs.credentials.rules,
        'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
        'n8n-nodes-base/cred-class-field-type-options-password-missing': 'off',
    } },
    { files: ['nodes/**/*.ts'], rules: {
        ...n8n.configs.nodes.rules,
        'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
        'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
        'n8n-nodes-base/node-param-type-options-max-value-present': 'off',
    } },
];
