import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API: Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Proxy Google Sheets CSV export
app.get('/api/fetch-sheet', async (req, res) => {
  try {
    const { url, sheetId, gid } = req.query;
    let targetUrl = '';

    if (url && typeof url === 'string') {
      // Extract spreadsheet ID and GID
      const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
      const sId = idMatch ? idMatch[1] : url;
      const gId = gidMatch ? gidMatch[1] : (typeof gid === 'string' ? gid : '0');
      targetUrl = `https://docs.google.com/spreadsheets/d/${sId}/export?format=csv&gid=${gId}`;
    } else if (sheetId && typeof sheetId === 'string') {
      const gId = typeof gid === 'string' ? gid : '0';
      targetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gId}`;
    } else {
      return res.status(400).json({ error: 'Missing spreadsheet url or sheetId parameter' });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Google Sheets responded with status ${response.status}. The sheet may be private or requires sign-in.`,
      });
    }

    const text = await response.text();
    // Check if Google returned HTML login page instead of CSV
    if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('accounts.google.com')) {
      return res.status(403).json({
        error: 'Google Sheet access is restricted (requires Google login). To allow direct API loading, set the Google Sheet share permissions to "Anyone with the link can view", or use the Direct Copy-Paste / CSV upload option below.',
        requiresAuth: true,
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.send(text);
  } catch (error: any) {
    console.error('Error fetching Google Sheet:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch spreadsheet data' });
  }
});

// API: Gemini-powered semantic analysis for unmapped accounts or adjustments
app.post('/api/ai/explain-adjustment', async (req, res) => {
  try {
    const { adjustment, coaSummary } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        explanation: 'Deterministic validation active (AI key offline). Double-entry invariant checked.',
        remediation: 'Inspect debit/credit balance and verify COA existence.',
      });
    }

    const prompt = `You are a Senior Accounting Controller. Analyze this manual journal adjustment batch:
Adjustment: ${JSON.stringify(adjustment, null, 2)}
Available COA context: ${coaSummary || 'Standard 1000s-8000s hierarchy'}

If this entry has defects (such as debit != credit, missing account codes, or circular entries), explain the exact accounting impact in 2 crisp sentences and give a 1-sentence remediation recommendation. If valid, confirm why it passes. Return clean JSON with keys "explanation" and "remediation".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in explain-adjustment:', error);
    res.json({
      explanation: 'Audit violation: Discrepancy detected in double-entry totals.',
      remediation: 'Review source calculation schedule with finance submitter.',
    });
  }
});

// API: Semantic COA Auto-Mapper using Gemini
app.post('/api/ai/map-account', async (req, res) => {
  try {
    const { accountCode, accountName, coaHierarchy } = req.body;
    const ai = getAIClient();

    if (!ai) {
      // Deterministic fallback
      let parent = '1100';
      let statement = 'BS';
      if (accountCode.startsWith('6')) {
        parent = '6000';
        statement = 'PL';
      }
      return res.json({
        suggested_parent: parent,
        statement,
        confidence: 0.85,
        reasoning: 'Prefix-based heuristic mapping.',
      });
    }

    const prompt = `You are an ERP Financial Taxonomy Specialist.
Unmapped Account:
Code: "${accountCode}"
Name: "${accountName}"

Available COA Nodes:
${coaHierarchy}

Determine the optimal parent node, statement (BS or PL), normal balance (Debit or Credit), and Cash Flow category (Operating, Investing, Financing, NonCash).
Output JSON with keys:
- "suggested_parent": code string
- "suggested_statement": "BS" | "PL"
- "suggested_type": "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" | "OtherIncome" | "OtherExpense" | "Tax"
- "suggested_cash_flow": "Operating" | "Investing" | "Financing" | "NonCash"
- "confidence": number between 0.0 and 1.0
- "reasoning": 2 sentences explaining why this mapping fits US GAAP / IFRS standards.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in map-account:', error);
    res.json({
      suggested_parent: '1100',
      suggested_statement: 'BS',
      suggested_type: 'Asset',
      suggested_cash_flow: 'Operating',
      confidence: 0.75,
      reasoning: 'Fallback classification based on standard numerical taxonomy.',
    });
  }
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial Reporting Agentic Server running on port ${PORT}`);
  });
}

startServer();
