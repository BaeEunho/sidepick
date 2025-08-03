// results.js에서 성향 이름들 추출
const fs = require('fs');

// results.js 파일 읽기
const resultsContent = fs.readFileSync('./results.js', 'utf8');

// 정규식으로 성향 코드와 이름 추출
const codePattern = /(\w{4}):\s*{[^}]*?name:\s*"([^"]+)"/g;
let match;

console.log('=== results.js의 성향 이름들 ===');
while ((match = codePattern.exec(resultsContent)) !== null) {
    console.log(`${match[1]}: ${match[2]}`);
}