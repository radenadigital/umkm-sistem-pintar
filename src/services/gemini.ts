import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum diatur. Silakan atur API Key di file .env.local.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export const geminiService = {
  async generateMarketingContent(type: string, input: string, options?: { tone?: string; platform?: string }) {
    try {
      const typeStr = String(type || '');
      const tone = options?.tone || 'Persuasif';
      const platform = options?.platform || '';

      let prompt = `Tipe Konten: ${typeStr}\nPlatform/Format: ${platform}\nNada/Tone: ${tone}\nDetail Promosi: ${input}\n\n`;

      if (typeStr.toLowerCase().includes('custom')) {
        prompt = platform; // Use the custom instruction directly
      } else if (typeStr.toLowerCase().includes('caption') || typeStr.toLowerCase().includes('sosmed')) {
        prompt += `Buatlah caption menarik untuk ${platform || 'Instagram/TikTok/Facebook'} berdasarkan konteks di atas. Berikan 3 variasi pilihan yang berbeda. Untuk setiap variasi, sertakan:\n1. Hook pembuka yang menarik perhatian\n2. Isi konten/body copy yang persuasif\n3. Call to Action (CTA) yang jelas\n4. Rekomendasi hashtag (#) yang relevan.\nFormatlah output dalam Markdown yang rapi.`;
      } else if (typeStr.toLowerCase().includes('copywriting') || typeStr.toLowerCase().includes('copy')) {
        prompt += `Buatlah copywriting persuasif dan menjual untuk ${platform || 'Landing Page/Sales Funnel'} berdasarkan konteks di atas. Gunakan formula AIDA (Attention, Interest, Desire, Action) atau PAS (Problem, Agitation, Solution) yang sangat menggugah minat beli. Berikan Headline yang eye-catching, Body Copy yang emosional & logis, serta CTA yang sangat kuat. Formatlah output dalam Markdown yang rapi.`;
      } else if (typeStr.toLowerCase().includes('email')) {
        prompt += `Buatlah draf email marketing pemasaran professional jenis ${platform || 'Newsletter/Promo'} berdasarkan konteks di atas. Berikan:\n1. 3 pilihan Subject Line yang menarik (high clickthrough rate)\n2. Teks Body Email yang hangat, personal, dan persuasif\n3. CTA (Call To Action) yang jelas.\nFormatlah output dalam Markdown yang rapi.`;
      } else if (typeStr.toLowerCase().includes('video') || typeStr.toLowerCase().includes('skrip') || typeStr.toLowerCase().includes('script')) {
        prompt += `Buatlah naskah/skrip video pendek kreatif berdurasi 30-60 detik untuk media ${platform || 'TikTok / Instagram Reels'} berdasarkan konteks di atas. Berikan struktur naskah yang lengkap berisi:\n1. Hook Pembuka (detik 0-3) yang sangat memicu rasa penasaran\n2. Urutan Adegan (Visual Direction) & Pembicaraan/Suara (Audio Voiceover)\n3. Call to Action (CTA) akhir penutup.\nSertakan rekomendasi audio latar/sound effect (SFX) yang cocok. Formatlah output dalam Markdown yang rapi.`;
      } else if (typeStr.toLowerCase().includes('promo') || typeStr.toLowerCase().includes('banner')) {
        prompt += `Buatlah gagasan ide konsep visual banner promosi dan copywriting teks banner iklan untuk kampanye ${platform || 'Promo Diskon'} berdasarkan konteks di atas. Rancang detail kreatif mencakup:\n1. Headline Banner yang tebal, singkat, dan eye-catching\n2. Penawaran Utama / Promosi Spesial\n3. Panduan Arahan Visual (color scheme, elemen grafis, vibe latar belakang)\n4. Copywriting Teks Promosi penunjang. Formatlah output dalam Markdown yang rapi.`;
      } else if (typeStr.toLowerCase().includes('mockup') || typeStr.toLowerCase().includes('visualisasi')) {
        prompt += `Buatlah beberapa ide visualisasi produk kreatif dan konsep mockup yang menawan menggunakan media ${platform || 'Visualisasi Produk'} berdasarkan konteks di atas. Berikan panduan artistik yang meliputi:\n1. Deskripsi Tema & Latar Belakang (vibe, mood, lighting studio)\n2. Penonjolan Produk & Fokus Kemasan (bagian mana yang wajib disorot)\n3. Rekomendasi Properti Pendukung (props foto) untuk melengkapi frame\n4. Saran Angle Kamera Terbaik untuk hasil premium. Formatlah output dalam Markdown yang rapi.`;
      } else if (typeStr.toLowerCase().includes('swot')) {
        prompt += `Buatlah analisis SWOT (Strengths, Weaknesses, Opportunities, Threats) yang komprehensif, mendalam dan strategis untuk bisnis berdasarkan informasi di atas dengan format ${platform || 'SWOT Lengkap'}.\n\nRincikan secara profesional:\n1. Strengths (Kekuatan internal & keunggulan kompetitif)\n2. Weaknesses (Kelemahan internal & hambatan operasional)\n3. Opportunities (Peluang eksternal di pasar & tren konsumen)\n4. Threats (Ancaman eksternal, kompetitor, & tantangan industri)\n\nGunakan gaya ${tone} dan berikan rekomendasi aksi taktis (Actionable Recommendations) untuk menggabungkan kekuatan demi memanfaatkan peluang (SO Strategy), serta mengatasi kelemahan guna menghindari ancaman (WT Strategy). Formatlah output dalam Markdown yang sangat rapi dan mudah diaplikasikan pemilik UMKM Indonesia.`;
      } else if (typeStr.toLowerCase().includes('harga') || typeStr.toLowerCase().includes('price') || typeStr.toLowerCase().includes('pricing')) {
        prompt += `Buatlah saran panduan penetapan strategi harga produk/layanan (Pricing Strategy) menggunakan pendekatan ${platform || 'Value-Based Pricing'} berdasarkan informasi bisnis di atas.\n\nRincikan strategi harga yang mencakup:\n1. Analisis Nilai Jual Produk (Value Proposition Analysis) di mata pelanggan\n2. Rekomendasi Struktur Penetapan Harga (Basic/Premium/Bundling) yang optimal\n3. Tips Psikologi Harga (Charity Pricing, Decoy Effect, Odd Pricing) untuk memicu pembelian\n4. Strategi menghadapi perang harga kompetitor tanpa mengorbankan margin.\n\nGunakan nada suara ${tone}. Formatlah output dalam Markdown yang sangat rapi dan mudah diaplikasikan langsung oleh pemilik UMKM Indonesia.`;
      } else if (typeStr.toLowerCase().includes('ide') || typeStr.toLowerCase().includes('growth') || typeStr.toLowerCase().includes('pertumbuhan')) {
        prompt += `Rancang draf strategi pertumbuhan bisnis kreatif dan inovatif bertemakan pengembangan ${platform || 'Inovasi Bisnis'} berdasarkan konteks di atas.\n\nSediakan 5 Ide Inovatif dan unik untuk mengembangkan bisnis ini secara konkret. Untuk setiap ide rincikan:\n1. Nama Konsep Ide yang menarik\n2. Deskripsi singkat ide & cara penerapannya (Implementation steps)\n3. Perkiraan dampak pertumbuhan kuantitatif/kualitatif (Potential Impact)\n4. Biaya/Effort pelaksanaan (Rendah/Sedang/Tinggi).\n\nGunakan gaya penyampaian ${tone}. Formatlah output dalam Markdown yang sangat rapi, berikan poin-poin yang bersemangat dan mudah dipahami oleh pemilik UMKM Indonesia.`;
      } else if (typeStr.toLowerCase().includes('tren') || typeStr.toLowerCase().includes('trend') || typeStr.toLowerCase().includes('market')) {
        prompt += `Sediakan analisis mendalam wawasan perkembangan Tren Pasar terkini dan pemetaan kompetitor cerdas berfokus pada kategori ${platform || 'Tren Konsumen'} untuk industri bisnis berdasarkan detail konteks di atas.\n\nRancang laporan analisis yang meliputi:\n1. Tren Konsumen Terkini (pergeseran perilaku belanja, preferensi, media sosial)\n2. Analisis Kekuatan/Kelemahan Kompetitor Umum di segmen sejenis\n3. Peluang Celah Pasar Kosong (Niche Gap) yang bisa dieksploitasi segera\n4. Rekomendasi strategi adaptasi produk/pemasaran yang relevan dengan tren saat ini.\n\nGunakan nada ${tone}. Formatlah laporan ini dalam Markdown yang sangat rapi, informatif, dan mendalam agar membantu pemilik UMKM memimpin persaingan.`;
      } else {
        prompt += `Buatlah draf artikel pendek yang SEO-friendly dan ramah mesin pencari untuk media ${platform || 'Artikel Blog/Website'} berdasarkan konteks di atas. Sertakan:\n1. Judul (H1) yang menarik dan mengandung kata kunci utama\n2. Meta Description yang persuasif (maksimal 155 karakter)\n3. Ringkasan konten / outline atau draf artikel pendek yang kaya kata kunci (main keywords).\nFormatlah output dalam Markdown yang rapi.`;
      }

      const systemInstructions = `You are an expert digital marketing assistant and copywriting specialist for Indonesian UMKM (small businesses). 
      Generate extremely high-quality, engaging, professional, and highly persuasive marketing content in Indonesian based on the user's input.
      Use an appropriate tone (${tone}) suitable for Indonesian social media, email, and digital business contexts.
      Keep the language natural, modern, matching current Indonesian digital trends, and use emojis tastefully to boost engagement. Focus heavily on conversion.`;

      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstructions,
          temperature: 0.7,
        },
      });

      return response.text;
    } catch (error: any) {
      console.error("Error generating marketing content:", error);
      
      if (error?.error?.code === 503 || error?.message?.includes("UNAVAILABLE") || error?.message?.includes("high demand")) {
        throw new Error("Model AI sedang mengalami permintaan tinggi dan tidak dapat diakses saat ini. Silakan coba beberapa saat lagi atau periksa koneksi internet Anda.");
      }
      
      throw error;
    }
  },

  async generateBusinessStrategy(type: 'swot' | 'pricing' | 'idea' | 'market', businessInfo: string) {
    try {
      const prompts = {
        swot: "Perform a detailed SWOT analysis (Strengths, Weaknesses, Opportunities, Threats).",
        pricing: "Suggest a pricing strategy based on market positioning and value proposition.",
        idea: "Generate 5 innovative business growth or product ideas.",
        market: "Analyze market trends and competitor insights for this niche."
      };

      const systemInstructions = `You are a professional business consultant for UMKM. 
      Provide a detailed ${type} report based on the business information provided.
      Format the output with clear headings and bullet points.`;

      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${prompts[type]}\n\nBusiness Info: ${businessInfo}`,
        config: {
          systemInstruction: systemInstructions,
          temperature: 0.5,
        },
      });

      return response.text;
    } catch (error) {
      console.error("Error generating business strategy:", error);
      throw error;
    }
  },

  async generateBrandVoice(businessDescription: string) {
    try {
      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a professional Brand Voice guide for this business: ${businessDescription}. Include Tone of Voice, Key Phrases, and Communication Style.`,
        config: {
          systemInstruction: "You are a branding expert. Help a small business define their unique brand voice.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tone: { type: Type.STRING },
              style: { type: Type.STRING },
              keyPhrases: { type: Type.ARRAY, items: { type: Type.STRING } },
              examples: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["tone", "style", "keyPhrases", "examples"]
          }
        },
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error generating brand voice:", error);
      throw error;
    }
  },

  async generateCustomerPersona(businessInfo: string) {
    try {
      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a detailed customer persona for: ${businessInfo}`,
        config: {
          systemInstruction: "You are a marketing psychologist. Create a vivid, actionable customer persona.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              demographic: { type: Type.STRING },
              painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              motivations: { type: Type.ARRAY, items: { type: Type.STRING } },
              behavior: { type: Type.STRING },
              strategy: { type: Type.STRING }
            },
            required: ["name", "demographic", "painPoints", "motivations", "behavior", "strategy"]
          }
        },
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error generating customer persona:", error);
      throw error;
    }
  },

  async generateLandingPageLayout(businessInfo: string) {
    try {
      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create a high-converting landing page structure for: ${businessInfo}`,
        config: {
          systemInstruction: "You are a conversion rate optimization (CRO) expert. Outline a landing page structure with headline, subheadline, features, social proof, and CTA.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              subheadline: { type: Type.STRING },
              sections: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                  }
                } 
              },
              cta: { type: Type.STRING }
            },
            required: ["headline", "subheadline", "sections", "cta"]
          }
        },
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Error generating landing page layout:", error);
      throw error;
    }
  }
};
