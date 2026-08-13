import type { Address, Profile, Result, UserRoleAssignment } from "@/types";
import { ok } from "@/types";
import { mockAddresses, mockProfiles, mockUserRoleAssignments } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const profileRepository = {
  ...createInMemoryRepository<Profile>(() => mockProfiles),

  async findByAuthUserId(authUserId: string): Promise<Result<Profile | null>> {
    return ok(mockProfiles.find((p) => p.authUserId === authUserId && !p.deletedAt) ?? null);
  },

  async findByEmail(email: string): Promise<Result<Profile | null>> {
    const normalized = email.trim().toLowerCase();
    return ok(
      mockProfiles.find((p) => p.email?.toLowerCase() === normalized && !p.deletedAt) ?? null,
    );
  },

  async findByPhone(phone: string): Promise<Result<Profile | null>> {
    const normalized = phone.trim().replace(/\s+/g, "");
    return ok(
      mockProfiles.find((p) => p.phone?.replace(/\s+/g, "") === normalized && !p.deletedAt) ?? null,
    );
  },
};

export const userRoleAssignmentRepository = {
  ...createInMemoryRepository<UserRoleAssignment>(() => mockUserRoleAssignments),

  async findByUser(userId: string): Promise<Result<UserRoleAssignment[]>> {
    return ok(mockUserRoleAssignments.filter((a) => a.userId === userId && !a.deletedAt));
  },
};

export const addressRepository = {
  ...createInMemoryRepository<Address>(() => mockAddresses),

  async findByUser(userId: string): Promise<Result<Address[]>> {
    return ok(mockAddresses.filter((a) => a.userId === userId && !a.deletedAt));
  },
};
