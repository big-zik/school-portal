const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require('docx');

const mdPath = path.join(__dirname, '..', 'docs', '25_portal_aim_and_complete_functional_catalog.md');
const outPath = path.join(__dirname, '..', 'docs', '25_portal_aim_and_complete_functional_catalog.docx');

const content = fs.readFileSync(mdPath, 'utf8');
const lines = content.split('\n');

const docChildren = [];

const subtleBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: 'E2E8F0',
};

const cellBorders = {
  top: subtleBorder,
  bottom: subtleBorder,
  left: subtleBorder,
  right: subtleBorder,
};

let inCodeBlock = false;
let codeLines = [];
let inTable = false;
let tableRows = [];

function flushCodeBlock() {
  if (codeLines.length > 0) {
    const text = codeLines.join('\n');
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            font: 'Courier New',
            size: 18,
            color: '1E293B',
          }),
        ],
        shading: {
          type: ShadingType.CLEAR,
          fill: 'F1F5F9',
        },
        spacing: { before: 120, after: 120 },
      })
    );
    codeLines = [];
  }
}

function flushTable() {
  if (tableRows.length > 0) {
    const docTableRows = tableRows.map((row, rIdx) => {
      const isHeader = rIdx === 0;
      return new TableRow({
        children: row.map((cellText) => {
          return new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: cellText.trim(),
                    bold: isHeader,
                    size: isHeader ? 20 : 19,
                    color: isHeader ? 'FFFFFF' : '0F172A',
                  }),
                ],
                spacing: { before: 80, after: 80 },
              }),
            ],
            borders: cellBorders,
            shading: isHeader
              ? { type: ShadingType.CLEAR, fill: '1E3A8A' }
              : rIdx % 2 === 1
              ? { type: ShadingType.CLEAR, fill: 'F8FAFC' }
              : undefined,
          });
        }),
      });
    });

    docChildren.push(
      new Table({
        rows: docTableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
    docChildren.push(new Paragraph({ spacing: { after: 120 } }));
    tableRows = [];
  }
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.trim().startsWith('```')) {
    if (inCodeBlock) {
      flushCodeBlock();
      inCodeBlock = false;
    } else {
      inCodeBlock = true;
    }
    continue;
  }

  if (inCodeBlock) {
    codeLines.push(line);
    continue;
  }

  if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
    const rawCells = line
      .trim()
      .slice(1, -1)
      .split('|');

    if (rawCells.every((c) => /^\s*[:-]+[-]+\s*$/.test(c))) {
      continue;
    }

    inTable = true;
    tableRows.push(rawCells);
    continue;
  } else if (inTable) {
    flushTable();
    inTable = false;
  }

  const trimmed = line.trim();

  if (!trimmed) {
    continue;
  }

  // Headings
  if (trimmed.startsWith('# ')) {
    docChildren.push(
      new Paragraph({
        text: trimmed.replace(/^#\s+/, ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      })
    );
  } else if (trimmed.startsWith('## ')) {
    docChildren.push(
      new Paragraph({
        text: trimmed.replace(/^##\s+/, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );
  } else if (trimmed.startsWith('### ')) {
    docChildren.push(
      new Paragraph({
        text: trimmed.replace(/^###\s+/, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 80 },
      })
    );
  } else if (trimmed.startsWith('#### ')) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: trimmed.replace(/^####\s+/, ''),
            bold: true,
            size: 22,
            color: '1E3A8A',
          }),
        ],
        spacing: { before: 120, after: 60 },
      })
    );
  } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    const bulletText = trimmed.replace(/^[-*]\s+/, '');
    const parts = bulletText.split(/(\*\*[^*]+\*\*)/g);
    const textRuns = parts.map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({
          text: part.slice(2, -2),
          bold: true,
          size: 21,
        });
      }
      return new TextRun({
        text: part,
        size: 21,
      });
    });

    docChildren.push(
      new Paragraph({
        children: textRuns,
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
      })
    );
  } else if (/^\d+\.\s+/.test(trimmed)) {
    const numText = trimmed.replace(/^\d+\.\s+/, '');
    const parts = numText.split(/(\*\*[^*]+\*\*)/g);
    const textRuns = parts.map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({
          text: part.slice(2, -2),
          bold: true,
          size: 21,
        });
      }
      return new TextRun({
        text: part,
        size: 21,
      });
    });

    docChildren.push(
      new Paragraph({
        children: textRuns,
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
      })
    );
  } else if (trimmed.startsWith('> ')) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: trimmed.replace(/^>\s+/, ''),
            italics: true,
            size: 21,
            color: '334155',
          }),
        ],
        spacing: { before: 60, after: 60 },
        indent: { left: 400 },
      })
    );
  } else if (trimmed === '---') {
    docChildren.push(
      new Paragraph({
        text: '',
        spacing: { before: 120, after: 120 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 2,
            color: 'CBD5E1',
          },
        },
      })
    );
  } else {
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    const textRuns = parts.map((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return new TextRun({
          text: part.slice(2, -2),
          bold: true,
          size: 21,
        });
      }
      return new TextRun({
        text: part,
        size: 21,
      });
    });

    docChildren.push(
      new Paragraph({
        children: textRuns,
        spacing: { before: 60, after: 60 },
      })
    );
  }
}

if (inTable) flushTable();
if (inCodeBlock) flushCodeBlock();

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 21,
          color: '0F172A',
        },
      },
      heading1: {
        run: {
          font: 'Calibri',
          size: 36,
          bold: true,
          color: '1E3A8A',
        },
      },
      heading2: {
        run: {
          font: 'Calibri',
          size: 28,
          bold: true,
          color: '1E293B',
        },
      },
      heading3: {
        run: {
          font: 'Calibri',
          size: 24,
          bold: true,
          color: '334155',
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440,
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children: docChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('Successfully generated Word document at:', outPath);
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
});
