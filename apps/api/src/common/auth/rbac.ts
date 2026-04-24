export const permissionCatalog = [
  'dashboard.view',
  'fulfillment.view',
  'validation.view',
  'traceability.view',
  'depot.view',
  'depot.receive',
  'depot.dispatch',
  'laverie.view',
  'laverie.operate',
  'transformation.view',
  'transformation.operate',
  'transport.view',
  'transport.manage',
  'sales.view',
  'sales.manage',
  'certification.view',
  'certification.manage',
  'regions.view',
  'analytics.view',
  'users.view',
  'rules.view',
  'alerts.manage',
  'rules.manage',
  'rbac.manage',
  'institutional.view',
] as const;

export type AppPermission = (typeof permissionCatalog)[number];

type RoleTemplate = {
  description: string;
  name: string;
  permissions: AppPermission[];
};

const allPermissions = [...permissionCatalog];

export const defaultRoleTemplates: RoleTemplate[] = [
  {
    name: 'central_admin',
    description: 'Full internal command and configuration access.',
    permissions: allPermissions,
  },
  {
    name: 'regional_manager',
    description: 'Regional supervision across operations, control, and actors.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'validation.view',
      'traceability.view',
      'depot.view',
      'depot.receive',
      'depot.dispatch',
      'laverie.view',
      'laverie.operate',
      'transport.view',
      'transport.manage',
      'certification.view',
      'regions.view',
      'analytics.view',
      'users.view',
      'rules.view',
    ],
  },
  {
    name: 'depot_manager',
    description: 'Control over depot flow, validation, and traceability.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'validation.view',
      'traceability.view',
      'depot.view',
      'depot.receive',
      'depot.dispatch',
    ],
  },
  {
    name: 'laverie_operator',
    description: 'Wash-line operations, validation, and qualification visibility.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'validation.view',
      'traceability.view',
      'laverie.view',
      'laverie.operate',
      'certification.view',
    ],
  },
  {
    name: 'transformer_operator',
    description: 'Transformation run visibility and downstream traceability.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'traceability.view',
      'transformation.view',
      'transformation.operate',
      'certification.view',
    ],
  },
  {
    name: 'sales_agent',
    description: 'Commercial flow, certification visibility, and analytics.',
    permissions: [
      'dashboard.view',
      'traceability.view',
      'sales.view',
      'sales.manage',
      'certification.view',
      'analytics.view',
    ],
  },
  {
    name: 'collector',
    description: 'Read-only follow-up on field intake and lineage.',
    permissions: ['dashboard.view', 'fulfillment.view', 'traceability.view'],
  },
  {
    name: 'control_supervisor',
    description: 'Cross-phase validation and alert handling overlay role.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'validation.view',
      'traceability.view',
      'alerts.manage',
    ],
  },
  {
    name: 'rules_admin',
    description: 'Rule-engine management overlay role.',
    permissions: ['dashboard.view', 'rules.view', 'rules.manage'],
  },
  {
    name: 'rbac_admin',
    description: 'Access governance and RBAC overlay role.',
    permissions: ['dashboard.view', 'users.view', 'rbac.manage'],
  },
  {
    name: 'certification_authority',
    description: 'Seal issuance and revocation authority.',
    permissions: [
      'dashboard.view',
      'traceability.view',
      'certification.view',
      'certification.manage',
    ],
  },
];

const userTypeToTemplateName: Record<string, string> = {
  central_admin: 'central_admin',
  regional_manager: 'regional_manager',
  depot_manager: 'depot_manager',
  laverie_operator: 'laverie_operator',
  transformer_operator: 'transformer_operator',
  sales_agent: 'sales_agent',
  collector: 'collector',
  system: 'central_admin',
};

export function getDefaultPermissionsForUserType(userType: string | null | undefined) {
  if (!userType) {
    return [];
  }

  const templateName = userTypeToTemplateName[userType];
  const template = defaultRoleTemplates.find((role) => role.name === templateName);
  return template?.permissions ?? [];
}

export function mergePermissions(
  basePermissions: string[],
  assignedPermissions: string[],
) {
  return [...new Set([...basePermissions, ...assignedPermissions])].filter(
    (permission): permission is AppPermission =>
      permissionCatalog.includes(permission as AppPermission),
  );
}
