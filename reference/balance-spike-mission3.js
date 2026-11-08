function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));
function greedyServe(needs,water){const s=[...needs].sort((a,b)=>a-b);let c=0;for(const x of s){if(water>=x){water-=x;c++}else break}return [c,water]}
function naiveServe(needs,water){let c=0;for(const x of needs){const d=Math.min(x,water);water-=d;if(d>=x)c++}return [c,water]}
const pat='WdWddWWdWd';
for(const seed of [3003,5003]){let r=rng(seed);const days=[...pat].map(p=>{const needs=[];for(let i=0;i<40;i++)needs.push(ri(r,1,3));return{needs,well:p=='W'?120:30}});
const run=(serve,useTank)=>{let tank=0,s=0;for(const d of days){let w=d.well+(useTank?tank:0);tank=0;const[c,l]=serve(d.needs,w);s+=c/40;if(useTank)tank=Math.min(60,l)}return(s/10).toFixed(3)};
console.log(seed,'naive',run(naiveServe,0),'greedy',run(greedyServe,0),'naiveTank',run(naiveServe,1),'greedyTank',run(greedyServe,1));}
for(const seed of [1002,2002]){let r=rng(seed);let out=[];for(let d=0;d<5;d++){const needs=[];for(let i=0;i<20;i++)needs.push(ri(r,1,4));out.push(greedyServe(needs,35)[0]+'/'+naiveServe(needs,35)[0])}console.log('s2',out.join(' '))}
