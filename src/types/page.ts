// 分页请求参数
export interface PageQuery {
  page?: number;      // 当前页码，默认 1
  pageSize?: number;  // 每页数量，默认 10
}

// 分页响应数据
export interface PageResult<T> {
  list: T[];          // 数据列表
  total: number;      // 总记录数
  page: number;       // 当前页码
  pageSize: number;   // 每页数量
  totalPages: number; // 总页数
}
