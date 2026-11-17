import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export interface ProductTranslationRequest {
  name_vi?: string;
  subtitle_vi?: string;
  description_vi?: string;
  roast_profile_vi?: string;
  tasting_notes_vi?: string;
  blend_summary_vi?: string;
  gallery_captions_vi?: string[];
  variant_labels_vi?: string[];
}

export interface ProductTranslationResponse {
  name_en?: string;
  subtitle_en?: string;
  description_en?: string;
  roast_profile_en?: string;
  tasting_notes_en?: string;
  blend_summary_en?: string;
  gallery_captions_en?: string[];
  variant_labels_en?: string[];
}

export class GeminiTranslationError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'GEMINI_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiTranslationError(
      'Chưa cấu hình GEMINI_API_KEY trên máy chủ để tự động dịch AI.',
      503,
      'MISSING_API_KEY'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function translateProductViToEn(
  input: ProductTranslationRequest
): Promise<ProductTranslationResponse> {
  const payload: ProductTranslationRequest = {};
  if (input.name_vi?.trim()) payload.name_vi = input.name_vi.trim();
  if (input.subtitle_vi?.trim()) payload.subtitle_vi = input.subtitle_vi.trim();
  if (input.description_vi?.trim()) payload.description_vi = input.description_vi.trim();
  if (input.roast_profile_vi?.trim()) payload.roast_profile_vi = input.roast_profile_vi.trim();
  if (input.tasting_notes_vi?.trim()) payload.tasting_notes_vi = input.tasting_notes_vi.trim();
  if (input.blend_summary_vi?.trim()) payload.blend_summary_vi = input.blend_summary_vi.trim();
  if (Array.isArray(input.gallery_captions_vi) && input.gallery_captions_vi.length > 0) {
    payload.gallery_captions_vi = input.gallery_captions_vi.map((s) => String(s || '').trim());
  }
  if (Array.isArray(input.variant_labels_vi) && input.variant_labels_vi.length > 0) {
    payload.variant_labels_vi = input.variant_labels_vi.map((s) => String(s || '').trim());
  }

  if (Object.keys(payload).length === 0) {
    return {};
  }

  const ai = getGeminiClient();
  const maxAttempts = 3;
  let lastErr: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents:
          'Translate the following Vietnamese ROAR COFFEE specialty coffee product fields into natural, accurate, premium English. ' +
          'Preserve brand names (ROAR COFFEE, Signature Reserve), SKUs, technical coffee grading terms (S14, S16, S18, Natural, Honey, CBU Washed, Arabica, Robusta, Phin, Espresso, Crema, COA, MOQ, HORECA), and exact array lengths/order for gallery_captions_vi and variant_labels_vi.\n\n' +
          JSON.stringify(payload, null, 2),
        config: {
          systemInstruction:
            'You are the senior bilingual specialty coffee copywriter for ROAR COFFEE Vietnam. ' +
            'Return ONLY valid JSON matching the schema. Only translate fields present in the input JSON. Keep empty arrays empty.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name_en: { type: Type.STRING, description: 'English translation of name_vi' },
              subtitle_en: { type: Type.STRING, description: 'English translation of subtitle_vi' },
              description_en: { type: Type.STRING, description: 'English translation of description_vi' },
              roast_profile_en: { type: Type.STRING, description: 'English translation of roast_profile_vi' },
              tasting_notes_en: { type: Type.STRING, description: 'English translation of tasting_notes_vi' },
              blend_summary_en: { type: Type.STRING, description: 'English translation of blend_summary_vi' },
              gallery_captions_en: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'English translations matching gallery_captions_vi in the same order',
              },
              variant_labels_en: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'English translations matching variant_labels_vi in the same order',
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as ProductTranslationResponse;
      return parsed;
    } catch (err: any) {
      lastErr = err;
      const status = typeof err?.status === 'number' ? err.status : 502;
      const isTransient = status === 503 || status === 429 || status === 500 || status === 502;
      if (isTransient && attempt < maxAttempts) {
        const delayMs = attempt === 1 ? 600 : 1600;
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      break;
    }
  }

  if (lastErr instanceof GeminiTranslationError) throw lastErr;
  const status = typeof lastErr?.status === 'number' ? lastErr.status : 502;
  let friendlyMsg = 'Không thể kết nối dịch vụ dịch tự động Gemini lúc này. Bạn có thể nhập/sửa Tiếng Anh thủ công.';
  if (status === 400 || status === 403) {
    friendlyMsg = 'API Key Gemini chưa hợp lệ hoặc chưa được cấp quyền (kiểm tra Settings > Secrets).';
  } else if (status === 503 || status === 429) {
    friendlyMsg = 'Hệ thống dịch AI đang tạm thời quá tải, vui lòng thử lại sau vài giây hoặc nhập Tiếng Anh thủ công.';
  }
  throw new GeminiTranslationError(friendlyMsg, status, 'UPSTREAM_ERROR');
}
