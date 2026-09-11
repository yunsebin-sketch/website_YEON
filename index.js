// 브라우저가 이전 스크롤 위치를 복원해서 중간 지점부터 보이는 것을 방지
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
document.body.scrollTop = 0;

const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');
const lineTrack = document.getElementById('line-track');
const connectLine = document.getElementById('connect-line');
const connectSection = document.getElementById('connect-section');
const networkSection = document.getElementById('network-section');
const constellationLines = Array.from(document.querySelectorAll('.constellation-line'));
const constellationNodes = Array.from(document.querySelectorAll('.constellation-node'));
let ticking = false;

function showMain() {
  introScreen.style.opacity = '0';
  setTimeout(() => {
    introScreen.style.display = 'none';
    mainContent.style.display = 'block';
    updateScrollEffects();
    initConstellation();
  }, 1000); // fade out 애니메이션 대기
  sessionStorage.setItem('yeonIntroShown', '1');
}

// 같은 세션에서 인트로를 이미 봤다면(다른 페이지에서 로고 클릭 등으로 돌아온 경우)
// 모션그래픽 없이 바로 메인 화면을 보여줌
if (sessionStorage.getItem('yeonIntroShown') === '1') {
  introScreen.style.display = 'none';
  mainContent.style.animation = 'none';
  mainContent.style.opacity = '1';
  mainContent.style.display = 'block';
  updateScrollEffects();
  initConstellation();
} else {
  // 클릭하면 바로 인트로 스킵
  introScreen.addEventListener('click', showMain);

  // 인트로 애니메이션이 끝난 직후 자동으로 메인 화면으로 전환
  setTimeout(() => {
    if (introScreen.style.display !== 'none') {
      showMain();
    }
  }, 4500);
}

// 스크롤에 따라 검은 선이 자라나며 CONNECT 섹션을 연결
function updateScrollEffects() {
  const rect = lineTrack.getBoundingClientRect();
  const trackHeight = rect.height;
  const total = trackHeight + window.innerHeight * 0.6;
  let progress = (window.innerHeight - rect.top) / total;
  progress = Math.min(1, Math.max(0, progress));

  connectLine.style.height = (progress * 100) + '%';

  if (progress > 0.85) {
    connectSection.classList.add('visible');
  } else {
    connectSection.classList.remove('visible');
  }
  ticking = false;
}

// 因緣 별자리: 선을 그리기 전 초기 상태(숨김)로 세팅
function initConstellation() {
  constellationLines.forEach((line) => {
    const length = line.getTotalLength();
    line.style.strokeDasharray = length;
    line.style.strokeDashoffset = length;
  });
}

// 별자리가 화면에 보이는 순간 왼쪽 점부터 오른쪽 점까지 순서대로 그려짐
let constellationTriggered = false;
function revealConstellation() {
  if (constellationTriggered) return;
  constellationTriggered = true;

  constellationLines.forEach((line, i) => {
    line.style.transition = 'stroke-dashoffset 0.7s ease';
    setTimeout(() => {
      line.style.strokeDashoffset = '0';
    }, i * 350);
  });

  constellationNodes.forEach((node, i) => {
    setTimeout(() => {
      node.classList.add('visible');
    }, i * 350);
  });
}

const networkObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    networkSection.classList.toggle('visible', entry.isIntersecting);
    if (entry.isIntersecting) {
      revealConstellation();
    }
  });
}, { threshold: 0.3 });
networkObserver.observe(networkSection);

document.body.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}, { passive: true });

window.addEventListener('resize', updateScrollEffects);
