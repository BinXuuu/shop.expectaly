import type { ID, PaginatedResult, PaginationParams, Result, SoftDelete } from "@/types";
import { ok, err } from "@/types";
import { AppError, toAppErrorShape } from "@/lib/errors/app-error";

/**
 * 通用数据访问接口。第一期由 lib/data 中的内存数组实现（包裹 Promise 模拟异步），
 * 未来切换 Supabase 时只需提供符合本接口的新实现，调用方（services/页面）无需改动。
 */
export interface ReadRepository<T> {
  findById(id: ID): Promise<Result<T>>;
  findAll(): Promise<Result<T[]>>;
  paginate(params: PaginationParams): Promise<Result<PaginatedResult<T>>>;
}

type EntityWithId = { id: ID } & Partial<SoftDelete>;

/**
 * 基于内存数组构建一个只读仓库。软删除记录（deletedAt 非空）默认从查询结果中排除，
 * 与未来 Supabase RLS + 软删除策略保持一致的语义。
 */
export function createInMemoryRepository<T extends EntityWithId>(
  source: () => T[],
): ReadRepository<T> {
  function activeItems(): T[] {
    return source().filter((item) => !item.deletedAt);
  }

  return {
    async findById(id: ID): Promise<Result<T>> {
      try {
        const found = activeItems().find((item) => item.id === id);
        if (!found) {
          return err(AppError.notFound(`未找到 ID 为 ${id} 的记录`).toShape());
        }
        return ok(found);
      } catch (error) {
        return err(toAppErrorShape(error));
      }
    },

    async findAll(): Promise<Result<T[]>> {
      try {
        return ok(activeItems());
      } catch (error) {
        return err(toAppErrorShape(error));
      }
    },

    async paginate({ page, pageSize }: PaginationParams): Promise<Result<PaginatedResult<T>>> {
      try {
        const items = activeItems();
        const start = (page - 1) * pageSize;
        const pageItems = items.slice(start, start + pageSize);
        return ok({
          items: pageItems,
          total: items.length,
          page,
          pageSize,
          hasMore: start + pageItems.length < items.length,
        });
      } catch (error) {
        return err(toAppErrorShape(error));
      }
    },
  };
}
