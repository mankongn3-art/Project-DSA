// backend/utils/benchmark.mjs
// วัดเวลา Merge Sort (ของจริงในโปรเจกต์) เทียบกับ Bubble Sort
// รัน:  cd backend && node utils/benchmark.mjs

import * as mod from './mergeSort.js';

// รองรับทั้ง export แบบ ESM (named/default) และ CommonJS (module.exports)
const mergeSortFn =
  mod.mergeSort ?? mod.default?.mergeSort ?? mod.default;

if (typeof mergeSortFn !== 'function') {
  throw new Error('หา mergeSort ใน mergeSort.js ไม่เจอ ตรวจชื่อ export อีกครั้ง');
}

// ===== จุดที่อาจต้องแก้ 1 บรรทัด =====
// ถ้า mergeSort ของคุณรับ (array, compareFn) ใช้แบบนี้ได้เลย
// ถ้ารับ (array, key, order) ให้เปลี่ยนเป็น mergeSortFn(arr, 'winRate', 'desc')
const runMerge = (arr) => mergeSortFn(arr, (a, b) => b.winRate - a.winRate);
// =====================================

// Bubble Sort (เรียงมากไปน้อยตาม winRate เหมือนกัน)
function bubbleSort(input) {
  const arr = input.slice();
  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j].winRate < arr[j + 1].winRate) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}

// สร้างข้อมูลจำลองหน้าตาเหมือนฮีโร่จริง
function makeData(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    winRate: Math.random() * 20 + 40, // 40–60%
  }));
}

// เวลาเฉลี่ย (median) ของหลายรอบ ลด noise
function timeMs(fn, data, runs) {
  const times = [];
  for (let r = 0; r < runs; r++) {
    const copy = data.map((x) => ({ ...x }));
    const t0 = performance.now();
    fn(copy);
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

// ตรวจความถูกต้องก่อน: ผลต้องเรียงถูกจริง
const check = makeData(500);
const expected = check.map((x) => x.winRate).sort((a, b) => b - a);
const got = runMerge(check.map((x) => ({ ...x }))).map((x) => x.winRate);
if (JSON.stringify(expected) !== JSON.stringify(got)) {
  throw new Error('Merge Sort ผลไม่ถูกต้อง ตรวจ runMerge หรือ mergeSort.js');
}
console.log('ตรวจความถูกต้อง: ผ่าน\n');

// 130 ≈ จำนวนฮีโร่จริง, ที่เหลือจำลองกรณีข้อมูลโตขึ้น
const sizes = [130, 1000, 5000, 10000];
const rows = [];

for (const n of sizes) {
  const data = makeData(n);
  const runs = n >= 5000 ? 5 : 21;
  const merge = timeMs(runMerge, data, runs);
  const bubble = timeMs(bubbleSort, data, runs);
  rows.push({ n, merge, bubble, ratio: bubble / merge });
}

// พิมพ์เป็นตาราง markdown พร้อมวางใน README
console.log('| จำนวนข้อมูล (n) | Merge Sort (ms) | Bubble Sort (ms) | Bubble ช้ากว่า (เท่า) |');
console.log('|---|---|---|---|');
for (const r of rows) {
  console.log(
    `| ${r.n} | ${r.merge.toFixed(3)} | ${r.bubble.toFixed(3)} | ${r.ratio.toFixed(1)}x |`
  );
}
