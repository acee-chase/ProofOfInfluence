import { db } from "../db";
import {
  agents,
  vaultAgentPermissions,
  type InsertAgent,
  type InsertVaultAgentPermission,
  type VaultAgentPermission,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * AgentPermissionService - Manages agent permissions for vaults
 */
export class AgentPermissionService {
  /**
   * Grant permissions to an agent for a vault
   */
  async grant(
    vaultId: string,
    agentId: string,
    scopes: string[],
    constraints?: Record<string, any>
  ): Promise<VaultAgentPermission> {
    // Ensure agent exists
    await this.ensureAgentExists(agentId);

    // Check if permission already exists
    const existing = await db
      .select()
      .from(vaultAgentPermissions)
      .where(and(eq(vaultAgentPermissions.vaultId, vaultId), eq(vaultAgentPermissions.agentId, agentId)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing permission
      const [updated] = await db
        .update(vaultAgentPermissions)
        .set({
          scopes,
          constraints: constraints || null,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(vaultAgentPermissions.id, existing[0].id))
        .returning();
      return updated;
    }

    // Create new permission
    const [permission] = await db
      .insert(vaultAgentPermissions)
      .values({
        vaultId,
        agentId,
        scopes,
        constraints: constraints || null,
        status: "active",
      } as InsertVaultAgentPermission)
      .returning();

    return permission;
  }

  /**
   * Assert that an agent has a specific scope for a vault
   * Throws error if permission is denied
   */
  async assertAgentAllowed(vaultId: string, agentId: string, scope: string): Promise<void> {
    const permission = await this.findActivePermission(vaultId, agentId);

    if (!permission) {
      const error: any = new Error(`Permission denied: no permission found for agent ${agentId} on vault ${vaultId}`);
      error.code = "PERMISSION_DENIED";
      throw error;
    }

    const scopes: string[] = (permission.scopes as any) || [];
    if (!scopes.includes(scope)) {
      const error: any = new Error(`Permission denied: scope ${scope} not granted`);
      error.code = "PERMISSION_DENIED";
      throw error;
    }

    // Check constraints if any
    if (permission.constraints) {
      const constraints = permission.constraints as any;
      // Example: check maxMints
      if (scope === "badge.mint" && constraints.maxMints !== undefined) {
        // TODO: Track mint count and enforce constraint
        // For now, we just check the constraint exists
      }
      // Example: check expiresAt
      if (constraints.expiresAt) {
        const expiresAt = new Date(constraints.expiresAt);
        if (new Date() > expiresAt) {
          const error: any = new Error(`Permission expired: scope ${scope} expired at ${expiresAt}`);
          error.code = "PERMISSION_DENIED";
          throw error;
        }
      }
    }
  }

  /**
   * Find active permission for vault and agent
   */
  async findActivePermission(
    vaultId: string,
    agentId: string
  ): Promise<VaultAgentPermission | null> {
    const [permission] = await db
      .select()
      .from(vaultAgentPermissions)
      .where(
        and(
          eq(vaultAgentPermissions.vaultId, vaultId),
          eq(vaultAgentPermissions.agentId, agentId),
          eq(vaultAgentPermissions.status, "active")
        )
      )
      .limit(1);

    return permission || null;
  }

  /**
   * Revoke permission
   */
  async revoke(vaultId: string, agentId: string): Promise<void> {
    await db
      .update(vaultAgentPermissions)
      .set({
        status: "revoked",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(vaultAgentPermissions.vaultId, vaultId),
          eq(vaultAgentPermissions.agentId, agentId)
        )
      );
  }

  /**
   * Ensure agent exists, create if not
   */
  private async ensureAgentExists(agentId: string): Promise<void> {
    const [existing] = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);

    if (!existing) {
      // Create default agent
      const agentType = agentId.includes("system") || agentId.includes("admin") ? "system" : "user";
      const agentName = agentId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      await db.insert(agents).values({
        id: agentId,
        type: agentType,
        name: agentName,
      } as InsertAgent);
    }
  }
}

export const agentPermissionService = new AgentPermissionService();
