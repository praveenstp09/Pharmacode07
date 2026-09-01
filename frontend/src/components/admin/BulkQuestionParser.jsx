import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

/**
 * Pure parsing function to extract MCQs from raw pasted text (English & Bilingual Hindi).
 */
export const parseBulkMcqText = (text, defaultSubject = 'General Pharmacy') => {
  if (!text || !text.trim()) return [];

  // 1. Normalize line endings & strip zero-width characters
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();

  // 2. Split into distinct question blocks (supports Question 1, Q1., Q.1, 1., etc.)
  const blockRegex = /(?:^|\n)(?=(?:Question\s*\d+\b|Q\.?\s*\d+\b|\b\d{1,3}[\.\)]\s+))/i;
  let rawBlocks = normalizedText.split(blockRegex).filter(b => b && b.trim().length > 0);

  if (rawBlocks.length <= 1 && normalizedText.includes('---')) {
    rawBlocks = normalizedText.split(/_{3,}|-{3,}/).filter(b => b && b.trim().length > 0);
  }

  const parsedList = [];

  rawBlocks.forEach(rawBlock => {
    const cleanBlock = rawBlock.trim();
    if (!cleanBlock) return;

    // Split into English and Hindi sections if Hindi marker is present
    const hindiMarkerRegex = /(?:^|\n)\s*(?:Hindi\s*Question|Hindi\s*Explanation|Hindi\s*:|हिन्दी\s*प्रश्न|हिन्दी\s*व्याख्या|हिन्दी\s*:|हिंदी\s*प्रश्न|हिंदी\s*:)/i;
    const hindiMarkerMatch = cleanBlock.search(hindiMarkerRegex);

    let englishSection = cleanBlock;
    let hindiSection = '';

    if (hindiMarkerMatch !== -1) {
      englishSection = cleanBlock.substring(0, hindiMarkerMatch).trim();
      hindiSection = cleanBlock.substring(hindiMarkerMatch).trim();
    }

    // Helper function to parse 4 options from a text section
    const extractOptions = (section) => {
      const optAPos = section.search(/(?:^|\n)\s*(?:\([Aa1\u0905\u0915]\)|[Aa1\u0905\u0915][\.\)]|\[[Aa1\u0905\u0915]\])\s+/);
      const optBPos = section.search(/(?:^|\n)\s*(?:\([Bb2\u0906\u0916]\)|[Bb2\u0906\u0916][\.\)]|\[[Bb2\u0906\u0916]\])\s+/);
      const optCPos = section.search(/(?:^|\n)\s*(?:\([Cc3\u0907\u0917]\)|[Cc3\u0907\u0917][\.\)]|\[[Cc3\u0907\u0917]\])\s+/);
      const optDPos = section.search(/(?:^|\n)\s*(?:\([Dd4\u0908\u0918]\)|[Dd4\u0908\u0918][\.\)]|\[[Dd4\u0908\u0918]\])\s+/);

      if (optAPos === -1 || optBPos === -1 || optCPos === -1 || optDPos === -1) {
        return null;
      }

      const dSection = section.substring(optDPos);
      const dEndMatch = dSection.search(/(?:^|\n)\s*(?:(?:Correct\s*(?:Option|Answer)|Right\s*Answer|Answer|Ans|Key|उत्तर|सही\s*उत्तर)[\s\:\-\.]|(?:English\s*Explanation|Hindi\s*Explanation|Explanation|Detailed\s*Solution|Solution|Sol|Rationale|व्याख्या)[\s\:\-\.])/i);

      const optAEnd = optBPos;
      const optBEnd = optCPos;
      const optCEnd = optDPos;
      const optDEnd = dEndMatch !== -1 ? optDPos + dEndMatch : section.length;

      const cleanOpt = (str) => {
        return str
          .replace(/^\s*(?:\([AaBbCcDd1234\u0905\u0906\u0907\u0908\u0915\u0916\u0917\u0918]\)|[AaBbCcDd1234\u0905\u0906\u0907\u0908\u0915\u0916\u0917\u0918][\.\)]|\[[AaBbCcDd1234\u0905\u0906\u0907\u0908\u0915\u0916\u0917\u0918]\])\s*/i, '')
          .replace(/\s+/g, ' ')
          .trim();
      };

      return [
        cleanOpt(section.substring(optAPos, optAEnd)),
        cleanOpt(section.substring(optBPos, optBEnd)),
        cleanOpt(section.substring(optCPos, optCEnd)),
        cleanOpt(section.substring(optDPos, optDEnd)),
      ];
    };

    // ── 1. Parse English Question ──
    const engOptAPos = englishSection.search(/(?:^|\n)\s*(?:\([Aa1]\)|[Aa1][\.\)]|\[[Aa1]\])\s+/);
    let engQuestionText = '';
    if (engOptAPos !== -1) {
      engQuestionText = englishSection.substring(0, engOptAPos);
    } else {
      engQuestionText = englishSection;
    }

    engQuestionText = engQuestionText
      .replace(/^(?:Question\s*\d+\b|Q\.?\s*\d+\b|\d+[\.\)])[\.\:\s\-]*/i, '')
      .replace(/^(?:English\s*Question|Question|Q)\s*[\:\-]?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    const engOptions = extractOptions(englishSection) || ['', '', '', ''];

    // ── 2. Parse English Explanation ──
    let engExplanation = '';
    const engExpMatch = englishSection.match(/(?:^|\n)\s*(?:English\s*Explanation|Explanation|Detailed\s*Solution|Solution|Sol|Rationale)\s*[\:\-]?\s*\n*([\s\S]+?)(?=(?:_{3,}|-{3,}|$))/i);
    if (engExpMatch) {
      engExplanation = engExpMatch[1].replace(/_{3,}|-{3,}/g, '').replace(/\s+/g, ' ').trim();
    }

    // ── 3. Parse Correct Option Index ──
    const ansMatch = cleanBlock.match(/(?:✅|✔|\*)?\s*(?:\b(?:Correct\s*(?:Option|Answer)|Right\s*Answer|Answer|Ans|Key)\b|उत्तर|सही\s*उत्तर)[\s\:\-\.]*\s*(?:\()?\s*([A-Da-d1-4]|[\u0905\u0906\u0907\u0908\u0915\u0916\u0917\u0918])(?=[\.\)\:\s]|$)/i);

    let correctIdx = 0;
    if (ansMatch) {
      const rawLetter = ansMatch[1].toUpperCase();
      if (rawLetter === 'A' || rawLetter === '1' || rawLetter === 'अ' || rawLetter === 'क') {
        correctIdx = 0;
      } else if (rawLetter === 'B' || rawLetter === '2' || rawLetter === 'ब' || rawLetter === 'ख') {
        correctIdx = 1;
      } else if (rawLetter === 'C' || rawLetter === '3' || rawLetter === 'स' || rawLetter === 'ग') {
        correctIdx = 2;
      } else if (rawLetter === 'D' || rawLetter === '4' || rawLetter === 'द' || rawLetter === 'घ') {
        correctIdx = 3;
      }
    }

    // ── 4. Parse Hindi Section (if available) ──
    let questionTextHindi = '';
    let optionsHindi = [];
    let explanationHindi = '';

    if (hindiSection) {
      const hindiOptAPos = hindiSection.search(/(?:^|\n)\s*(?:\([Aa1\u0905\u0915]\)|[Aa1\u0905\u0915][\.\)]|\[[Aa1\u0905\u0915]\])\s+/);
      let rawHindiQ = '';
      if (hindiOptAPos !== -1) {
        rawHindiQ = hindiSection.substring(0, hindiOptAPos);
      } else {
        rawHindiQ = hindiSection;
      }

      questionTextHindi = rawHindiQ
        .replace(/^(?:Hindi\s*Question|हिन्दी\s*प्रश्न|हिंदी\s*प्रश्न|Hindi\s*:|हिन्दी\s*:|हिंदी\s*:|Question|प्रश्न)\s*[\:\-]?\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      const extractedHindiOpts = extractOptions(hindiSection);
      if (extractedHindiOpts && extractedHindiOpts[0]) {
        optionsHindi = extractedHindiOpts;
      }

      const hindiExpMatch = hindiSection.match(/(?:^|\n)\s*(?:Hindi\s*Explanation|हिन्दी\s*व्याख्या|हिंदी\s*व्याख्या|Explanation|व्याख्या|समाधान)\s*[\:\-]?\s*\n*([\s\S]+?)(?=(?:_{3,}|-{3,}|$))/i);
      if (hindiExpMatch) {
        explanationHindi = hindiExpMatch[1].replace(/_{3,}|-{3,}/g, '').replace(/\s+/g, ' ').trim();
      }
    }

    if (engQuestionText && engOptions[0] && engOptions[1]) {
      parsedList.push({
        questionText: engQuestionText,
        options: engOptions,
        questionTextHindi,
        optionsHindi,
        correctOptionIndex: correctIdx,
        explanation: engExplanation,
        explanationHindi,
        subject: defaultSubject || 'General Pharmacy',
      });
    }
  });

  return parsedList;
};

