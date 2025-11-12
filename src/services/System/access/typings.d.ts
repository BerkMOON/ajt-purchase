export interface ApiDetail {
  api_code?: string;
  create_time?: string;
  modify_time?: string;
  module?: string;
  name?: string;
  path_pattern?: string;
  status?: Status;
}
export interface ApiList {
  api_details?: ApiDetail[];
  level?: string;
  level_name?: string;
}

export interface ApiAccessResponse {
  api_list?: ApiList[];
}
