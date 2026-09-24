export type FieldErrors = Record<string, string[]>;

export type ActionResult<T = undefined> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; fieldErrors?: FieldErrors };

export type ActionFailure = Extract<ActionResult, { success: false }>;
