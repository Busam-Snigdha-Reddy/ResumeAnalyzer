import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export const parsePdf = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text || '';
  } catch (error) {
    throw new Error(`PDF Parsing failed: ${error.message}`);
  }
};

export const parseDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    throw new Error(`DOCX Parsing failed: ${error.message}`);
  }
};
