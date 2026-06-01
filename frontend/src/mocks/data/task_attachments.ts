import type { TaskAttachment } from '@types'

import {
  TASK_ACCEPTED_2026,
  TASK_DISPUTE_WON,
} from './tasks'
import { USER_STAFF_YUSUF } from './users'

// Attachment IDs use the `00000000-000d-…` namespace. `file_key` is the
// opaque object-storage key (never displayed). Signed-URL generation lives
// in the apiClient (next prompt); the dataset only stores the key.

export const TASK_ATTACHMENT_ACCEPTED_INVOICE = '00000000-000d-4000-9000-000000000001'
export const TASK_ATTACHMENT_ACCEPTED_SCREENSHOT = '00000000-000d-4000-9000-000000000002'
export const TASK_ATTACHMENT_WON_APPEAL_EVIDENCE = '00000000-000d-4000-9000-000000000003'

export const task_attachments: readonly TaskAttachment[] = [
  {
    id: TASK_ATTACHMENT_ACCEPTED_INVOICE,
    task_id: TASK_ACCEPTED_2026,
    uploaded_by: USER_STAFF_YUSUF,
    file_key: 'tasks/00000000-000c-4000-9000-000000000003/invoice.pdf',
    file_name: 'invoice.pdf',
    mime_type: 'application/pdf',
    size_bytes: 184320,
    uploaded_at: '2026-05-30T10:05:00.000Z',
  },
  {
    id: TASK_ATTACHMENT_ACCEPTED_SCREENSHOT,
    task_id: TASK_ACCEPTED_2026,
    uploaded_by: USER_STAFF_YUSUF,
    file_key: 'tasks/00000000-000c-4000-9000-000000000003/screenshot.png',
    file_name: 'screenshot.png',
    mime_type: 'image/png',
    size_bytes: 612400,
    uploaded_at: '2026-05-30T10:06:30.000Z',
  },
  {
    id: TASK_ATTACHMENT_WON_APPEAL_EVIDENCE,
    task_id: TASK_DISPUTE_WON,
    uploaded_by: USER_STAFF_YUSUF,
    file_key: 'tasks/00000000-000c-4000-9000-000000000005/appeal-evidence.pdf',
    file_name: 'appeal-evidence.pdf',
    mime_type: 'application/pdf',
    size_bytes: 942100,
    uploaded_at: '2026-05-22T17:00:00.000Z',
  },
]
