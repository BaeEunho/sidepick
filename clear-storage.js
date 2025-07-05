// 브라우저 콘솔에서 실행할 스크립트
// localStorage 완전 정리

console.log('현재 localStorage 내용:');
console.log('sidepick-test-progress:', localStorage.getItem('sidepick-test-progress'));
console.log('sidepick-test-result:', localStorage.getItem('sidepick-test-result'));

// 모든 SidePick 관련 데이터 삭제
localStorage.removeItem('sidepick-test-progress');
localStorage.removeItem('sidepick-test-result');

console.log('localStorage 정리 완료!');
console.log('페이지를 새로고침하세요.');