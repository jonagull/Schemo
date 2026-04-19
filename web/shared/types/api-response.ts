export enum ApiResponseStatusCode {
  Success = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ImATeapot = 418,
  InternalServerError = 500,
}

export type ResponseData<T> = T | undefined | null

export interface ApiResponse<T> {
  success: boolean
  statusCode: ApiResponseStatusCode
  message?: string
  data: ResponseData<T>
  timestamp: string
}
