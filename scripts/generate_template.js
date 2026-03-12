const ExcelJS = require('exceljs');
const path = require('path');

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Questions');

  sheet.columns = [
    { header: 'question_text', key: 'question_text', width: 40 },
    { header: 'question_type', key: 'question_type', width: 20 },
    { header: 'option_a', key: 'option_a', width: 20 },
    { header: 'option_b', key: 'option_b', width: 20 },
    { header: 'option_c', key: 'option_c', width: 20 },
    { header: 'option_d', key: 'option_d', width: 20 },
    { header: 'option_e', key: 'option_e', width: 20 },
    { header: 'correct_answer', key: 'correct_answer', width: 15 },
    { header: 'difficulty', key: 'difficulty', width: 15 },
    { header: 'marks', key: 'marks', width: 10 },
    { header: 'explanation', key: 'explanation', width: 40 }
  ];

  // Formatting header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add sample data
  sheet.addRow({
    question_text: "What is the capital of France?",
    question_type: "Single Choice",
    option_a: "Paris",
    option_b: "London",
    option_c: "Berlin",
    option_d: "Madrid",
    option_e: "",
    correct_answer: "A",
    difficulty: "Easy",
    marks: 1,
    explanation: "Paris is the capital and largest city of France."
  });

  sheet.addRow({
    question_text: "Which of these are prime numbers?",
    question_type: "Multiple Choice",
    option_a: "2",
    option_b: "4",
    option_c: "5",
    option_d: "9",
    option_e: "",
    correct_answer: "A,C",
    difficulty: "Medium",
    marks: 2,
    explanation: "2 and 5 are prime numbers, while 4 and 9 are composite."
  });

  // Apply dropdowns to 100 rows
  for (let i = 2; i <= 101; i++) {
    // Question Type Dropdown
    sheet.getCell(`B${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Single Choice,Multiple Choice"']
    };

    // Difficulty Dropdown
    sheet.getCell(`I${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Easy,Medium,Hard"']
    };
  }

  const filePath = path.join(process.cwd(), 'public', 'questions_template.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('Excel template generated at ' + filePath);
}

generateTemplate().catch(err => {
  console.error(err);
  process.exit(1);
});