/**
 * Reusable Bulk MCQ Parser UI component.
 */
const BulkQuestionParser = ({
  onQuestionsParsed,
  queueCount = 0,
  onClearQueue,
  defaultSubject = 'General Pharmacy',
  title = '⚡ Bulk MCQ Text Parser (CBT Simulator Mode)',
  colorScheme = 'blue', // 'blue' | 'indigo'
}) => {
  const [text, setText] = useState('');
  const { showToast } = useToast();

  const handleParse = () => {
    if (!text.trim()) {
      showToast('Please paste some MCQ text first!', 'warning');
      return;
    }

    const parsed = parseBulkMcqText(text, defaultSubject);
    if (parsed.length === 0) {
      showToast('Could not detect MCQ format. Please make sure text has Question, Options (a), (b), (c), (d), and Correct Option.', 'warning');
      return;
    }

    onQuestionsParsed(parsed);
    setText('');
    showToast(`Successfully parsed ${parsed.length} questions into queue!`, 'success');
  };

  const isIndigo = colorScheme === 'indigo';

  return (
    <div className={`p-4 ${isIndigo ? 'bg-indigo-50 border-indigo-200' : 'bg-blue-50 border-blue-200'} border rounded-2xl space-y-3`}>
      <div className="flex items-center justify-between">
        <span className={`font-bold text-xs ${isIndigo ? 'text-indigo-900' : 'text-blue-900'}`}>
          {title}
        </span>
        <span className="text-xs font-bold text-emerald-700">Queue: {queueCount} MCQs</span>
      </div>
      <textarea
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste Q1. A. B. C. D. Correct Answer: ... text copied from PDF..."
        className="w-full p-2.5 bg-white border rounded-xl text-xs font-mono"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleParse}
          className={`px-4 py-2 ${isIndigo ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-xs rounded-xl shadow cursor-pointer transition`}
        >
          ⚡ Parse Questions
        </button>
        {onClearQueue && (
          <button
            type="button"
            onClick={onClearQueue}
            className="px-3 py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl cursor-pointer hover:bg-rose-100 transition"
          >
            Clear Queue
          </button>
        )}
      </div>
    </div>
  );
};

export default BulkQuestionParser;
