import { api } from "@/lib/api";

export const fetcher = <T>(path: string): Promise<T> => api.get<T>(path);
