// app/lib/utils/whatsapp-server.ts
'use server';

export interface WhatsAppMessage {
  to: string;
  message: string;
  template?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  language?: string;
  components?: Array<{
    type: 'header' | 'body' | 'footer';
    parameters: Array<{
      type: 'text' | 'image' | 'document' | 'button';
      text?: string;
      image?: { link: string };
      document?: { link: string; filename: string };
      button?: { payload: string; text: string };
    }>;
  }>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  to?: string;
  timestamp?: string;
  retryCount?: number;
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  verifyToken?: string;
  apiVersion?: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: Partial<WhatsAppConfig> = {
  apiVersion: 'v18.0',
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 30000,
};

export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<WhatsAppSendResult> {
  const config = getConfig();
  const validation = validateConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      error: `WhatsApp not configured: ${validation.errors.join(', ')}`,
    };
  }

  const phone = sanitizePhoneNumber(message.to);
  if (!phone) {
    return {
      success: false,
      error: 'Invalid phone number format',
      to: message.to,
    };
  }

  let lastError: string | undefined;
  let retryCount = 0;
  const maxRetries = config.maxRetries || 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendViaAPI(phone, message.message, config);

      if (result.success) {
        return {
          success: true,
          messageId: result.messageId,
          to: phone,
          timestamp: new Date().toISOString(),
          retryCount: attempt - 1,
        };
      }

      lastError = result.error || 'Unknown error';
      retryCount = attempt;

      if (attempt < maxRetries) {
        const delay = config.retryDelay || 2000;
        await sleep(delay * attempt);
      }

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      retryCount = attempt;

      if (attempt < maxRetries) {
        const delay = config.retryDelay || 2000;
        await sleep(delay * attempt);
      }
    }
  }

  return {
    success: false,
    error: `Failed after ${retryCount} attempts: ${lastError}`,
    to: phone,
    timestamp: new Date().toISOString(),
    retryCount,
  };
}

export async function sendWhatsAppTemplateMessage(
  template: WhatsAppTemplateMessage
): Promise<WhatsAppSendResult> {
  const config = getConfig();
  const validation = validateConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      error: `WhatsApp not configured: ${validation.errors.join(', ')}`,
    };
  }

  const phone = sanitizePhoneNumber(template.to);
  if (!phone) {
    return {
      success: false,
      error: 'Invalid phone number format',
      to: template.to,
    };
  }

  try {
    const response = await sendTemplateViaAPI(phone, template, config);

    if (response.success) {
      return {
        success: true,
        messageId: response.messageId,
        to: phone,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: response.error || 'Template send failed',
      to: phone,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      to: phone,
    };
  }
}

export async function sendBulkWhatsAppMessages(
  messages: WhatsAppMessage[],
  concurrency: number = 5
): Promise<WhatsAppSendResult[]> {
  const results: WhatsAppSendResult[] = [];
  const chunks = chunkArray(messages, concurrency);

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(msg => sendWhatsAppMessage(msg))
    );
    results.push(...chunkResults);
  }

  return results;
}

function getConfig(): WhatsAppConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    ...DEFAULT_CONFIG,
  };
}

function validateConfig(config: WhatsAppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.phoneNumberId || config.phoneNumberId === 'placeholder') {
    errors.push('Phone number ID not configured');
  }

  if (!config.accessToken || config.accessToken === 'placeholder') {
    errors.push('Access token not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function sanitizePhoneNumber(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 8 || cleaned.length > 15) {
    return null;
  }

  if (cleaned.startsWith('0')) {
    return `237${cleaned.slice(1)}`;
  }

  if (!cleaned.startsWith('237') && cleaned.length <= 9) {
    return `237${cleaned}`;
  }

  return cleaned;
}

async function sendViaAPI(
  phone: string,
  message: string,
  config: WhatsAppConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('WhatsApp API error:', data);
    return {
      success: false,
      error: data.error?.message || 'Failed to send message',
    };
  }

  return {
    success: true,
    messageId: data.messages?.[0]?.id,
  };
}

async function sendTemplateViaAPI(
  phone: string,
  template: WhatsAppTemplateMessage,
  config: WhatsAppConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: template.templateName,
      language: { code: template.language || 'en' },
    },
  };

  if (template.components && template.components.length > 0) {
    const templatePayload = payload.template as { name: string; language: { code: string }; components?: unknown };
    templatePayload.components = template.components;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('WhatsApp template error:', data);
    return {
      success: false,
      error: data.error?.message || 'Failed to send template',
    };
  }

  return {
    success: true,
    messageId: data.messages?.[0]?.id,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}