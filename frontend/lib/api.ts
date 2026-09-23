export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiOptions {
  method?: string;
  token?: string | null;
  body?: unknown;
  form?: FormData;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? "Terjadi kesalahan pada server.";
    throw new ApiError(res.status, message, data?.errors);
  }

  return data as T;
}

export async function downloadFile(
  path: string,
  token: string | null,
  filename: string,
): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data?.message ?? "Gagal mengunduh berkas.");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Buka berkas (mis. PDF) di tab baru untuk dilihat/dicetak, bukan dipaksa
 * unduh. Tab kosong dibuka lebih dulu (synchronous, sebelum fetch) supaya
 * tidak diblokir popup blocker karena request-nya async.
 */
export async function openFileInNewTab(path: string, token: string | null): Promise<void> {
  const win = window.open("", "_blank");

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, { headers });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new ApiError(res.status, data?.message ?? "Gagal membuka berkas.");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    if (win) {
      win.location.href = url;
    } else {
      // Popup diblokir browser → fallback unduh langsung.
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } catch (err) {
    win?.close();
    throw err;
  }
}

export function firstError(errors: Record<string, string[]> | undefined, fallback: string): string {
  if (!errors) return fallback;
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey][0] : fallback;
}