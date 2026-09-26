const fs = require('fs');
const path = require('path');

const alertsFile = path.resolve(__dirname, '../../shrimp-core-backend/src/modules/alerts/alerts.service.ts');
let alertsContent = fs.readFileSync(alertsFile, 'utf8');

// 1. imports
alertsContent = alertsContent.replace(
  /import \{ Injectable, NotFoundException \} from '@nestjs\/common';/g,
  `import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';`
);

alertsContent = alertsContent.replace(
  /import \{ AlertStatus \} from '\.\.\/\.\.\/common\/enums\/alert-status\.enum\.js';/g,
  `import { AlertStatus } from '../../common/enums/alert-status.enum.js';\nimport { Role } from '../../common/enums/role.enum.js';`
);

// 2. findAll
alertsContent = alertsContent.replace(
  /async findAll\(query: QueryAlertDto\): Promise<\{ data: Alert\[\]; total: number \}> \{/g,
  `async findAll(query: QueryAlertDto & { userId?: string }): Promise<{ data: Alert[]; total: number }> {`
);

alertsContent = alertsContent.replace(
  /const \{ page = 1, limit = 20, deviceId, isResolved \} = query;/g,
  `const { page = 1, limit = 20, deviceId, isResolved, userId } = query;`
);

// We need to inject the userId filter into findAll. Let's find the closing brace of `if (isResolved !== undefined)` block.
alertsContent = alertsContent.replace(
  /qb\.andWhere\('alert\.status = :status', \{ status \}\);\s*\}/g,
  `qb.andWhere('alert.status = :status', { status });\n    }\n\n    if (userId) {\n      qb.andWhere('pond.user_id = :userId', { userId });\n    }`
);

// 3. resolveAlert
alertsContent = alertsContent.replace(
  /async resolveAlert\([\s\S]*?\): Promise<Alert> \{[\s\S]*?const alert = await this\.alertRepo\.findOne\(\{ where: \{ alertId \} \}\);/g,
  `async resolveAlert(
    alertId: string,
    userId: string,
    dto: ResolveAlertDto,
    role?: Role,
  ): Promise<Alert> {
    const alert = await this.alertRepo.findOne({ where: { alertId }, relations: { pond: true } });`
);

alertsContent = alertsContent.replace(
  /if \(!alert\) \{\s*throw new NotFoundException\(`Alert with ID \$\{alertId\} not found`\);\s*\}/g,
  `if (!alert) {\n      throw new NotFoundException(\`Alert with ID \$\{alertId\} not found\`);\n    }\n\n    if (role && role !== Role.MANAGER && role !== Role.ADMIN) {\n      if (alert.pond?.userId !== userId) {\n        throw new ForbiddenException('Bạn không có quyền xử lý cảnh báo này!');\n      }\n    }`
);

fs.writeFileSync(alertsFile, alertsContent, 'utf8');

const telemetryFile = path.resolve(__dirname, '../../shrimp-core-backend/src/modules/telemetry/telemetry.service.ts');
let telemetryContent = fs.readFileSync(telemetryFile, 'utf8');

telemetryContent = telemetryContent.replace(
  /import \{ AlertStatus \} from '\.\.\/\.\.\/common\/enums\/alert-status\.enum\.js';/g,
  `import { AlertStatus } from '../../common/enums/alert-status.enum.js';\nimport { Role } from '../../common/enums/role.enum.js';`
);

telemetryContent = telemetryContent.replace(
  /async processTelemetryPayload\(dto: CreateTelemetryDto\): Promise<TelemetryData \| null> \{/g,
  `async checkDeviceAccess(deviceId: string, userId: string, role: Role): Promise<boolean> {
    if (role === Role.ADMIN || role === Role.MANAGER) return true;
    const device = await this.deviceRepo.findOne({ where: { deviceId }, relations: { pond: true } });
    if (!device || !device.pond) return false;
    return device.pond.userId === userId;
  }

  async processTelemetryPayload(dto: CreateTelemetryDto): Promise<TelemetryData | null> {`
);

fs.writeFileSync(telemetryFile, telemetryContent, 'utf8');
console.log('Update complete');
