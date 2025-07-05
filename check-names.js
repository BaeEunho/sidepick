// result-data.js에서 성향 이름들 추출
const fs = require('fs');

// result-data.js 파일 읽기
const resultDataContent = fs.readFileSync('./result-data.js', 'utf8');

// 정규식으로 성향 코드와 이름 추출
const codePattern = /(\w{4}):\s*{[^}]*?name:\s*"([^"]+)"/g;
let match;

console.log('=== result-data.js의 성향 이름들 ===');
while ((match = codePattern.exec(resultDataContent)) !== null) {
    console.log(`${match[1]}: ${match[2]}`);
}