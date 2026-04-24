export const permissionCatalog = [
  // Web-operations pages
  'dashboard.view',
  'fulfillment.view',
  'validation.view',
  'traceability.view',
  'regions.view',
  'analytics.view',
  // Depot
  'depot.view',
  'depot.receive',
  'depot.dispatch',
  // Laverie
  'laverie.view',
  'laverie.operate',
  // Transformation
  'transformation.view',
  'transformation.operate',
  // Transport
  'transport.view',
  'transport.manage',
  // Sales
  'sales.view',
  'sales.manage',
  // Certification
  'certification.view',
  'certification.manage',
  // Admin
  'users.view',
  'rules.view',
  'alerts.manage',
  'rules.manage',
  'rbac.manage',
  // Portals
  'institutional.view',
  // Mobile-specific (used for API guard checks on mobile endpoints)
  'collection.operate',
  'transport.operate',
] as const;

export type AppPermission = (typeof permissionCatalog)[number];

type RoleTemplate = {
  description: string;
  name: string;
  permissions: AppPermission[];
};

const allPermissions = [...permissionCatalog];

// ── 11 fixed roles — one per actor in the pipeline ──────────────
export const defaultRoleTemplates: RoleTemplate[] = [
  // ── 1. ADMIN — full control ──
  {
    name: 'central_admin',
    description: 'Full platform control — all modules, rules, RBAC.',
    permissions: allPermissions,
  },
  // ── 2. SHEPHERD — mobile only, announce wool ──
  {
    name: 'shepherd',
    description: 'Announces wool availability via mobile/SMS.',
    permissions: ['collection.operate', 'traceability.view'],
  },
  // ── 3. COLLECTOR — mobile, collect wool from shepherds ──
  {
    name: 'collector',
    description: 'Field collection — create lots, manage pre-lots.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'traceability.view',
      'collection.operate',
    ],
  },
  // ── 4. TRANSPORTER — mobile, move lots between locations ──
  {
    name: 'transporter',
    description: 'Accept jobs, GPS tracking, load/deliver lots.',
    permissions: [
      'dashboard.view',
      'traceability.view',
      'transport.view',
      'transport.operate',
      'collection.operate',
    ],
  },
  // ── 5. DEPOT MANAGER — web, warehouse operations ──
  {
    name: 'depot_manager',
    description: 'Receive lots, sort, dispatch to laverie, manage A1 alerts.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'validation.view',
      'traceability.view',
      'depot.view',
      'depot.receive',
      'depot.dispatch',
      'alerts.manage',
    ],
  },
  // ── 6. LAVERIE OPERATOR — web, wash + qualify + price ──
  {
    name: 'laverie_operator',
    description: 'Wash, qualify, grade, price, route to D3/D4.',
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
  // ── 7. TRANSFORMER OPERATOR — web, production ──
  {
    name: 'transformer_operator',
    description: 'Start/complete production runs, create products.',
    permissions: [
      'dashboard.view',
      'fulfillment.view',
      'traceability.view',
      'transformation.view',
      'transformation.operate',
      'certification.view',
    ],
  },
  // ── 8. SALES AGENT — web, orders + shipping ──
  {
    name: 'sales_agent',
    description: 'Manage orders, shipments, invoicing.',
    permissions: [
      'dashboard.view',
      'traceability.view',
      'sales.view',
      'sales.manage',
      'certification.view',
      'analytics.view',
    ],
  },
  // ── 9. CERTIFICATION AUTHORITY — web, NFN seal ──
  {
    name: 'certification_authority',
    description: 'Issue and revoke NFN certificates.',
    permissions: [
      'dashboard.view',
      'traceability.view',
      'certification.view',
      'certification.manage',
    ],
  },
  // ── 10. INSTITUTIONAL — web-institutional, read-only ──
  {
    name: 'institutional',
    description: 'Read-only ministry access — statistics, audit, lot queries.',
    permissions: [
      'institutional.view',
      'traceability.view',
      'analytics.view',
      'regions.view',
    ],
  },
  // ── 11. BUYER — web-buyer portal ──
  {
    name: 'buyer',
    description: 'Browse products, place orders, track shipments.',
    permissions: [
      'traceability.view',
      'sales.view',
      'certification.view',
    ],
  },
];

// ── userType → role template mapping (1:1) ──────────────────────
const userTypeToTemplateName: Record<string, string> = {
  central_admin: 'central_admin',
  regional_manager: 'central_admin', // regional_manager gets admin perms (legacy compat)
  shepherd: 'shepherd',
  collector: 'collector',
  transporter: 'transporter',
  depot_manager: 'depot_manager',
  laverie_operator: 'laverie_operator',
  transformer_operator: 'transformer_operator',
  sales_agent: 'sales_agent',
  certification_authority: 'certification_authority',
  institutional: 'institutional',
  buyer: 'buyer',
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
